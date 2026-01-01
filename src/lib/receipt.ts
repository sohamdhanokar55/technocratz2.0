/**
 * PDF Receipt Generator using jsPDF
 */
import jsPDF from "jspdf";

interface ReceiptData {
  eventName: string;
  leaderName: string;
  email: string;
  contact: string;
  institute: string;
  paymentId: string;
  registrationId?: string;
  amountPaid?: number;
}

/**
 * Generates and downloads a PDF receipt
 */
export function generateAndDownloadReceipt(data: ReceiptData): void {
  console.log("[Receipt] Generating PDF receipt");
  console.log("[Receipt] Data:", data);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text("Technocratz 2.0", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Registration Receipt", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Event Name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Event:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.eventName, margin + 25, yPos);
  yPos += 10;

  // Participant/Leader Name
  doc.setFont("helvetica", "bold");
  doc.text("Participant Name:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.leaderName, margin + 50, yPos);
  yPos += 10;

  // Email
  doc.setFont("helvetica", "bold");
  doc.text("Email:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.email, margin + 25, yPos);
  yPos += 10;

  // Contact
  doc.setFont("helvetica", "bold");
  doc.text("Contact:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.contact, margin + 30, yPos);
  yPos += 10;

  // Institute
  doc.setFont("helvetica", "bold");
  doc.text("Institute:", margin, yPos);
  doc.setFont("helvetica", "normal");
  const instituteLines = doc.splitTextToSize(data.institute, contentWidth - 30);
  doc.text(instituteLines, margin + 30, yPos);
  yPos += instituteLines.length * 7;

  // Payment ID
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Razorpay Payment ID:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(data.paymentId, margin + 55, yPos);
  yPos += 10;

  // Registration ID (if available)
  if (data.registrationId) {
    doc.setFont("helvetica", "bold");
    doc.text("Registration ID:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(data.registrationId, margin + 45, yPos);
    yPos += 10;
  }

  // Amount Paid (if available)
  if (data.amountPaid) {
    yPos += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105); // Green color
    doc.text(`Amount Paid: ₹${data.amountPaid}`, margin, yPos);
    yPos += 10;
  }

  // Footer line
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Footer text
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  doc.text("Thank you for registering for Technocratz 2.0", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 5;
  doc.text(
    "This is a computer-generated receipt. No signature required.",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );

  // Generate filename
  const sanitizedName = data.leaderName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `${sanitizedName}_Technocratz2.0.pdf`;

  // Save PDF
  console.log("[Receipt] Saving PDF as:", filename);
  doc.save(filename);
  console.log("[Receipt] PDF receipt downloaded successfully");
}

/**
 * Extracts receipt data from registration and payment records
 */
export function extractReceiptData(
  registrationData: any,
  paymentRecord: any,
  eventName: string
): ReceiptData | null {
  console.log("[Receipt] Extracting receipt data");
  console.log("[Receipt] Registration data:", registrationData);
  console.log("[Receipt] Payment record:", paymentRecord);

  if (!registrationData || !paymentRecord) {
    console.error("[Receipt] Missing registration or payment data");
    return null;
  }

  const paymentId =
    paymentRecord.razorpay_payment_id || paymentRecord.payment_id || "";
  const registrationId = registrationData.id || "";

  // Extract participant/leader name
  let leaderName = "";
  let email = "";
  let contact = "";
  let institute = "";

  if (registrationData.payload) {
    const payload = registrationData.payload;

    // Single participant
    if (payload.name) {
      leaderName = payload.name;
      email = payload.email || "";
      contact = payload.contact || "";
      institute = payload.institute || "";
    }
    // Team event
    else if (payload.leader) {
      leaderName = payload.leader.name || "";
      email = payload.leader.email || "";
      contact = payload.leader.contact || "";
      institute = payload.leader.institute || "";
    }
  }

  if (!leaderName || !paymentId) {
    console.error("[Receipt] Missing required fields for receipt");
    return null;
  }

  return {
    eventName,
    leaderName,
    email,
    contact,
    institute,
    paymentId,
    registrationId,
    amountPaid: registrationData.amountPaid,
  };
}

