import { initTopbar } from "./topbar.js";
import { initSidebar } from "./sidebar.js";
import { initPreview } from "./preview.js";
import { boot } from "./project.js";
import { S, setZoom } from "./state.js";
import { $ } from "../../shared/dom.js";

(async () => {
  await boot();
  setZoom(Math.min(0.75, Math.max(0.35, (innerWidth - 420) / 794)));
  initTopbar(); initSidebar(); initPreview();
  $("#pname-top").value = S.proj.name; $("#zoom").value = S.zoom;
  document.documentElement.dataset.ready = "1";
})().catch((e) => { console.error(e); document.body.insertAdjacentHTML("beforeend", `<pre class="fatal">Could not start: ${e.message}</pre>`); });
