import type { BuilderBlueprint } from "../../../types/blueprint";
import type { BuilderCommand } from "../../../core/commands/BuilderCommand";
import { updated } from "./repairCommandUtils";

function adjusted(current: unknown, delta: string): unknown {
  const amount = Number.parseFloat(delta);
  if (typeof current === "number" && delta.includes("%")) return Math.round(current * (1 + amount / 100) * 100) / 100;
  if (typeof current === "number") return current + amount;
  if (typeof current === "string" && Number.isFinite(amount)) {
    const number = Number.parseFloat(current);
    return Number.isFinite(number) ? current.replace(String(number), String(Math.round((delta.includes("%") ? number * (1 + amount / 100) : number + amount) * 100) / 100)) : current;
  }
  return current;
}

export class UpdateDesignTokenCommand implements BuilderCommand {
  readonly id: string;
  readonly name = "Update Design Token";
  constructor(private readonly token: string, private readonly delta: string, commandId?: string) { this.id = commandId ?? `repair.token.${token}.${delta}`; }
  canExecute(blueprint: BuilderBlueprint): boolean { return this.token.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, blueprint.theme.tokens) !== undefined; }
  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    if (!this.canExecute(blueprint)) return blueprint;
    const tokens = structuredClone(blueprint.theme.tokens) as Record<string, unknown>;
    const path = this.token.split("."); let target = tokens;
    for (const key of path.slice(0, -1)) target = target[key] as Record<string, unknown>;
    const leaf = path.at(-1)!; target[leaf] = adjusted(target[leaf], this.delta);
    return updated(blueprint, { ...blueprint.nodes }, { ...blueprint.theme, tokens } as typeof blueprint.theme);
  }
}
