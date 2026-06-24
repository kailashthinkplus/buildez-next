export default function BackgroundLayers() {
  return (
    <>
      {/* BLOBS BEHIND EVERYTHING */}
      <div id="bg-root">
        <img
          src="/visuals/blob-blue.svg"
          className="bg-blob blue parallax"
          alt=""
          data-speed="0.15"
        />
        <img
          src="/visuals/blob-violet.svg"
          className="bg-blob violet parallax"
          alt=""
          data-speed="0.25"
        />
      </div>

      {/* NOISE */}
      <div className="bg-noise" />
    </>
  );
}
