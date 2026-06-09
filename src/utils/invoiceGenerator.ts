import { Order } from "../types";

export function downloadInvoiceAsImage(order: Order) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Border & accents
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  // Accent Top Line
  ctx.fillStyle = "#2563eb"; // Blue border bar
  ctx.fillRect(15, 15, canvas.width - 30, 8);

  // Header Brand Info
  ctx.fillStyle = "#0f172a"; // Slate 900
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.fillText("RARE COMMERCE", 40, 75);

  // Subtitle
  ctx.fillStyle = "#64748b";
  ctx.font = "600 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("CURATED PREMIUM GEAR", 40, 95);

  // Invoice Title Right Aligned
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 18px monospace";
  ctx.fillText("COMMERCIAL RECEIPT", canvas.width - 280, 75);

  // Details
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("INVOICE STATUS", canvas.width - 280, 95);
  
  // Status Badge
  const statusColors: Record<string, string> = {
    Pending: "#cbd5e1",
    Processing: "#3b82f6",
    Shipped: "#f97316",
    Delivered: "#10b981",
  };
  const badgeColor = statusColors[order.status] || "#2563eb";
  ctx.fillStyle = badgeColor;
  ctx.fillRect(canvas.width - 180, 83, 100, 18);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(order.status.toUpperCase(), canvas.width - 130, 96);
  ctx.textAlign = "left"; // Restores default alignment

  // Information Columns
  // Column 1: Order Meta Space
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText(`ORDER INFORMATION`, 40, 160);
  
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 175, 340, 110);

  ctx.fillStyle = "#334155";
  ctx.font = "normal 12px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Order ID: #${order.id}`, 55, 200);
  ctx.fillText(`Date: ${new Date(order.createdAt).toLocaleString()}`, 55, 222);
  ctx.fillText(`Method: PayPal Express Transfer`, 55, 244);
  if (order.payPalTransactionId) {
    ctx.fillText(`TxID: ${order.payPalTransactionId}`, 55, 265);
  }

  // Column 2: Recipient Info (Post Address)
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("SHIPPING DESTINATION", 420, 160);

  ctx.strokeRect(420, 175, 340, 110);

  ctx.fillStyle = "#334155";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.fillText(order.customer.fullName, 435, 198);
  
  ctx.font = "normal 12px system-ui, -apple-system, sans-serif";
  ctx.fillText(order.customer.address, 435, 218);
  ctx.fillText(`${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}`, 435, 238);
  ctx.fillText(`${order.customer.country} (Tel: ${order.customer.phone})`, 435, 258);

  // Draw Table Header
  const tableY = 320;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(40, tableY, 720, 30);
  ctx.strokeStyle = "#cbd5e1";
  ctx.strokeRect(40, tableY, 720, 30);

  ctx.fillStyle = "#475569";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("ITEM DESCRIPTION / TITLE", 55, tableY + 19);
  ctx.fillText("SKU CODE", 380, tableY + 19);
  ctx.fillText("UNIT PRICE", 500, tableY + 19);
  ctx.fillText("QTY", 610, tableY + 19);
  ctx.fillText("TOTAL", 680, tableY + 19);

  let currentY = tableY + 30;
  ctx.font = "normal 11px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#0f172a";

  order.items.forEach((item, index) => {
    // Alternating rows bg
    if (index % 2 === 1) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(40, currentY, 720, 35);
    }
    ctx.strokeStyle = "#f1f5f9";
    ctx.strokeRect(40, currentY, 720, 35);

    ctx.fillStyle = "#0f172a";
    ctx.font = "600 11px system-ui, -apple-system, sans-serif";
    
    // Safety check product names or descriptions
    let nameText = (item as any).productName || (item as any).name || "E-Commerce Gear";
    if (nameText.length > 38) {
      nameText = nameText.substring(0, 35) + "...";
    }
    ctx.fillText(nameText, 55, currentY + 21);

    ctx.fillStyle = "#64748b";
    ctx.font = "monospace 10px";
    ctx.fillText(item.sku || "SKU-N/A", 380, currentY + 21);

    ctx.fillStyle = "#334155";
    ctx.font = "normal 11px monospace";
    ctx.fillText(`$${Number(item.price).toFixed(2)}`, 500, currentY + 21);
    ctx.fillText(String(item.quantity), 615, currentY + 21);
    
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`$${(Number(item.price) * Number(item.quantity)).toFixed(2)}`, 680, currentY + 21);

    currentY += 35;
  });

  currentY += 20;

  // Subtotals and summaries block
  const summaryX = 460;
  ctx.fillStyle = "#475569";
  ctx.font = "normal 12px system-ui, -apple-system, sans-serif";
  ctx.fillText("Items Subtotal:", summaryX, currentY);
  ctx.font = "bold 12px monospace";
  ctx.fillText(`$${Number(order.subtotal).toFixed(2)}`, canvas.width - 120, currentY);

  currentY += 24;
  ctx.fillStyle = "#475569";
  ctx.font = "normal 12px system-ui, -apple-system, sans-serif";
  ctx.fillText("Standard Tax (8%):", summaryX, currentY);
  ctx.font = "bold 12px monospace";
  ctx.fillText(`$${Number(order.tax).toFixed(2)}`, canvas.width - 120, currentY);

  currentY += 24;
  ctx.fillStyle = "#475569";
  ctx.font = "normal 12px system-ui, -apple-system, sans-serif";
  ctx.fillText("Shipping & Handling:", summaryX, currentY);
  ctx.font = "bold 12px monospace";
  ctx.fillText(`$${Number(order.shipping).toFixed(2)}`, canvas.width - 120, currentY);

  currentY += 15;
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(summaryX, currentY);
  ctx.lineTo(canvas.width - 40, currentY);
  ctx.stroke();

  currentY += 25;
  ctx.fillStyle = "#1e293b";
  ctx.font = "black 14px system-ui, -apple-system, sans-serif";
  ctx.fillText("Invoice Grand Total:", summaryX, currentY);
  ctx.fillStyle = "#2563eb";
  ctx.font = "bold 14px monospace";
  ctx.fillText(`$${Number(order.total).toFixed(2)}`, canvas.width - 120, currentY);

  // Footer Accents
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(40, 910, 720, 50);
  ctx.strokeStyle = "#e2e8f0";
  ctx.strokeRect(40, 910, 720, 50);

  ctx.fillStyle = "#64748b";
  ctx.font = "normal 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Official digital proof of checkout. Non-negotiable transfer confirmation document.", 55, 930);
  ctx.fillText("For assistance or dispute resolution cycles, please reach support at RARE e-Commerce.", 55, 944);

  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `RARE_INVOICE_${order.id || "order"}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Critical error downloading invoice as image:", error);
  }
}
