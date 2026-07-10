"use client";

import {
  Layout,
  Type,
  Image,
  ShoppingBag,
  Megaphone,
  Database,
  FileText,
  Plus,
} from "lucide-react";

import { BlueprintFactory } from "../../core/engine/BlueprintFactory";
import { InsertNodeCommand } from "../../core/commands/InsertNodeCommand";
import { buildNativeInsertionPlan } from "../../core/commands/nativeHierarchyInsertion";
import { commandBus } from "../../core/commands/CommandBus";
import { WidgetRegistry } from "../../core/registry/WidgetRegistry";
import { useBuilderStore } from "../../store/useBuilderStore";
import { useSelectionStore } from "../../store/useSelectionStore";

export default function BlocksPanel() {
  const blueprint = useBuilderStore((s) => s.blueprint);
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId);
const select = useSelectionStore((s) => s.select);

  if (!blueprint) return null;

  const widgets = WidgetRegistry.getAll();

  const categories = {
    layout: widgets.filter((w) => w.category === "layout"),
    basic: widgets.filter((w) => w.category === "basic"),
    media: widgets.filter((w) => w.category === "media"),
    forms: widgets.filter((w) => w.category === "forms"),
    marketing: widgets.filter((w) => w.category === "marketing"),
    commerce: widgets.filter((w) => w.category === "commerce"),
    dynamic: widgets.filter((w) => w.category === "dynamic"),
  };

  function handleInsert(type: any) {
  const insertionParentId =
    selectedNodeId && blueprint.nodes[selectedNodeId]
      ? selectedNodeId
      : blueprint.root;

  const plan = buildNativeInsertionPlan(
    blueprint,
    type,
    insertionParentId,
    (nodeType, parentId) => BlueprintFactory.createNode(nodeType, parentId)
  );

  if (!plan) return;

  if (plan.steps.length === 1) {
    const step = plan.steps[0];
    commandBus.execute(new InsertNodeCommand(step.parentId, step.node, step.index));
    select(plan.selectNodeId);
    return;
  }

  commandBus.transaction("BlocksPanel -> InsertNodeCommand", () => {
    for (const step of plan.steps) {
      commandBus.execute(new InsertNodeCommand(step.parentId, step.node, step.index));
    }
  });

  select(plan.selectNodeId);
}
  }

  const categoryIcons = {
    layout: Layout,
    basic: Type,
    media: Image,
    forms: FileText,
    marketing: Megaphone,
    commerce: ShoppingBag,
    dynamic: Database,
  };

  return (
    <div className="p-5 space-y-8">
      {Object.entries(categories).map(([category, widgets]) => {
        if (!widgets.length) return null;

        const Icon =
          categoryIcons[
            category as keyof typeof categoryIcons
          ];

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <Icon
                size={16}
                className="text-neutral-400"
              />

              <h3 className="text-sm font-semibold text-white capitalize">
                {category}
              </h3>
            </div>

            <div className="space-y-2">
              {widgets.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() =>
                    handleInsert(widget.type)
                  }
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    hover:bg-white/10
                    transition-all
                    px-4
                    py-3
                  "
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {widget.name}
                    </div>

                    <div className="text-xs text-neutral-400">
                      {widget.type}
                    </div>
                  </div>

                  <Plus
                    size={16}
                    className="text-neutral-400"
                  />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
