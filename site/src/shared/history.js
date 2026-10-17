/**
 * Snapshot-based undo / redo. Push the *serialised* state after every committed change.
 *   const h = createHistory({ onChange: ({canUndo, canRedo}) => ... });
 *   h.push(JSON.stringify(state));  const prev = h.undo();  // -> string | null
 */
export function createHistory({ limit = 120, onChange = () => {} } = {}) {
  let stack = [], i = -1;
  const info = () => ({ canUndo: i > 0, canRedo: i < stack.length - 1, size: stack.length });
  const emit = () => onChange(info());
  return {
    push(s) {
      if (stack[i] === s) return false;
      stack = stack.slice(0, i + 1); stack.push(s);
      if (stack.length > limit) stack.shift();
      i = stack.length - 1; emit(); return true;
    },
    undo() { if (i <= 0) return null; i--; emit(); return stack[i]; },
    redo() { if (i >= stack.length - 1) return null; i++; emit(); return stack[i]; },
    reset(s) { stack = s == null ? [] : [s]; i = stack.length - 1; emit(); },
    get current() { return stack[i]; },
    info,
  };
}
