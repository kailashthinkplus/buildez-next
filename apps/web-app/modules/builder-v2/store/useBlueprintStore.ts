"use client";

import { create } from "zustand";
import { BuilderBlueprint, BuilderNode } from "../types/blueprint";

interface BlueprintStore {

  blueprint?: BuilderBlueprint;

  dirty: boolean;

  loading: boolean;

  selectedPageId?: string;

  /* ------------------------- */

  setBlueprint(
    blueprint: BuilderBlueprint
  ): void;

  clear(): void;

  setDirty(
    dirty: boolean
  ): void;

  updateNode(
    nodeId: string,
    updates: Partial<BuilderNode>
  ): void;

  addNode(
    parentId: string | null,
    node: BuilderNode
  ): void;

  removeNode(
    nodeId: string
  ): void;

}

export const useBlueprintStore =
create<BlueprintStore>((set,get)=>({

    blueprint:undefined,

    dirty:false,

    loading:false,

    selectedPageId:undefined,

    setBlueprint(blueprint){

        set({
            blueprint,
            dirty:false
        });

    },

    clear(){

        set({
            blueprint:undefined,
            dirty:false
        });

    },

    setDirty(dirty){

        set({dirty});

    },

    updateNode(nodeId,updates){

        const bp=get().blueprint;

        if(!bp) return;

        const nodes=bp.nodes.map(node=>{

            if(node.id!==nodeId)
                return node;

            return{

                ...node,

                ...updates

            };

        });

        set({

            blueprint:{

                ...bp,

                nodes

            },

            dirty:true

        });

    },

    addNode(parentId,node){

        const bp=get().blueprint;

        if(!bp) return;

        const nodes=[...bp.nodes,node];

        set({

            blueprint:{

                ...bp,

                nodes

            },

            dirty:true

        });

    },

    removeNode(nodeId){

        const bp=get().blueprint;

        if(!bp) return;

        set({

            blueprint:{

                ...bp,

                nodes:bp.nodes.filter(
                    n=>n.id!==nodeId
                )

            },

            dirty:true

        });

    }

}));