import type { WidgetProperty } from "../../types/property";

/* ==========================================================
   Property Registry
========================================================== */

class Registry {
  private registry = new Map<
    string,
    WidgetProperty[]
  >();

  register(
    widget: string,
    properties: WidgetProperty[]
  ) {
    this.registry.set(widget, properties);
  }

  get(widget: string) {
    return this.registry.get(widget) ?? [];
  }

  has(widget: string) {
    return this.registry.has(widget);
  }

  getAll() {
    return this.registry;
  }
}

export const PropertyRegistry =
  new Registry();