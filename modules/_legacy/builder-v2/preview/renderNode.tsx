export function renderNode(node: any): JSX.Element | null {
  switch (node.type) {
    case "section":
      return (
        <section key={node.id} className="be-section">
          {node.children?.map(renderNode)}
        </section>
      );

    case "container":
      return (
        <div key={node.id} className="be-container">
          {node.children?.map(renderNode)}
        </div>
      );

    case "column":
      return (
        <div key={node.id} className="be-column">
          {node.children?.map(renderNode)} {/* 🔥 BLOCKS LIVE HERE */}
        </div>
      );

    // 🔥 BLOCKS 🔥
    case "heading":
      return (
        <h1 key={node.id} className="be-heading">
          {node.data?.text}
        </h1>
      );

    case "text":
      return (
        <p key={node.id} className="be-text">
          {node.data?.text}
        </p>
      );

    case "button":
      return (
        <button key={node.id} className="be-button">
          {node.data?.label}
        </button>
      );

    case "image":
      return (
        <img
          key={node.id}
          src={node.data?.src}
          alt=""
          className="be-image"
        />
      );

    default:
      return null;
  }
}
