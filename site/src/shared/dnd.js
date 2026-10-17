// Thin wrapper over @dnd-kit/dom (bundled in /vendor/dnd-kit.js): sortable lists + draggable chips, mouse / touch / keyboard.
//   const dnd = createDnd({ onReorder: (from, to) => ..., onDropNew: (data, index) => ... });
//   dnd.sortable(el, { id, index, handle });  dnd.draggable(el, { id, data });  dnd.reset();  // reset() before re-rendering
import { DragDropManager, Draggable, Sortable, PointerSensor, KeyboardSensor, PointerActivationConstraints, isSortable } from "/vendor/dnd-kit.js";

// Controls that own their pointer gesture never start a drag; everything else on the item does (no handle needed).
const INTERACTIVE = 'input,textarea,select,button,a[href],label,[contenteditable="true"],[role="slider"],[data-no-drag]';
const guard = (event, source) => {
  const hit = event.target?.closest?.(INTERACTIVE);
  if (hit?.isContentEditable && document.activeElement !== hit) return false; // click first to edit text; until then it drags
  return !!hit && hit !== source.element;
};
const sensors = [
  PointerSensor.configure({
    preventActivation: guard,
    activationConstraints: (event) => (event.pointerType === "touch"
      ? [new PointerActivationConstraints.Delay({ value: 220, tolerance: 8 })]
      : [new PointerActivationConstraints.Distance({ value: 6 })]),
  }),
  KeyboardSensor,
];

export function createDnd({ onReorder, onDropNew, onStart, onEnd } = {}) {
  const manager = new DragDropManager({ sensors });
  let items = [];
  manager.monitor.addEventListener("dragstart", () => onStart?.());
  manager.monitor.addEventListener("dragend", (e) => {
    onEnd?.();
    if (e.canceled) return;
    const { source, target } = e.operation;
    if (!source) return;
    if (isSortable(source)) {
      if (source.initialIndex !== source.index) onReorder?.(source.initialIndex, source.index);
    } else if (source.data?.add && target && isSortable(target)) {
      const y = e.operation.position?.current?.y, mid = target.shape?.center?.y;
      onDropNew?.(source.data, target.index + (y != null && mid != null && y < mid ? 0 : 1));
    } else if (source.data?.add) onDropNew?.(source.data, null);
  });
  return {
    manager,
    sortable(element, { id, index, handle }) {
      const s = new Sortable({ id, index, element, ...(handle ? { handle } : {}), transition: { duration: 200, idle: false } }, manager);
      items.push(s); return s;
    },
    draggable(element, { id, data, handle }) {
      const d = new Draggable({ id, element, data, handle }, manager);
      items.push(d); return d;
    },
    reset() { items.forEach((i) => i.destroy()); items = []; },
    destroy() { this.reset(); manager.destroy(); },
  };
}
