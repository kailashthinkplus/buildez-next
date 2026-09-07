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

REQUIRED STOREFRONT ROUTES AND SHARED SHELL

Build a coherent multi-page store, not a single landing page. At minimum:

- / — homepage with a live ShopEZ product feed
- /shop — searchable/filterable live product listing
- /products/:handle — reusable dynamic product-detail page
- /cart — functional cart page (a drawer may also be provided)
- /checkout — functional checkout form
- /account — customer register/login, profile, order history, and logout

Every route must render one shared SiteShell with the same Header, Footer,
navigation, theme variables, logo treatment, button system, spacing rhythm,
and responsive breakpoints. Never duplicate or restyle the header/footer in
individual page files.

The header must visibly include:

- a working home/logo link
- shop navigation
- an account icon linking to /account
- a cart icon linking to /cart or opening the cart drawer
- a live quantity badge derived from cart state

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

localStorage is permitted only for the visitor's cart state. It is never a
catalogue, pricing, inventory, customer-session, or checkout source of truth.

Do not create a separate hardcoded React page for every product.

Do not add /shop, /products, /products/:handle, /cart, /checkout, /account,
category, collection, or individual product routes to src/buildez.pages.json.
That registry is only for editable content pages in the BuildEZ Pages module;
commerce application routes live in the generated router and are backed by
ShopEZ.

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
3. Render a polished empty state inside the product-feed section.
4. Keep the rest of the page visible and functional.

The BuildEZ platform provisions ShopEZ products before website generation.
Do not generate a local catalogue manifest or attempt to create products
inside frontend React code.

CART ACTIONS

Add-to-cart and buy-now actions must use the current ShopEZ product and
variant identifiers.

Do not hardcode product IDs in buttons.

Implement a shared CartProvider used by every route. It must:

- add the selected live ShopEZ variant
- update quantity
- remove a line
- clear the cart after successful checkout
- persist cart lines locally across navigation/reload
- re-resolve product/variant facts from the current ShopEZ payload
- calculate subtotal from current ShopEZ variant prices
- expose total item quantity for the header badge
- prevent unavailable variants from being added

The cart drawer/page must show the real product image, title, selected variant,
quantity, unit price, line total, subtotal, empty state, and checkout link.

CHECKOUT

Submit checkout to:

  POST /api/public/shopez/checkout

Send siteId from the canonical store response, customer/contact fields,
shipping/billing address, provider, and only variantId + quantity for cart
items. Never calculate authoritative tax, shipping, discount, or order totals
in the browser. Display values returned by the checkout API and handle
validation, stock conflict, payment handoff, confirmed, and failure states.

CUSTOMER ACCOUNT

Implement real customer registration, login, session restoration, order
history, and logout with credentials included:

  POST /api/public/shopez/account/register
  POST /api/public/shopez/account/login
  GET /api/public/shopez/account/session?siteId=<ShopEZ site id>
  DELETE /api/public/shopez/account/session

Registration and login POST bodies include siteId, email, and password;
registration may also include firstName and lastName. Use
fetch(..., { credentials: "include" }). Never store passwords or auth tokens
in React state beyond the form submission and never place them in
localStorage. Render signed-out, loading, validation/error, and signed-in
states. The signed-in view must show the customer profile and real ShopEZ
order history returned by the session endpoint.

MEDIA

Use product images returned by ShopEZ. Do not use Unsplash, Lorem Picsum,
random-image services, image-search URLs, or unrelated stock photography.
Never draw, approximate, or fake a product photograph with CSS gradients,
SVG paths, canvas code, emoji, or other code-generated artwork. The platform
creates missing ShopEZ product photography before this code-generation stage;
if an image is still unavailable, render the product feed's deliberate empty
media state instead of inventing one in source code.
If editorial imagery is not supplied, reuse appropriate ShopEZ imagery or
create the composition with the canonical theme and CSS.

CANVAS EDITABILITY

Keep the visual product-card structure clean and reusable so Builder 3 can
select and edit its image area, heading, price, badges and button styling.

The design should represent one reusable product-card template repeated with
live ShopEZ records, not individually authored static cards.
`.trim();
}
