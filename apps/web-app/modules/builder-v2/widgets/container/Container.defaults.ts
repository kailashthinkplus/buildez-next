const ContainerDefaults = {
  props: {
  container: "full",
  layout: "flex",
  direction: "row",
  justify: "flex-start",
  align: "flex-start",
  wrap: false,
},

  style: {
    width: "100%",
    gap: { desktop: 24, tablet: 20, mobile: 16 },
    padding: 0,
    margin: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    maxWidth: "1120px",
  },
};

export default ContainerDefaults;
