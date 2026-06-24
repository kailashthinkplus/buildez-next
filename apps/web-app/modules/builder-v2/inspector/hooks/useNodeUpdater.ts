"use client";

import { commandBus } from "../../core/commands/CommandBus";
import { UpdateNodeCommand } from "../../core/commands/UpdateNodeCommand";

/* ==========================================================
   Node Updater
========================================================== */

export function useNodeUpdater() {
  /* --------------------------------------------------------
     Generic Patch
  -------------------------------------------------------- */

  function updateNode(
    nodeId: string,
    patch: Record<string, unknown>
  ) {
    commandBus.execute(
      new UpdateNodeCommand(nodeId, patch)
    );
  }

  /* --------------------------------------------------------
     Update Props
  -------------------------------------------------------- */

  function updateProp(
    nodeId: string,
    property: string,
    value: unknown
  ) {
    updateNode(nodeId, {
      props: {
        [property]: value,
      },
    });
  }

  /* --------------------------------------------------------
     Update Style
  -------------------------------------------------------- */

  function updateStyle(
    nodeId: string,
    property: string,
    value: unknown
  ) {
    updateNode(nodeId, {
      style: {
        [property]: value,
      },
    });
  }

  return {
    updateNode,
    updateProp,
    updateStyle,
  };
}