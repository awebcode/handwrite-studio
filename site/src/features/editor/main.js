import { initTopbar } from "./topbar.js";
import { initSidebar } from "./sidebar.js";
import { initPreview } from "./preview.js";
import { boot } from "./project.js";
import { S, setZoom, persist } from "./state.js";
import { $, on as delegate } from "../../shared/dom.js";
import { on } from "./state.js";
import { showTab } from "./sidebar.js";

const mobile = () => matchMedia("(max-width: 860px)").matches;
function view(v) {
  $("#layout").dataset.view = v;
  document.querySelectorAll("#mnav [data-view]").forEach((b) => b.classList.toggle("on", b.dataset.view === v));
}
function initMobileNav() {
  delegate($("#mnav"), "click", "[data-view]", (e, t) => {
    if (t.dataset.view !== "add") return view(t.dataset.view);
    showTab("content"); view("edit"); $("#sidebody").scrollTo({ top: 0, behavior: "smooth" });
  });
  on("select", (src) => { if (mobile() && src === "preview") view("edit"); });
}

(async () => {
  await boot();
  setZoom(innerWidth < 860 ? Math.min(0.75, (innerWidth - 24) / 794) : Math.min(0.75, Math.max(0.35, (innerWidth - 420) / 794)));
  initTopbar(); initSidebar(); initPreview(); initMobileNav();
  $("#pname-top").value = S.proj.name; $("#zoom").value = S.zoom;
  addEventListener("pagehide", () => persist.flush());
  document.documentElement.dataset.ready = "1";
})().catch((e) => { console.error(e); document.body.insertAdjacentHTML("beforeend", `<pre class="fatal">Could not start: ${e.message}</pre>`); });
