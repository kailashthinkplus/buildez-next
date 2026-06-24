"use client";

const STRUCTURES = [
  { id: "1", label: "1 Column", columns: [1] },
  { id: "2", label: "2 Columns", columns: [1, 1] },
  { id: "3", label: "3 Columns", columns: [1, 1, 1] },
  { id: "4", label: "2 / 1", columns: [2, 1] },
  { id: "5", label: "1 / 2", columns: [1, 2] },
];

export default function SectionStructurePicker({
  onSelect,
  onClose,
}: {
  onSelect: (columns: number[]) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[12000] bg-black/40 flex items-center justify-center">
      <div className="bg-[#0F1118] rounded-xl p-6 w-[420px] space-y-4">
        <h3 className="text-white font-semibold">Choose layout</h3>

        <div className="grid grid-cols-2 gap-3">
          {STRUCTURES.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.columns)}
              className="p-4 rounded-lg border border-white/10 hover:bg-white/10 text-white text-sm"
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-sm text-neutral-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
