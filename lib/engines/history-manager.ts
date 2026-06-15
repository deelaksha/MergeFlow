import { HistoryAction, MergeAction, Conflict } from "@/lib/types";

/**
 * History Manager
 * Manages undo/redo functionality
 */
export class HistoryManager {
  private history: HistoryAction[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;

  /**
   * Add an action to history
   */
  addAction(
    type: MergeAction,
    conflictId: string,
    beforeState: string,
    afterState: string,
    description: string
  ): void {
    // Remove any actions after current index (if we undid some actions)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Create new action
    const action: HistoryAction = {
      id: `action-${Date.now()}-${Math.random()}`,
      type,
      timestamp: Date.now(),
      conflictId,
      beforeState,
      afterState,
      description,
    };

    // Add to history
    this.history.push(action);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo last action
   */
  undo(): HistoryAction | null {
    if (!this.canUndo()) {
      return null;
    }

    const action = this.history[this.currentIndex];
    this.currentIndex--;
    return action;
  }

  /**
   * Redo last undone action
   */
  redo(): HistoryAction | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current history state
   */
  getHistory(): HistoryAction[] {
    return this.history;
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history summary
   */
  getSummary(): {
    totalActions: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      totalActions: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }

  /**
   * Get specific action by ID
   */
  getAction(id: string): HistoryAction | null {
    return this.history.find((action) => action.id === id) || null;
  }

  /**
   * Get actions for a specific conflict
   */
  getActionsForConflict(conflictId: string): HistoryAction[] {
    return this.history.filter((action) => action.conflictId === conflictId);
  }
}
