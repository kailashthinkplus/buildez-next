import assert from "node:assert/strict";
import test from "node:test";

import { isBuilderNodeType } from "../../core/validation/blueprintSchema";
import { PremiumWidgetDefinitions } from "../../widgets/premium";
import { getWidgetCapability } from "../../widgets/widgetCapabilities";

test("modern carousels are native serializable Builder nodes", () => {
  const carousel = PremiumWidgetDefinitions.find((entry) => entry.type === "carousel");
  const products = PremiumWidgetDefinitions.find((entry) => entry.type === "productCarousel");

  assert.ok(carousel);
  assert.ok(products);
  assert.equal(isBuilderNodeType("productCarousel"), true);
  assert.equal(products.defaultNode.props.source, "shopez");
  assert.deepEqual(products.defaultNode.props.items, []);
  assert.equal(JSON.stringify(products.defaultNode.props).includes("Sample product"), false);
});

test("carousel behavior and commerce binding stay editable", () => {
  const carousel = getWidgetCapability("carousel");
  const products = getWidgetCapability("productCarousel");

  for (const field of ["showArrows", "showDots", "autoplay", "itemsPerView", "tabletItemsPerView", "mobileItemsPerView", "slideGap"]) {
    assert.ok(carousel?.editableProps.includes(field), `carousel should expose ${field}`);
    assert.ok(products?.editableProps.includes(field), `product carousel should expose ${field}`);
  }
  for (const field of ["source", "collectionId", "tag", "productLimit", "showPrice", "showQuickShop"]) {
    assert.ok(products?.editableProps.includes(field), `product carousel should expose ${field}`);
  }
  assert.equal(products?.runtimeParityStatus, "production-ready");
});
