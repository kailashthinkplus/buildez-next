export function buildPagesKey({
  siteSlug,
  search = "",
  sort = "createdAt_desc",
  filter = "all",
  page = 1,
  limit = 10,
}: {
  siteSlug?: string
  search?: string
  sort?: string
  filter?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()

  if (siteSlug) params.set("siteSlug", siteSlug)
  if (search) params.set("search", search)
  if (sort) params.set("sort", sort)
  if (filter) params.set("filter", filter)

  params.set("skip", String((page - 1) * limit))
  params.set("take", String(limit))

  return `/api/pages?${params.toString()}`
}
