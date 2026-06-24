import type { BuilderStyle } from "../../types/blueprint";

const ImageDefaults = {
  props: {
    src: "https://placehold.co/1200x800/e2e8f0/64748b?text=Image",
    alt: "Image",
  },
  style: {
    maxWidth: "100%",
    borderRadius: 12,
    objectFit: "cover",
  } satisfies BuilderStyle,
};

export default ImageDefaults;
