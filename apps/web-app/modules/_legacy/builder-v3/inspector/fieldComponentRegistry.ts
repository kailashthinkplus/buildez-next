// /modules/builder/inspector/fieldComponentRegistry.ts

import TextField from "./fields/TextField";
import NumberField from "./fields/NumberField";
import SelectField from "./fields/SelectField";
import SwitchField from "./fields/SwitchField";
import ColorField from "./fields/ColorField";
import SliderField from "./fields/SliderField";
import BoxSpacingField from "./fields/BoxSpacingField";
import GridColumnsField from "./fields/GridColumnsField";
import ShadowField from "./fields/ShadowField";
import ImageField from "./ImageField";
import RichTextField from "./RichTextField";

export const FIELD_COMPONENTS: Record<string, any> = {
  text: TextField,
  textarea: TextField,
  number: NumberField,
  select: SelectField,
  switch: SwitchField,
  color: ColorField,
  slider: SliderField,
  spacing: BoxSpacingField,
  gridColumns: GridColumnsField,
  shadow: ShadowField,
  image: ImageField,
  richtext: RichTextField,
  repeater: null, // added later in Step 13C (repeater UI)
  "layout-flex": null, // handled by LayoutTab, not content tab
};
