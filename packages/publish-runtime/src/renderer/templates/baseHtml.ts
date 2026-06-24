export function baseHtml({
  title,
  body,
  css,
}: {
  title: string;
  body: string;
  css?: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  ${css ? `<style>${css}</style>` : ""}
</head>
<body>
${body}
</body>
</html>`;
}

/* ----------------------------------
   XSS-safe minimal escape
---------------------------------- */
function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
