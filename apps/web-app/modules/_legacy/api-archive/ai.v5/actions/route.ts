import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/getAuthContext";

import { runLayoutStage } from "../stages/layout";
import { runContentStage } from "../stages/content";
import { runStyleStage } from "../stages/style";
import { runVisualStage } from "../stages/visual";

/* ============================================================
   AI ACTIONS ROUTE (AUTHORITATIVE, DEBUG-SAFE)
============================================================ */

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();

  if (!auth?.userId || !auth?.tenantId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { stage, payload } = body ?? {};

  if (!stage || !payload) {
    return NextResponse.json(
      { error: "Missing stage or payload" },
      { status: 400 }
    );
  }

  console.group(`[AI ACTIONS] Stage → ${stage}`);
  console.log("Payload keys:", Object.keys(payload || {}));
  console.log("Intent length:", payload.intent?.length ?? 0);

  try {
    let result: any;

    switch (stage) {
      case "layout":
        result = await runLayoutStage(payload);
        break;

      case "content":
        result = await runContentStage(payload);
        break;

      case "style":
        result = await runStyleStage(payload);
        break;

      case "visual":
        result = await runVisualStage(payload);
        break;

      default:
        console.warn("[AI ACTIONS] Unknown stage:", stage);
        console.groupEnd();
        return NextResponse.json(
          { error: "Unknown stage" },
          { status: 400 }
        );
    }

    /* --------------------------------------------------------
       HARD SHAPE CHECK (NO RETRIES)
    -------------------------------------------------------- */

    if (!result || typeof result !== "object") {
      console.error("[AI ACTIONS] Invalid result type", result);
      console.groupEnd();
      return NextResponse.json(
        { error: "AI returned invalid result" },
        { status: 422 }
      );
    }

    if (
      !Array.isArray(result.actions) &&
      !result.designTokens
    ) {
      console.error("[AI ACTIONS] Missing actions/designTokens", result);
      console.groupEnd();
      return NextResponse.json(
        { error: "AI response missing actions" },
        { status: 422 }
      );
    }

    console.log(
      "Actions:",
      Array.isArray(result.actions)
        ? result.actions.length
        : 0
    );

    if (result.designTokens) {
      console.log("DesignTokens keys:", Object.keys(result.designTokens));
    }

    console.groupEnd();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`[AI ACTIONS] Stage ${stage} FAILED`);
    console.error(err);
    console.groupEnd();

    return NextResponse.json(
      {
        error: err?.message ?? "AI stage failed",
        stage,
      },
      { status: 500 }
    );
  }
}
