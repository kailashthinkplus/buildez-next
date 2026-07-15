import type { SemanticSection } from "../recipes";
import type { ComponentVariantCompiler } from "./ComponentVariantCompiler";
import { HeroAppointmentFocusedCompiler } from "./hero/HeroAppointmentFocusedRecipe";
import { HeroBookingFocusedCompiler } from "./hero/HeroBookingFocusedRecipe";
import { HeroEditorialSplitCompiler } from "./hero/HeroEditorialSplitRecipe";
import { HeroProductValueCompiler } from "./hero/HeroProductValueRecipe";
import { GalleryLifestyleRailCompiler } from "./gallery/GalleryLifestyleRailCompiler";
import { GalleryMasonryEditorialCompiler } from "./gallery/GalleryMasonryEditorialCompiler";
import { CourseCataloguePreviewCompiler, MenuPreviewCardsCompiler, ProductFeatureStackCompiler, ServiceMatrixCardsCompiler, VehicleServiceMatrixCompiler } from "./content";

const componentVariantCompilers = Object.freeze({
  HeroEditorialSplit01: HeroEditorialSplitCompiler,
  HeroProductValue01: HeroProductValueCompiler,
  HeroBookingFocused01: HeroBookingFocusedCompiler,
  HeroAppointmentFocused01: HeroAppointmentFocusedCompiler,
  GalleryMasonryEditorial01: GalleryMasonryEditorialCompiler,
  GalleryLifestyleRail01: GalleryLifestyleRailCompiler,
  ServiceMatrixCards01: ServiceMatrixCardsCompiler,
  VehicleServiceMatrix01: VehicleServiceMatrixCompiler,
  ProductFeatureStack01: ProductFeatureStackCompiler,
  MenuPreviewCards01: MenuPreviewCardsCompiler,
  CourseCataloguePreview01: CourseCataloguePreviewCompiler,
} satisfies Record<string, ComponentVariantCompiler>);

export type NativeComponentVariantCompilerId = keyof typeof componentVariantCompilers;
export type NativeComponentVariantRecipeId = NativeComponentVariantCompilerId;

export class ComponentVariantCompilerRegistry {
  static resolve(section: SemanticSection): { name: NativeComponentVariantCompilerId; compiler: ComponentVariantCompiler } | undefined {
    const id = section.componentVariantId;
    if (!id || !Object.prototype.hasOwnProperty.call(componentVariantCompilers, id)) return undefined;
    const name = id as NativeComponentVariantCompilerId;
    return { name, compiler: componentVariantCompilers[name] };
  }

  static ids() { return Object.keys(componentVariantCompilers) as NativeComponentVariantCompilerId[]; }
}

/** @deprecated Compatibility alias retained for RC-9A consumers. */
export const ComponentVariantRecipeRegistry = ComponentVariantCompilerRegistry;

export { componentVariantCompilers };
