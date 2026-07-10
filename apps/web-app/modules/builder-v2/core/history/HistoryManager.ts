export const DEFAULT_BUILDER_HISTORY_LIMIT = 100;

export class HistoryManager<T> {
  readonly maxHistory: number;

  private past: T[] = [];

  private future: T[] = [];

  constructor(maxHistory = DEFAULT_BUILDER_HISTORY_LIMIT) {
    this.maxHistory = maxHistory;
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }

  push(entry: T): void {
    this.past.push(entry);

    if (this.past.length > this.maxHistory) {
      this.past.shift();
    }

    this.future = [];
  }

  undo(current: T): T | undefined {
    const previous = this.past.pop();
    if (previous === undefined) return undefined;

    this.future.push(current);
    return previous;
  }

  redo(current: T): T | undefined {
    const next = this.future.pop();
    if (next === undefined) return undefined;

    this.past.push(current);
    if (this.past.length > this.maxHistory) {
      this.past.shift();
    }

    return next;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  pastSize(): number {
    return this.past.length;
  }

  futureSize(): number {
    return this.future.length;
  }

  pastEntries(): T[] {
    return [...this.past];
  }

  futureEntries(): T[] {
    return [...this.future];
  }
}
