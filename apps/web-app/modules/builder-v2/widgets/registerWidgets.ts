import { WidgetRegistry } from "../core/registry/WidgetRegistry";

import { PageDefinition } from "./page/Page.definition";
import { SectionDefinition } from "./section/Section.definition";
import { ContainerDefinition } from "./container/Container.definition";
import { ColumnDefinition } from "./column/Column.definition";
import { HeadingDefinition } from "./heading/Heading.definition";
import { TextDefinition } from "./text/Text.definition";
import { ButtonDefinition } from "./button/Button.definition";
import { ImageDefinition } from "./image/Image.definition";
import { VideoDefinition } from "./video/Video.definition";
import { IconDefinition } from "./icon/Icon.definition";
import { DividerDefinition } from "./divider/Divider.definition";
import { SpacerDefinition } from "./spacer/Spacer.definition";

let registered = false;

/**
 * Register all builder widgets with the global registry.
 * Called once during app initialization. Safe to call multiple times.
 */
export function registerWidgets() {
  if (registered) return;
  registered = true;

  // Core layout widgets
  WidgetRegistry.register(PageDefinition);
  WidgetRegistry.register(SectionDefinition);
  WidgetRegistry.register(ContainerDefinition);
  WidgetRegistry.register(ColumnDefinition);

  // Content widgets
  WidgetRegistry.register(HeadingDefinition);
  WidgetRegistry.register(TextDefinition);
  WidgetRegistry.register(ButtonDefinition);
  WidgetRegistry.register(ImageDefinition);
  WidgetRegistry.register(VideoDefinition);
  WidgetRegistry.register(IconDefinition);
  WidgetRegistry.register(DividerDefinition);
  WidgetRegistry.register(SpacerDefinition);
}
