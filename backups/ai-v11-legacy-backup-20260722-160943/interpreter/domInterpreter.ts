import type { NormalizedTsx } from "../ast/normalize";
import type { InterpretedJsx } from "./jsxInterpreter";
import { interpretJsx } from "./jsxInterpreter";
import type { EvaluationBudgets } from "./staticEvaluator";

/** Static DOM extraction boundary. It intentionally delegates to AST walking and never creates DOM nodes. */
export function interpretStaticDom(source: NormalizedTsx, budgets: Partial<EvaluationBudgets> = {}): InterpretedJsx {
  return interpretJsx(source, budgets);
}
