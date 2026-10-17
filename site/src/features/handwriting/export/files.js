// Final canvases -> PDF / zipped images.
import { vendor } from "../../../shared/vendor.js";

export const canvasBlob = (canvas, type = "image/jpeg", q = 0.8) => new Promise((res) => canvas.toBlob(res, type, q));

export async function pdfBlob(canvases, quality = 0.74) {
  const { jsPDF } = await vendor("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  canvases.forEach((c, i) => {
    if (i) pdf.addPage();
    pdf.addImage(c.toDataURL("image/jpeg", quality), "JPEG", 0, 0, 210, 297, undefined, "FAST");
  });
  return pdf.output("blob");
}

export async function zipBlob(canvases, format = "jpg", quality = 0.86, base = "page") {
  const JSZip = await vendor("jszip"), zip = new JSZip(), png = format === "png";
  for (let i = 0; i < canvases.length; i++) {
    const blob = await canvasBlob(canvases[i], png ? "image/png" : "image/jpeg", quality);
    zip.file(`${base}-${String(i + 1).padStart(2, "0")}.${png ? "png" : "jpg"}`, blob);
  }
  return zip.generateAsync({ type: "blob" });
}
