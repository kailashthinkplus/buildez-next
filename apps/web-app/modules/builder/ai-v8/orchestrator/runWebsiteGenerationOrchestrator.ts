import { runAssetAgent } from "../agents/assetAgent";
import { runBlueprintAgent } from "../agents/blueprintAgent";
import { runContentAgent } from "../agents/contentAgent";
import { runDesignDirectionAgent } from "../agents/designDirectionAgent";
import { runIntentAgent } from "../agents/intentAgent";
import { runQAAgent } from "../agents/qaAgent";
import { runRepairAgent } from "../agents/repairAgent";
import { runSectionRecipeAgent } from "../agents/sectionRecipeAgent";
import { runSitePlannerAgent } from "../agents/sitePlannerAgent";
import type {
  AgentRunLog,
  AIWorkflowContext,
  BrandContextWithName,
} from "../agents/types";
import { runValidatorAgent } from "../agents/validatorAgent";

interface RunWebsiteGenerationInput {
  userPrompt: string;
  siteId: string;
  pageId?: string;
  brandContext: BrandContextWithName | null;
}

interface GenerateCodeInput {
  workflow: AIWorkflowContext;
}

interface RepairCodeInput {
  workflow: AIWorkflowContext;
  currentCode: string;
}

interface RunWebsiteGenerationDeps {
  generateInitialCode(input: GenerateCodeInput): Promise<string>;
  repairCode(input: RepairCodeInput): Promise<string>;
  hydrateImages(input: {
    code: string;
    workflow: AIWorkflowContext;
  }): Promise<string>;
  saveOutput?(input: {
    code: string;
    workflow: AIWorkflowContext;
  }): Promise<void>;
}

const QUALITY_THRESHOLD = 82;
const HYDRATABLE_VALIDATION_WARNINGS = new Set([
  "Contains placeholder text or image source.",
  "Uses a placeholder image service.",
]);

function pushLog(
  workflow: AIWorkflowContext,
  log: AgentRunLog
) {
  workflow.logs.push(log);
}

function hasOnlyHydratableValidationIssues(
  validation: NonNullable<AIWorkflowContext["validation"]>
) {
  return (
    validation.missingSectionIds.length === 0 &&
    validation.forbiddenWarnings.every((warning) =>
      HYDRATABLE_VALIDATION_WARNINGS.has(warning)
    )
  );
}

export async function runWebsiteGenerationOrchestrator(
  input: RunWebsiteGenerationInput,
  deps: RunWebsiteGenerationDeps
) {
  const workflow: AIWorkflowContext = {
    userPrompt: input.userPrompt,
    siteId: input.siteId,
    pageId: input.pageId,
    brandContext: input.brandContext,
    logs: [],
  };

  workflow.intent = runIntentAgent({
    userPrompt: input.userPrompt,
    brandContext: input.brandContext,
  });
  pushLog(workflow, {
    agent: "IntentAgent",
    stage: "intent",
    ok: true,
    summary: `Detected ${workflow.intent.plan.recipe.key} / ${workflow.intent.plan.useCase}.`,
  });

  workflow.sitePlan = runSitePlannerAgent(workflow.intent);
  pushLog(workflow, {
    agent: "SitePlannerAgent",
    stage: "site-plan",
    ok: true,
    summary: `Planned ${workflow.sitePlan.sections.length} sections for a ${workflow.sitePlan.pageType}.`,
  });

  workflow.designDirection = runDesignDirectionAgent({
    intent: workflow.intent,
    brandContext: input.brandContext,
  });
  pushLog(workflow, {
    agent: "DesignDirectionAgent",
    stage: "design-direction",
    ok: true,
    summary: `Selected ${workflow.designDirection.styleDirection.join(", ") || "modern"} direction.`,
  });

  workflow.content = runContentAgent(workflow.intent);
  pushLog(workflow, {
    agent: "ContentAgent",
    stage: "content",
    ok: true,
    summary: `Prepared copy rules for ${workflow.content.audience}.`,
  });

  workflow.sectionRecipes = runSectionRecipeAgent(workflow.intent);
  pushLog(workflow, {
    agent: "SectionRecipeAgent",
    stage: "section-recipes",
    ok: true,
    summary: `Locked required sections: ${workflow.sectionRecipes.requiredSectionIds.join(", ")}.`,
  });

  workflow.assets = runAssetAgent({
    userPrompt: input.userPrompt,
    intent: workflow.intent,
  });
  pushLog(workflow, {
    agent: "AssetAgent",
    stage: "assets",
    ok: true,
    summary: `Prepared image direction with minimum ${workflow.assets.minimumImages} visuals.`,
  });

  workflow.generatedCode = await runBlueprintAgent({
    workflow,
    generate: deps.generateInitialCode,
  });
  pushLog(workflow, {
    agent: "BlueprintAgent",
    stage: "blueprint",
    ok: true,
    summary: "Generated initial TSX blueprint source.",
  });

  const requiredSectionIds = workflow.sectionRecipes.requiredSectionIds;

  workflow.validation = runValidatorAgent({
    code: workflow.generatedCode,
    requiredSectionIds,
    allowHydratablePlaceholders: true,
  });
  pushLog(workflow, {
    agent: "ValidatorAgent",
    stage: "validation",
    ok: workflow.validation.valid,
    summary: workflow.validation.valid
      ? "Initial output passed structural validation."
      : "Initial output needs repair.",
    warnings: [
      ...workflow.validation.missingSectionIds.map(
        (id) => `Missing required section: ${id}`
      ),
      ...workflow.validation.forbiddenWarnings,
    ],
  });

  workflow.qa = runQAAgent({
    code: workflow.generatedCode,
    requiredSectionIds,
  });
  pushLog(workflow, {
    agent: "QAAgent",
    stage: "qa",
    ok: workflow.qa.score >= QUALITY_THRESHOLD,
    summary: `Quality score: ${workflow.qa.score}.`,
    warnings: workflow.qa.warnings,
  });

  if (!workflow.validation.valid || workflow.qa.score < QUALITY_THRESHOLD) {
    workflow.generatedCode = await runRepairAgent({
      workflow,
      currentCode: workflow.generatedCode,
      repair: deps.repairCode,
    });
    workflow.repaired = true;
    pushLog(workflow, {
      agent: "RepairAgent",
      stage: "repair",
      ok: true,
      summary: "Repaired output using validation and QA feedback.",
    });

    workflow.validation = runValidatorAgent({
      code: workflow.generatedCode,
      requiredSectionIds,
      allowHydratablePlaceholders: true,
    });
    workflow.qa = runQAAgent({
      code: workflow.generatedCode,
      requiredSectionIds,
    });

    pushLog(workflow, {
      agent: "ValidatorAgent",
      stage: "validation",
      ok: workflow.validation.valid,
      summary: workflow.validation.valid
        ? "Repaired output passed structural validation."
        : "Repaired output still has structural issues.",
      warnings: [
        ...workflow.validation.missingSectionIds.map(
          (id) => `Missing required section: ${id}`
        ),
        ...workflow.validation.forbiddenWarnings,
      ],
    });

    pushLog(workflow, {
      agent: "QAAgent",
      stage: "qa",
      ok: workflow.qa.score >= QUALITY_THRESHOLD,
      summary: `Repaired quality score: ${workflow.qa.score}.`,
      warnings: workflow.qa.warnings,
    });
  }

  if (
    !workflow.validation.valid &&
    !hasOnlyHydratableValidationIssues(workflow.validation)
  ) {
    throw new Error(
      `Generated code failed validation: ${[
        ...workflow.validation.missingSectionIds.map(
          (id) => `missing ${id}`
        ),
        ...workflow.validation.forbiddenWarnings,
      ].join(", ")}`
    );
  }

  workflow.generatedCode = await deps.hydrateImages({
    code: workflow.generatedCode,
    workflow,
  });

  workflow.validation = runValidatorAgent({
    code: workflow.generatedCode,
    requiredSectionIds,
  });

  workflow.qa = runQAAgent({
    code: workflow.generatedCode,
    requiredSectionIds,
  });

  if (!workflow.validation.valid || workflow.qa.score < QUALITY_THRESHOLD) {
    workflow.generatedCode = await runRepairAgent({
      workflow,
      currentCode: workflow.generatedCode,
      repair: deps.repairCode,
    });
    workflow.repaired = true;

    pushLog(workflow, {
      agent: "RepairAgent",
      stage: "repair",
      ok: true,
      summary: "Repaired post-hydration validation issues.",
      warnings: workflow.validation.forbiddenWarnings,
    });

    workflow.generatedCode = await deps.hydrateImages({
      code: workflow.generatedCode,
      workflow,
    });

    workflow.validation = runValidatorAgent({
      code: workflow.generatedCode,
      requiredSectionIds,
    });

    workflow.qa = runQAAgent({
      code: workflow.generatedCode,
      requiredSectionIds,
    });
  }

  if (!workflow.validation.valid) {
    throw new Error(
      `Generated code failed validation: ${[
        ...workflow.validation.missingSectionIds.map(
          (id) => `missing ${id}`
        ),
        ...workflow.validation.forbiddenWarnings,
      ].join(", ")}`
    );
  }

  await deps.saveOutput?.({
    code: workflow.generatedCode,
    workflow,
  });

  pushLog(workflow, {
    agent: "OrchestratorAgent",
    stage: "finalize",
    ok: true,
    summary: "Final output hydrated, scored, and saved.",
  });

  return {
    code: workflow.generatedCode,
    workflow,
    metadata: {
      category: workflow.intent.plan.recipe.key,
      useCase: workflow.intent.plan.useCase,
      matchedKeywords: workflow.intent.plan.matchedKeywords,
      confidence: workflow.intent.plan.confidence,
      strategy: {
        businessName: workflow.intent.strategy.brief.businessName,
        audience: workflow.intent.strategy.brief.audience,
        conversionGoal: workflow.intent.strategy.brief.conversionGoal,
        visualDirection: workflow.intent.strategy.brief.visualDirection,
      },
      quality: workflow.qa,
      repaired: !!workflow.repaired,
      agents: workflow.logs,
    },
  };
}
