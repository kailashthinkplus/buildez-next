import type { EngineResult } from "../sdk";
import { runDesignEngine } from "./DesignEngine";
import type { DesignInput, DesignResult } from "./designIntent";

export type RunDesignInput = DesignInput;

export function runDesign(input: RunDesignInput = {}): EngineResult<DesignResult> {
  return runDesignEngine(input);
}
