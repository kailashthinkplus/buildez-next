type OptimizedR2ImageProps = {
  basePath: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
};

const ASSET_VERSION = "20260906-3";

export function OptimizedR2Image({
  basePath,
  alt,
  className,
  width = 1536,
  height = 1024,
  loading = "lazy",
  fetchPriority = "auto",
}: OptimizedR2ImageProps) {
  const versioned = (extension: "avif" | "webp" | "png") =>
    `${basePath}.${extension}?v=${ASSET_VERSION}`;

  return (
    <picture>
      <source srcSet={versioned("avif")} type="image/avif" />
      <source srcSet={versioned("webp")} type="image/webp" />
      <img
        className={className}
        src={versioned("png")}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    </picture>
  );
}
