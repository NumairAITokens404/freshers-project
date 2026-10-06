import { jsPDF } from "jspdf";
import { EVENT } from "@shared/event";
import type { Guest } from "@shared/registration";

async function loadImage(src: string) {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

export async function createPassPdf(guest: Guest, photo: string, id: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't create the pass.");
  const [background, portrait] = await Promise.all([
    loadImage("/images/freshers/disco-streaks.png"),
    loadImage(photo),
  ]);
  const bgScale = Math.max(
    canvas.width / background.width,
    canvas.height / background.height
  );
  ctx.drawImage(
    background,
    (canvas.width - background.width * bgScale) / 2,
    (canvas.height - background.height * bgScale) / 2,
    background.width * bgScale,
    background.height * bgScale
  );
  ctx.fillStyle = "rgba(8,3,18,.73)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ff7ddb";
  ctx.font = "italic 76px Georgia, serif";
  ctx.fillText(EVENT.title, 64, 105);
  ctx.fillStyle = "#e6ff70";
  ctx.font = "bold 22px monospace";
  ctx.fillText("CSB FRESHERS ’26  /  ALL ACCESS", 64, 150);

  const frame = { x: 64, y: 210, width: 952, height: 650 };
  ctx.fillStyle = "rgba(8,3,18,.42)";
  ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
  const scale = Math.min(
    frame.width / portrait.width,
    frame.height / portrait.height
  );
  ctx.drawImage(
    portrait,
    frame.x + (frame.width - portrait.width * scale) / 2,
    frame.y + (frame.height - portrait.height * scale) / 2,
    portrait.width * scale,
    portrait.height * scale
  );

  ctx.fillStyle = "#e6ff70";
  ctx.font = "bold 23px monospace";
  ctx.fillText("THE GUEST", 64, 930);
  let size = 70;
  do ctx.font = `bold ${size--}px sans-serif`;
  while (ctx.measureText(guest.name).width > 952 && size > 24);
  ctx.fillStyle = "#fff9f3";
  ctx.fillText(guest.name.toUpperCase(), 64, 1010);
  ctx.fillStyle = "#ff7ddb";
  ctx.font = "bold 30px monospace";
  ctx.fillText(guest.rollNo, 64, 1065);
  ctx.fillStyle = "#eadbea";
  ctx.font = "24px sans-serif";
  ctx.fillText(guest.email, 64, 1110, 952);
  ctx.strokeStyle = "#ff7ddb";
  ctx.lineWidth = 3;
  ctx.setLineDash([13, 11]);
  ctx.beginPath();
  ctx.moveTo(64, 1160);
  ctx.lineTo(1016, 1160);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#fff9f3";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText(`${EVENT.date.toUpperCase()}  /  ${EVENT.venue}`, 64, 1240);
  ctx.fillStyle = "#e6ff70";
  ctx.font = "30px monospace";
  ctx.fillText(EVENT.time, 64, 1295);
  ctx.fillStyle = "#ff7ddb";
  ctx.font = "bold 25px monospace";
  ctx.fillText(`GUEST #${String(id).padStart(5, "0")}`, 64, 1410);
  ctx.fillStyle = "#fff9f3";
  ctx.fillText("NEW FACES. SAME FREQUENCY.", 565, 1410);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [1080, 1500],
    hotfixes: ["px_scaling"],
  });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, 1080, 1500);
  return pdf.output("blob");
}

export function downloadPassPdf(blob: Blob, rollNo: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${EVENT.title}-pass-${rollNo}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("Couldn't prepare the PDF backup."));
    reader.readAsDataURL(blob);
  });
}
