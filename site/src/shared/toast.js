let node, timer;
/** Small status message at the bottom of the screen. */
export function toast(msg, ms = 2400) {
  if (!node) {
    node = document.createElement("div");
    node.className = "toast"; node.setAttribute("role", "status");
    document.body.appendChild(node);
  }
  node.textContent = msg; node.classList.add("show");
  clearTimeout(timer); timer = setTimeout(() => node.classList.remove("show"), ms);
}
