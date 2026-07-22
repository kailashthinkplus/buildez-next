"use client";

import { create } from "zustand";
import { BuilderBlueprint } from "../types/blueprint";

interface HistoryStore{

    undoStack:BuilderBlueprint[];

    redoStack:BuilderBlueprint[];

    push(
        bp:BuilderBlueprint
    ):void;

    undo():BuilderBlueprint|undefined;

    redo():BuilderBlueprint|undefined;

    clear():void;

}

export const useHistoryStore=create<HistoryStore>((set,get)=>({

    undoStack:[],

    redoStack:[],

    push(bp){

        set(state=>({

            undoStack:[
                ...state.undoStack,
                structuredClone(bp)
            ],

            redoStack:[]

        }));

    },

    undo(){

        const stack=get().undoStack;

        if(!stack.length)
            return undefined;

        const last=stack.at(-1)!;

        set({

            undoStack:stack.slice(0,-1)

        });

        return last;

    },

    redo(){

        return undefined;

    },

    clear(){

        set({

            undoStack:[],

            redoStack:[]

        });

    }

}));