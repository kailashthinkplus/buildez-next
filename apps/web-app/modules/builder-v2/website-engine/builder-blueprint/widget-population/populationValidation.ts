import { PremiumWidgetDefinitions } from "../../../widgets/premium";
import type { ProductionWidgetPopulationContract, WidgetPopulationContext, WidgetPopulationDiagnostic } from "./contracts";

const demo = /my first site|your company|first item|second item|lorem ipsum|placeholder|step [1-9]/i;
const empty = (value: unknown) => value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

export function validateWidgetPopulation(contract: ProductionWidgetPopulationContract, context: WidgetPopulationContext, props: Readonly<Record<string, unknown>>) {
  const diagnostics: WidgetPopulationDiagnostic[] = [];
  for (const path of contract.requiredProps) if (empty(props[path])) diagnostics.push({ code:"required-prop-missing",severity:"error",path:`props.${path}`,message:`${contract.widgetType} requires ${path}.` });
  const items = Array.isArray(props.items) ? props.items : [];
  if (items.length < contract.minimumItems || items.length > contract.maximumItems) diagnostics.push({ code:"item-count-invalid",severity:"error",path:"props.items",message:`Expected ${contract.minimumItems}-${contract.maximumItems} items; received ${items.length}.` });
  for (const fact of contract.requiredVerifiedFacts) if (empty(context.knownFacts[fact])) diagnostics.push({ code:"verified-fact-missing",severity:"error",path:`knownFacts.${fact}`,message:`Verified ${fact} is required; it will not be fabricated.` });
  const defaults = PremiumWidgetDefinitions.find((definition) => definition.type === contract.widgetType)?.defaultNode.props ?? {};
  for (const [key,value] of Object.entries(props)) if (JSON.stringify(value) === JSON.stringify(defaults[key])) diagnostics.push({ code:"default-value-leaked",severity:"error",path:`props.${key}`,message:`Value is unchanged from the registered demo default.` });
  for (const [key,value] of Object.entries(props)) if (typeof value === "string" && demo.test(value)) diagnostics.push({ code:"demo-content",severity:"error",path:`props.${key}`,message:"Demo or placeholder content is not production population." });
  if (items.some((item) => typeof item !== "string" || !item.trim() || demo.test(item))) diagnostics.push({ code:"invalid-item",severity:"error",path:"props.items",message:"Items must be non-empty, supported editable strings without demo labels." });
  return Object.freeze(diagnostics);
}
