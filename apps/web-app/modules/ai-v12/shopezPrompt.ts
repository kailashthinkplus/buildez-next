export function buildShopezPrompt(siteSlug: string): string {
  return `
SHOPEZ COMMERCE REQUIREMENTS

This website has ShopEZ commerce enabled.

ShopEZ is the canonical source of truth for all commerce data, including:
- products
- product names and descriptions
- product images
- prices and compare-at prices
- currency
- stock and availability
- variants and options
- categories and collections
- product handles and URLs
- cart contents and totals
- checkout data

CANONICAL STOREFRONT API

Load commerce data from:

  /api/public/shopez/store?siteSlug=${siteSlug}

Never replace this API with a hardcoded local catalogue.

MANDATORY PRODUCT FEED ARCHITECTURE

All product grids, product carousels, featured-product sections, new-arrival
sections, best-seller sections, recommendations and category results must be
rendered from ShopEZ product records.

Use reusable components such as:

  src/lib/shopez.ts
  src/components/shopez/ProductFeed.tsx
  src/components/shopez/ProductCard.tsx
  src/components/shopez/ProductPrice.tsx
  src/components/shopez/ProductDetail.tsx

The exact filenames may differ when appropriate, but the architecture must
remain data-driven.

A product feed must follow this semantic pattern:

  const store = await loadShopezStore();
  const products = selectShopezProducts(store, {
    category: "...",
    collection: "...",
    limit: 8,
    sort: "newest"
  });

  return products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ));

The ProductCard is a reusable visual template. Its layout, styling,
typography, effects, responsive behaviour and interactions may be designed
freely, but all product-specific content must come from the product object.

PRODUCT VALUES THAT MUST COME FROM SHOPEZ

- product title
- product description
- product image
- product gallery
- price
- compare-at price
- currency
- rating
- review count
- stock status
- variants
- SKU
- category
- tags
- product URL or handle
- product ID used for cart actions

FORBIDDEN

Do not generate:

  const products = [...]
  const mockProducts = [...]
  const sampleProducts = [...]
  const featuredProducts = [hardcoded records]

Do not hardcode catalogue product names, prices, inventory, images, variants
or ratings inside React page files.

Do not manually duplicate several product cards containing different static
product information.

Do not use localStorage, static JSON imported by React or frontend constants
as the product catalogue.

Do not create a separate hardcoded React page for every product.

Do not create fake cart totals or fake checkout records.

PRODUCT LIST SECTIONS

Sections such as:

- New Arrivals
- Featured Products
- Best Sellers
- Shop All
- Recommended Products
- Related Products
- Category Products
- Collection Products

must be live ShopEZ feeds.

The heading and visual styling may be static design content. The products
displayed beneath the heading must come from ShopEZ.

PRODUCT DETAIL PAGES

Create a reusable dynamic product-detail route.

Resolve the current product from ShopEZ using the route handle, slug or ID.

The product-detail page must render its title, gallery, price, description,
variants, availability and cart action from the resolved ShopEZ product.

Do not generate individual hardcoded product-detail files for every product.

CATEGORY AND COLLECTION PAGES

Category and collection pages must filter ShopEZ records dynamically.

Adding a product to a category or collection in ShopEZ must make it appear
without regenerating the React project.

DATA FRESHNESS

The generated website must automatically reflect:

- newly added products
- changed prices
- changed product images
- stock changes
- unpublished products
- updated titles and descriptions
- category and collection changes

Do not copy ShopEZ product records into the generated page source.

LOADING AND EMPTY STATES

Implement polished loading, error and empty states.

When ShopEZ currently contains products, render those existing products.

When ShopEZ contains no products:

1. Do not insert fallback product records into React.
2. Continue using the canonical ShopEZ API in the storefront.
3. Render a polished empty state until products are provisioned.
4. Generate a starter catalogue manifest at:

   src/buildez.shopez-products.json

The manifest must contain products suitable for the user's requested
business and design.

Use this shape:

{
  "version": 1,
  "siteSlug": "${siteSlug}",
  "createOnlyWhenShopIsEmpty": true,
  "products": [
    {
      "title": "Product title",
      "handle": "product-handle",
      "description": "Product description",
      "vendor": "Brand",
      "productType": "Category",
      "status": "ACTIVE",
      "tags": ["tag"],
      "images": ["https://example.com/product.jpg"],
      "variants": [
        {
          "title": "Default",
          "sku": "SKU-001",
          "price": "999",
          "compareAtPrice": "",
          "cost": "",
          "inventory": "10",
          "barcode": "",
          "weightGrams": ""
        }
      ],
      "seoTitle": "SEO title",
      "seoDescription": "SEO description",
      "trackQuantity": true,
      "continueSelling": false,
      "storySections": []
    }
  ]
}

This manifest is a server-side ShopEZ provisioning contract.

Never import src/buildez.shopez-products.json into frontend React code.
Never render products directly from this manifest.

CART ACTIONS

Add-to-cart and buy-now actions must use the current ShopEZ product and
variant identifiers.

Do not hardcode product IDs in buttons.

CANVAS EDITABILITY

Keep the visual product-card structure clean and reusable so Builder 3 can
select and edit its image area, heading, price, badges and button styling.

The design should represent one reusable product-card template repeated with
live ShopEZ records, not individually authored static cards.
`.trim();
}
