import { WidgetRegistry } from "./WidgetRegistry";

/* ==========================================================
   CORE WIDGETS
========================================================== */

import { PageDefinition } from "../../widgets/page";
import { SectionDefinition } from "../../widgets/section";
import { ContainerDefinition } from "../../widgets/container";
import { ColumnDefinition } from "../../widgets/column";
import { HeadingDefinition } from "../../widgets/heading";
import { TextDefinition } from "../../widgets/text";
import { ButtonDefinition } from "../../widgets/button";
import { ImageDefinition } from "../../widgets/image";
import { VideoDefinition } from "../../widgets/video";
import { IconDefinition } from "../../widgets/icon";
import { DividerDefinition } from "../../widgets/divider";
import { SpacerDefinition } from "../../widgets/spacer";
import { PremiumWidgetDefinitions } from "../../widgets/premium";

/* ==========================================================
   REGISTER ALL WIDGETS
========================================================== */

const widgets = [
  PageDefinition,
  SectionDefinition,
  ContainerDefinition,
  ColumnDefinition,
  HeadingDefinition,
  TextDefinition,
  ButtonDefinition,
  ImageDefinition,
  VideoDefinition,
  IconDefinition,
  DividerDefinition,
  SpacerDefinition,
  ...PremiumWidgetDefinitions,
] as const;

let registered = false;

export function registerWidgets(): void {
  if (registered) return;

  for (const widget of widgets) {
    WidgetRegistry.register(widget);
  }

  registered = true;

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[Builder] Registered ${widgets.length} widgets`
    );
  }
}
