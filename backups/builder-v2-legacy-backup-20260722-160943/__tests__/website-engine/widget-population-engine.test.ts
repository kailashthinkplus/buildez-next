import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NodeType } from "../../types/blueprint";
import { compileWidgetPopulation, IndustryRolePolicies, WidgetPopulationRegistry, type WidgetPopulationContext } from "../../website-engine/builder-blueprint/widget-population";

function context(widgetType: NodeType, family = "unknown", seed: string | number = 7, knownFacts: Record<string, unknown> = {}): WidgetPopulationContext {
  const role: Record<string,string> = { hero:"opening",carousel:"project-discovery",galleryLightbox:"gallery",faq:"faq",leadForm:"lead-capture",timeline:"journey",logoCloud:"trust",smartFooter:"footer",floatingWhatsApp:"sticky-action",cta:"conversion" };
  return {
    businessProfile:{ businessFamily:family } as WidgetPopulationContext["businessProfile"],
    sectionIntent:{id:`${family}.${widgetType}`,purpose:`${role[widgetType]} purpose`,type:role[widgetType],patternIds:[role[widgetType]]}, narrativeRole:role[widgetType],conversionRole:["leadForm","floatingWhatsApp","cta"].includes(widgetType) ? "conversion" : "none",
    selectedCapability:widgetType,selectedWidgetType:widgetType,knownFacts,missingFacts:[],availableAssets:[],neighbouringSections:[],generationSeed:seed,
  };
}

describe("RC-3.5B universal widget population", () => {
  it("registers immutable contracts derived from production widget support", () => {
    const required = ["hero","carousel","galleryLightbox","faq","leadForm","timeline","logoCloud","smartFooter","floatingWhatsApp","cta"];
    assert.deepEqual(WidgetPopulationRegistry.all().map((item)=>item.widgetType),required);
    for (const type of required) {
      const contract = WidgetPopulationRegistry.get(type)!;
      assert.ok(contract.requiredProps.length);
      assert.ok(contract.editablePropertyPaths.includes("props.items"));
      assert.deepEqual(contract.rendererPropShape,["eyebrow","title","body","primaryCta","secondaryCta","items"]);
      assert.ok(Object.isFrozen(contract));
    }
  });

  it("populates every fact-independent widget completely without registered demo defaults", () => {
    for (const type of ["hero","carousel","galleryLightbox","faq","leadForm","timeline","smartFooter","cta"] as NodeType[]) {
      const result = compileWidgetPopulation(context(type,"hospitality"));
      assert.equal(result.ok,true,`${type}: ${JSON.stringify(result.diagnostics)}`);
      assert.ok(result.props);
      assert.equal(result.diagnostics.some((item)=>item.code === "default-value-leaked"),false);
      assert.ok(Array.isArray(result.props.items));
    }
  });

  it("rejects widgets that require unavailable verified facts", () => {
    const logo = compileWidgetPopulation(context("logoCloud","technology_saas"));
    const whatsapp = compileWidgetPopulation(context("floatingWhatsApp","hospitality"));
    assert.equal(logo.ok,false);
    assert.equal(whatsapp.ok,false);
    assert.ok(logo.diagnostics.some((item)=>item.code === "verified-fact-missing"));
    assert.ok(whatsapp.diagnostics.some((item)=>item.code === "verified-fact-missing"));
    assert.equal(logo.replacementRecommendation?.widgetType,"cta");
  });

  it("is deterministic for a seed and allows seeded presentation variation", () => {
    const first = compileWidgetPopulation(context("hero","healthcare",104729));
    const again = compileWidgetPopulation(context("hero","healthcare",104729));
    assert.deepEqual(first,again);
    const variants = new Set(Array.from({length:8},(_,seed)=>compileWidgetPopulation(context("hero","healthcare",seed)).props?.variant));
    assert.ok(variants.size > 1);
  });

  it("covers five declarative industry policies without fixture terms", () => {
    for (const family of ["real_estate","healthcare","technology_saas","hospitality","automotive"]) assert.ok(IndustryRolePolicies.some((policy)=>policy.businessFamily === family));
    const outputs = ["real_estate","healthcare","technology_saas","hospitality","automotive"].map((family)=>compileWidgetPopulation(context("hero",family)).props?.title);
    assert.equal(new Set(outputs).size,5,"section-scoped semantic slots must not collapse cross-industry content into one token");
    assert.equal(JSON.stringify({IndustryRolePolicies,outputs}).includes("104729"),false);
  });
});
