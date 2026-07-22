import { fidelityDiagnostic, type FidelityDiagnostic, type FidelityLocation } from "../diagnostics/fidelity";

export type StaticPrimitive = string | number | boolean | null;
export type StaticValue = StaticPrimitive | StaticValue[] | { [key: string]: StaticValue } | StaticJsxValue;
export type StaticJsxValue = Readonly<{ kind: "jsx"; nodes: readonly any[] }>;
export type StaticEnvironment = Readonly<Record<string, StaticValue>>;

export type EvaluationBudgets = Readonly<{
  maxArraySize: number;
  maxExpansionCount: number;
  maxAstDepth: number;
  maxNodeCount: number;
  maxOperations: number;
  maxComponentDepth: number;
}>;

export const DEFAULT_EVALUATION_BUDGETS: EvaluationBudgets = Object.freeze({
  maxArraySize: 24,
  maxExpansionCount: 128,
  maxAstDepth: 64,
  maxNodeCount: 500,
  maxOperations: 5000,
  maxComponentDepth: 12,
});

export type EvaluationState = {
  operations: number;
  expansions: number;
  nodes: number;
  diagnostics: FidelityDiagnostic[];
  budgets: EvaluationBudgets;
  file: string;
};

export function createEvaluationState(file: string, budgets: Partial<EvaluationBudgets> = {}): EvaluationState {
  return { operations: 0, expansions: 0, nodes: 0, diagnostics: [], budgets: { ...DEFAULT_EVALUATION_BUDGETS, ...budgets }, file };
}

function location(state: EvaluationState, node: any): FidelityLocation {
  return { file: state.file, line: node?.loc?.start?.line ?? 1, column: (node?.loc?.start?.column ?? 0) + 1 };
}

function fail(state: EvaluationState, node: any, code: string, message: string, recommendation: string) {
  state.diagnostics.push(fidelityDiagnostic({ code, severity: "error", message, location: location(state, node), recommendedLowering: recommendation }));
  return undefined;
}

function tick(state: EvaluationState, node: any, depth: number): boolean {
  state.operations += 1;
  if (state.operations > state.budgets.maxOperations) {
    fail(state, node, "EVALUATION_OPERATION_BUDGET", "Static evaluation operation budget exceeded.", "Reduce source expression complexity.");
    return false;
  }
  if (depth > state.budgets.maxAstDepth) {
    fail(state, node, "AST_DEPTH_BUDGET", "Static AST depth budget exceeded.", "Flatten nested static expressions.");
    return false;
  }
  return true;
}

export function evaluateStatic(node: any, env: StaticEnvironment, state: EvaluationState, depth = 0): StaticValue | undefined {
  if (!node || !tick(state, node, depth)) return undefined;
  switch (node.type) {
    case "StringLiteral": case "NumericLiteral": case "BooleanLiteral": return node.value;
    case "NullLiteral": return null;
    case "TSAsExpression":
    case "TSTypeAssertion":
    case "TSNonNullExpression":
    case "TypeCastExpression":
      return evaluateStatic(node.expression, env, state, depth + 1);
    case "Identifier":
      if (node.name === "undefined") return undefined;
      return Object.prototype.hasOwnProperty.call(env, node.name)
        ? env[node.name]
        : fail(state, node, "UNRESOLVED_IDENTIFIER", `Identifier '${node.name}' is not statically bound.`, "Bind it to a local literal, object, or bounded array.");
    case "ArrayExpression": {
      if (node.elements.length > state.budgets.maxArraySize) return fail(state, node, "STATIC_ARRAY_BUDGET", `Static array has ${node.elements.length} items; limit is ${state.budgets.maxArraySize}.`, "Reduce the fixture array size.");
      const values: StaticValue[] = [];
      for (const element of node.elements) {
        const value = evaluateStatic(element, env, state, depth + 1);
        if (value === undefined) return undefined;
        values.push(value);
      }
      return values;
    }
    case "ObjectExpression": {
      const result: Record<string, StaticValue> = {};
      for (const property of node.properties) {
        if (property.type !== "ObjectProperty" || property.computed) return fail(state, property, "UNSUPPORTED_OBJECT_PROPERTY", "Computed or spread object properties are not supported.", "Use explicit static object keys.");
        const key = property.key.name ?? property.key.value;
        const value = evaluateStatic(property.value, env, state, depth + 1);
        if (value === undefined) return undefined;
        result[String(key)] = value;
      }
      return result;
    }
    case "MemberExpression": {
      if (node.computed && node.property.type !== "StringLiteral" && node.property.type !== "NumericLiteral") return fail(state, node, "DYNAMIC_PROPERTY_ACCESS", "Dynamic computed property access is not supported.", "Use a static property name.");
      const object = evaluateStatic(node.object, env, state, depth + 1);
      const key = node.computed ? node.property.value : node.property.name;
      if ((Array.isArray(object) || (object && typeof object === "object" && !("kind" in object))) && key in object) return (object as any)[key];
      return fail(state, node, "UNRESOLVED_PROPERTY", `Property '${String(key)}' could not be resolved statically.`, "Ensure the object and property are local static values.");
    }
    case "TemplateLiteral": {
      let output = "";
      for (let index = 0; index < node.quasis.length; index += 1) {
        output += node.quasis[index].value.cooked ?? "";
        if (node.expressions[index]) {
          const value = evaluateStatic(node.expressions[index], env, state, depth + 1);
          if (!["string", "number", "boolean"].includes(typeof value)) return fail(state, node.expressions[index], "UNSUPPORTED_TEMPLATE_VALUE", "Template operand is not a static primitive.", "Use a string, number, or boolean operand.");
          output += String(value);
        }
      }
      return output;
    }
    case "UnaryExpression": {
      const value = evaluateStatic(node.argument, env, state, depth + 1);
      if (node.operator === "!" ) return !value;
      if (node.operator === "+" && typeof value === "number") return value;
      if (node.operator === "-" && typeof value === "number") return -value;
      return fail(state, node, "UNSUPPORTED_UNARY_EXPRESSION", `Unary operator '${node.operator}' is unsupported.`, "Use a static boolean or number expression.");
    }
    case "BinaryExpression": {
      const left = evaluateStatic(node.left, env, state, depth + 1);
      const right = evaluateStatic(node.right, env, state, depth + 1);
      switch (node.operator) {
        case "+": return typeof left === "string" || typeof right === "string" ? `${String(left)}${String(right)}` : typeof left === "number" && typeof right === "number" ? left + right : undefined;
        case "-": return typeof left === "number" && typeof right === "number" ? left - right : undefined;
        case "*": return typeof left === "number" && typeof right === "number" ? left * right : undefined;
        case "/": return typeof left === "number" && typeof right === "number" ? left / right : undefined;
        case "===": return left === right;
        case "!==": return left !== right;
        case "<": return typeof left === "number" && typeof right === "number" ? left < right : undefined;
        case "<=": return typeof left === "number" && typeof right === "number" ? left <= right : undefined;
        case ">": return typeof left === "number" && typeof right === "number" ? left > right : undefined;
        case ">=": return typeof left === "number" && typeof right === "number" ? left >= right : undefined;
        default: return fail(state, node, "UNSUPPORTED_BINARY_EXPRESSION", `Binary operator '${node.operator}' is unsupported.`, "Use static arithmetic, equality, or numeric comparison.");
      }
    }
    case "CallExpression": {
      if (node.callee?.type === "MemberExpression" && !node.callee.computed) {
        const object = evaluateStatic(node.callee.object, env, state, depth + 1);
        const method = node.callee.property?.name;
        const args = node.arguments.map((argument: any) => evaluateStatic(argument, env, state, depth + 1));
        if (Array.isArray(object) && method === "slice" && args.every((item: StaticValue | undefined) => item === undefined || typeof item === "number"))
          return object.slice(args[0] as number | undefined, args[1] as number | undefined);
        if (Array.isArray(object) && method === "join" && (args[0] === undefined || typeof args[0] === "string"))
          return object.map(String).join(args[0] as string | undefined);
        if (typeof object === "string" && method === "toUpperCase" && args.length === 0)
          return object.toUpperCase();
        if (typeof object === "string" && method === "toLowerCase" && args.length === 0)
          return object.toLowerCase();
        if (typeof object === "string" && method === "trim" && args.length === 0)
          return object.trim();
        if (typeof object === "string" && method === "slice" && args.every((item: StaticValue | undefined) => item === undefined || typeof item === "number"))
          return object.slice(args[0] as number | undefined, args[1] as number | undefined);
        if (typeof object === "string" && method === "padStart" && typeof args[0] === "number" && (args[1] === undefined || typeof args[1] === "string"))
          return object.padStart(args[0], args[1] as string | undefined);
        if (typeof object === "string" && method === "padEnd" && typeof args[0] === "number" && (args[1] === undefined || typeof args[1] === "string"))
          return object.padEnd(args[0], args[1] as string | undefined);
      }
      if (node.callee?.type === "Identifier" && node.callee.name === "String" && node.arguments.length === 1) {
        const value = evaluateStatic(node.arguments[0], env, state, depth + 1);
        if (["string", "number", "boolean"].includes(typeof value)) return String(value);
      }
      return fail(state, node, "UNSUPPORTED_STATIC_CALL", "This function call is not supported by the static evaluator.", "Use a bounded array slice/join or a directly bound static value.");
    }
    case "ConditionalExpression": {
      const condition = evaluateStatic(node.test, env, state, depth + 1);
      if (typeof condition !== "boolean") return fail(state, node.test, "NON_STATIC_CONDITION", "Ternary condition is not a static boolean.", "Use a statically bound boolean condition.");
      return evaluateStatic(condition ? node.consequent : node.alternate, env, state, depth + 1);
    }
    case "LogicalExpression": {
      const left = evaluateStatic(node.left, env, state, depth + 1);
      if (node.operator === "&&") return left ? evaluateStatic(node.right, env, state, depth + 1) : left as StaticValue;
      if (node.operator === "||") return left ? left as StaticValue : evaluateStatic(node.right, env, state, depth + 1);
      if (node.operator === "??") return left !== null && left !== undefined ? left as StaticValue : evaluateStatic(node.right, env, state, depth + 1);
      return fail(state, node, "UNSUPPORTED_LOGICAL_OPERATOR", `Logical operator '${node.operator}' is unsupported.`, "Use a static logical expression.");
    }
    case "JSXElement": case "JSXFragment": return Object.freeze({ kind: "jsx", nodes: Object.freeze([node]) });
    default:
      return fail(state, node, "UNSUPPORTED_RUNTIME_EXPRESSION", `Expression '${node.type}' is outside the static evaluator.`, "Replace it with literals, static property access, a supported ternary, logical AND, or bounded array map.");
  }
}

export function collectTopLevelBindings(ast: any, state: EvaluationState): StaticEnvironment {
  return collectStaticBindings(ast?.program?.body ?? [], state);
}

export function collectStaticBindings(
  statements: readonly any[],
  state: EvaluationState,
  base: StaticEnvironment = {},
): StaticEnvironment {
  const env: Record<string, StaticValue> = { ...base };
  for (const statement of statements) {
    const declaration = statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;
    if (declaration?.type !== "VariableDeclaration") continue;
    for (const item of declaration.declarations) {
      if (item.id?.type !== "Identifier" || !item.init || ["ArrowFunctionExpression", "FunctionExpression"].includes(item.init.type)) continue;
      const value = evaluateStatic(item.init, env, state);
      if (value !== undefined) env[item.id.name] = value;
    }
  }
  return Object.freeze(env);
}
