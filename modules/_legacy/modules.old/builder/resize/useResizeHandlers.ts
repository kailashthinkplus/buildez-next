// /modules/builder/resize/useResizeHandlers.ts
"use client";

import { useBlueprintStore } from "../state/useBlueprintStore";
import { useCanvasStore } from "../state/useCanvasStore";

/* ============================================================
   INTERNAL STATE
============================================================ */
let active = false;
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let sectionId = "";
let resizeType: string | null = null;
let colIndex: number | null = null;
let startCols: number[] = [];

/* For snapping */
const SNAP = 8;

/* For GRID cell drop */
let dragChildId: string | null = null;

/* ============================================================
   SNAP HELPERS
============================================================ */
function snap(x: number) {
  return Math.round(x / SNAP) * SNAP;
}

function calcGridBreakpoints(cols: number[], elementWidth: number) {
  const total = cols.reduce((a, b) => a + b, 0);
  let acc = 0;

  return cols.map((fr) => {
    acc += fr;
    return (acc / total) * elementWidth;
  });
}

/* ============================================================
   HANDLE ANIMATION (Webflow-like pulse)
============================================================ */
function animateHandle(el: HTMLElement | null) {
  if (!el) return;
  el.animate(
    [
      { transform: "scale(1)", opacity: 0.5 },
      { transform: "scale(1.2)", opacity: 1 },
      { transform: "scale(1)", opacity: 0.5 },
    ],
    {
      duration: 260,
      easing: "ease-out",
    }
  );
}

/* ============================================================
   INIT RESIZE EVENTS
============================================================ */
export function initResizeEvents() {
  if (typeof window === "undefined") return;

  /* ------------------------------------------------------------
     MOUSEDOWN START
  ------------------------------------------------------------ */
  window.addEventListener("mousedown", (e) => {
    const target = e.target as HTMLElement;

    const type = target.dataset.resize;
    const gridCol = target.dataset.gridCol;
    const childDrag = target.dataset.childDrag;

    /* ============ CHILD DRAG INTO GRID ============ */
    if (childDrag) {
      dragChildId = childDrag;
      return;
    }

    if (!type && gridCol === undefined) return;

    active = true;
    resizeType = type || null;

    const sectionEl = target.closest("[data-section-id]") as HTMLElement;
    if (!sectionEl) return;

    sectionId = sectionEl.dataset.sectionId!;
    const rect = sectionEl.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;

    startWidth = rect.width;
    startHeight = rect.height;

    /* Animate the handle */
    animateHandle(target);

    /* GRID column resizing */
    if (gridCol !== undefined) {
      colIndex = Number(gridCol);

      const state = useBlueprintStore.getState();
      const sec = state.blueprint.page.sections.find((s) => s.id === sectionId);

      startCols = [...(sec?.layout?.colsConfig || [])];
    }

    document.body.style.userSelect = "none";
  });

  /* ------------------------------------------------------------
     MOUSEMOVE: DRAGGING ACTION
  ------------------------------------------------------------ */
  window.addEventListener("mousemove", (e) => {
    if (!active && !dragChildId) return;

    const store = useBlueprintStore.getState();
    const device = useCanvasStore.getState().device;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    /* ========================================================
       CHILD DRAG INTO GRID CELL
       (drop indicator)
    ======================================================== */
if (dragChildId) {
  const store = useBlueprintStore.getState();
  const sections = store.getSections();

  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;

  /* ======================================================
     CASE 1 — Drop inside an existing grid cell
  ====================================================== */
  if (el?.dataset?.gridCell) {
    const cellIndex = Number(el.dataset.gridCell);
    const sec = sections.find((s) => s.id === el.dataset.sectionParent);

    if (sec) {
      store.updateLayout(sec.id, { dropChildInto: cellIndex }, "desktop");
    }

    dragChildId = null;
    return;
  }

  /* ======================================================
     CASE 2 — Dropped BELOW grid → auto-create new row
  ====================================================== */
  const parent = el?.closest("[data-section-id]") as HTMLElement;
  if (parent) {
    const sectionId2 = parent.dataset.sectionId;
    const sec = sections.find((s) => s.id === sectionId2);

    if (sec && sec.layout?.type === "grid") {
      const cols = sec.layout.colsConfig?.length || sec.layout.cols || 1;

      // Create new row = add "cols" more cells
      const currentCells = sec.layout.rows || 1;
      const newRows = currentCells + 1;

      store.updateLayout(
        sec.id,
        {
          rows: newRows,
          autoAddRow: true, // optional flag for inspector
        },
        "desktop"
      );

      // Drop child into the FIRST cell of the new row
      const dropIndex = (newRows - 1) * cols;

      store.updateLayout(
        sec.id,
        { dropChildInto: dropIndex },
        "desktop"
      );
    }
  }

  dragChildId = null;
}

    /* ========================================================
       GRID COLUMN RESIZE
    ======================================================== */
    if (colIndex !== null) {
      const sec = store.blueprint.page.sections.find((s) => s.id === sectionId);
      if (!sec) return;

      const cols = [...startCols];
      const total = cols.reduce((a, b) => a + b, 0);

      const deltaFr = dx / 50;
      cols[colIndex] += deltaFr;
      cols[colIndex + 1] -= deltaFr;

      cols[colIndex] = Math.max(0.5, cols[colIndex]);
      cols[colIndex + 1] = Math.max(0.5, cols[colIndex + 1]);

      store.updateLayout(sectionId, { colsConfig: cols }, device);
      return;
    }

    /* ========================================================
       NORMAL RESIZE (WIDTH)
    ======================================================== */
    if (resizeType === "x-left" || resizeType === "x-right") {
      let newWidth =
        resizeType === "x-right" ? startWidth + dx : startWidth - dx;

      newWidth = snap(newWidth);

      store.updateStyle(sectionId, { width: newWidth }, device);
    }

    /* ========================================================
       HEIGHT RESIZE
    ======================================================== */
    if (resizeType === "y-bottom") {
      let newHeight = startHeight + dy;

      newHeight = snap(newHeight);

      store.updateStyle(sectionId, { height: newHeight }, device);
    }
  });

  /* ------------------------------------------------------------
     MOUSEUP: END RESIZE OR DROP
  ------------------------------------------------------------ */
  window.addEventListener("mouseup", (e) => {
    if (dragChildId) {
      /* Drop child into grid cell */
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;

      if (el?.dataset?.gridCell) {
        const cellIndex = Number(el.dataset.gridCell);
        const store = useBlueprintStore.getState();
        const sections = store.getSections();

        const sec = sections.find((s) => s.id === el.dataset.sectionParent);
        if (sec) {
          store.updateLayout(sec.id, { dropChildInto: cellIndex }, "desktop");
        }
      }

      dragChildId = null;
    }

    active = false;
    resizeType = null;
    colIndex = null;

    document.body.style.userSelect = "";
  });
}
