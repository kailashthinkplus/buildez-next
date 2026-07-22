import type { WidgetDefinition } from "../../core/registry/WidgetRegistry";
import { ButtonDefinition } from "../../widgets/button/Button.definition";
import { ColumnDefinition } from "../../widgets/column/Column.definition";
import { ContainerDefinition } from "../../widgets/container/Container.definition";
import { DividerDefinition } from "../../widgets/divider/Divider.definition";
import { HeadingDefinition } from "../../widgets/heading/Heading.definition";
import { IconDefinition } from "../../widgets/icon/Icon.definition";
import { ImageDefinition } from "../../widgets/image/Image.definition";
import { PageDefinition } from "../../widgets/page/Page.definition";
import { SectionDefinition } from "../../widgets/section/Section.definition";
import { SpacerDefinition } from "../../widgets/spacer/Spacer.definition";
import { TextDefinition } from "../../widgets/text/Text.definition";
import { VideoDefinition } from "../../widgets/video/Video.definition";

export const CORE_WIDGET_DEFINITIONS: WidgetDefinition[] = [
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
];

export function getCoreWidgetTypesForSpec(): string[] {
  return CORE_WIDGET_DEFINITIONS.map((definition) => definition.type);
}

export function widgetHasSerializableDefaultNode(definition: WidgetDefinition): boolean {
  try {
    const serialized = JSON.stringify(definition.defaultNode);
    const parsed = JSON.parse(serialized) as unknown;
    return Boolean(parsed && typeof parsed === "object");
  } catch {
    return false;
  }
}
