"use client";

export function InlineToolbar() {
  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
  }

  return (
    <div className="absolute -top-10 left-0 z-50 flex gap-1 rounded-lg border border-white/10 bg-black/70 backdrop-blur px-2 py-1 text-xs text-white shadow">
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}>B</button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}>I</button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}>U</button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const url = prompt("Enter link");
          if (url) exec("createLink", url);
        }}
      >
        Link
      </button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")}>
        Clear
      </button>
    </div>
  );
}
