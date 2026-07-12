import type { BuilderStyle } from "../../types/blueprint";

const ImageDefaults = {
  props: {
    src: "",
    alt: "Describe this image",
  },
  style: {
    maxWidth: "100%",
    width: "100%",
    aspectRatio: "3 / 2",
    borderRadius: "theme.radius.media",
    objectFit: "cover",
  } satisfies BuilderStyle,
};

export default ImageDefaults;
