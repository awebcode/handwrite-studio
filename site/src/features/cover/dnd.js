// Block reordering with dnd-kit: drag anywhere on a block except its editable text (shared with the editor).
let dnd = null;
import("/src/shared/dnd.js").then((m) => {
  dnd = m.createDnd({
    onReorder: (from, to) => { const [b] = S.blocks.splice(from, 1); S.blocks.splice(to, 0, b); render(); save(); },
  });
  attachDnd();
});

function attachDnd() {
  if (!dnd) return;
  dnd.reset();
  document.querySelectorAll(".blk").forEach((el, index) => dnd.sortable(el, { id: el.dataset.id, index }));
}
