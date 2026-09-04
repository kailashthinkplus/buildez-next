# History and undo

Every Inspector or inline edit first creates a checkpoint, commits through `writeProjectFile`, records the checkpoint in the shell undo stack, and refreshes preview from canonical source. Existing project checkpoint restore provides undo/redo.
