/**
 * PDF Receipt Generator using jsPDF
 */
import jsPDF from "jspdf";

interface Participant {
  name: string;
  department?: string;
  semester?: string;
  email?: string;
  contact?: string;
}

interface ReceiptData {
  eventName: string;
  leaderName: string;
  email: string;
  contact: string;
  department?: string;
  semester?: string;
  institute: string;
  paymentId: string;
  registrationNumber?: string | number;
  amountPaid?: number;
  participants?: Participant[];
}

/**
 * Generates and downloads a PDF receipt
 */
export async function generateAndDownloadReceipt(
  data: ReceiptData
): Promise<void> {
  console.log("[Receipt] Generating PDF receipt");
  console.log("[Receipt] Data:", data);
  console.log("[Receipt] Registration Number:", data.registrationNumber);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Header section with institution names
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Agnel Polytechnic, Vashi", margin, yPos);

  doc.setTextColor(59, 130, 246);
  doc.text("APV Council", pageWidth - margin - 25, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  // Decorative line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Title section
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Technocratz 2.0", pageWidth / 2, yPos, { align: "center" });
  yPos += 9;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Registration Receipt", pageWidth / 2, yPos, { align: "center" });
  yPos += 12;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Registration Number with highlight box
  if (
    data.registrationNumber !== undefined &&
    data.registrationNumber !== null &&
    String(data.registrationNumber).trim() !== ""
  ) {
    console.log(
      "[Receipt] Adding registration number:",
      data.registrationNumber
    );

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Registration Number:", margin, yPos);

    // Highlight box
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(margin + 56, yPos - 5, 20, 8, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.setFontSize(13);
    doc.text(String(data.registrationNumber), margin + 66, yPos, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);
    yPos += 12;
  }

  // Event Name
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Event Name:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(59, 130, 246);
  const eventLines = doc.splitTextToSize(data.eventName, contentWidth - 50);
  doc.text(eventLines, margin + 40, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += eventLines.length * 7 + 10;

  // Participants Section with background
  doc.setFillColor(249, 250, 251);
  doc.rect(margin - 2, yPos - 2, contentWidth + 4, 8, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Participant Details:", margin, yPos + 4);
  yPos += 12;

  // Multiple participants (team event)
  if (data.participants && data.participants.length > 0) {
    data.participants.forEach((participant, index) => {
      // Check for page break
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(`Participant ${index + 1}`, margin + 3, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      if (participant.name) {
        doc.text(`Name: ${participant.name}`, margin + 6, yPos);
        yPos += 6;
      }

      if (participant.department) {
        doc.text(`Department: ${participant.department}`, margin + 6, yPos);
        yPos += 6;
      }

      if (participant.semester) {
        doc.text(`Semester: ${participant.semester}`, margin + 6, yPos);
        yPos += 6;
      }

      if (participant.email) {
        doc.text(`Email: ${participant.email}`, margin + 6, yPos);
        yPos += 6;
      }

      if (participant.contact) {
        doc.text(`Contact: ${participant.contact}`, margin + 6, yPos);
        yPos += 6;
      }

      yPos += 4;
    });
  } else {
    // Single participant
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    if (data.leaderName) {
      doc.text(`Name: ${data.leaderName}`, margin + 3, yPos);
      yPos += 6;
    }

    if (data.department) {
      doc.text(`Department: ${data.department}`, margin + 3, yPos);
      yPos += 6;
    }

    if (data.semester) {
      doc.text(`Semester: ${data.semester}`, margin + 3, yPos);
      yPos += 6;
    }

    if (data.email) {
      doc.text(`Email: ${data.email}`, margin + 3, yPos);
      yPos += 6;
    }

    if (data.contact) {
      doc.text(`Contact: ${data.contact}`, margin + 3, yPos);
      yPos += 6;
    }
  }

  // Institute
  if (data.institute) {
    yPos += 3;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Institute: ${data.institute}`, margin + 3, yPos);
    yPos += 10;
  }

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Payment ID
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Payment ID:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(192, 21, 47);
  doc.setFontSize(9);
  const paymentIdLines = doc.splitTextToSize(data.paymentId, contentWidth - 40);
  doc.text(paymentIdLines, margin + 35, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += paymentIdLines.length * 6 + 5;

  // Amount Paid with background box
  if (data.amountPaid) {
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(margin - 2, yPos - 2, 60, 10, 2, 2, "F");

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.text(`Amount Paid: Rs. ${data.amountPaid}`, margin, yPos + 4);
    doc.setTextColor(0, 0, 0);
    yPos += 14;
  }

  // Footer line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Footer text
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Thank you for registering for Technocratz 2.0",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 5;
  doc.setFontSize(8);
  doc.text(
    "This is a computer-generated receipt. No signature required.",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );

  // Generate filename
  const sanitizedName = data.leaderName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  const timestamp = Date.now();
  const filename = `Technocratz_${sanitizedName}_${timestamp}.pdf`;

  // Save PDF
  console.log("[Receipt] Saving PDF as:", filename);
  doc.save(filename);
  console.log("[Receipt] ✅ PDF receipt downloaded successfully");
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
  console.log(
    "[Receipt] Full payload structure:",
    JSON.stringify(registrationData.payload, null, 2)
  );

  if (!registrationData || !paymentRecord) {
    console.error("[Receipt] Missing registration or payment data");
    return null;
  }

  const paymentId =
    paymentRecord.razorpay_payment_id || paymentRecord.payment_id || "";

  // Extract registration number from payment record OR backend response
  let registrationNumber: string | number | null =
    paymentRecord.registrationNumber ||
    paymentRecord.registration_number ||
    paymentRecord.srNo ||
    paymentRecord.sr_no ||
    paymentRecord.serial_number ||
    paymentRecord.sr_no || // Added
    null;

  console.log("[Receipt] Extracted registration number:", registrationNumber);

  const participants: Participant[] = [];
  let mainDepartment = "";
  let mainSemester = "";
  let institute = "";

  if (registrationData.payload) {
    const payload = registrationData.payload;

    // Extract institute
    institute = payload.institute || "";

    // Try multiple possible participant data structures
    console.log("[Receipt] Checking payload structure...");
    console.log(
      "[Receipt] payload.participants exists?",
      !!payload.participants
    );
    console.log("[Receipt] payload.name exists?", !!payload.name);
    console.log("[Receipt] payload keys:", Object.keys(payload));

    // Option 1: participants array (team events)
    if (
      Array.isArray(payload.participants) &&
      payload.participants.length > 0
    ) {
      console.log(
        "[Receipt] Found participants array, length:",
        payload.participants.length
      );
      payload.participants.forEach((participant: any, idx: number) => {
        console.log(
          `[Receipt] Processing participant ${idx + 1}:`,
          participant
        );
        if (participant.name || participant.fullName) {
          participants.push({
            name: participant.name || participant.fullName || "",
            department:
              participant.department ||
              participant.branch ||
              participant.dept ||
              "",
            semester: participant.semester || participant.sem || "",
            email: participant.email || "",
            contact: participant.contact || participant.phone || "",
          });
        }
      });
    }
    // Option 2: Direct fields (single participant)
    else if (payload.name || payload.fullName) {
      console.log("[Receipt] Found single participant with direct fields");
      mainDepartment =
        payload.department || payload.branch || payload.dept || "";
      mainSemester = payload.semester || payload.sem || "";
      participants.push({
        name: payload.name || payload.fullName || "",
        department: mainDepartment,
        semester: mainSemester,
        email: payload.email || "",
        contact: payload.contact || payload.phone || "",
      });
    }
    // Option 3: Nested participant object
    else if (payload.participant) {
      console.log("[Receipt] Found nested participant object");
      const p = payload.participant;
      participants.push({
        name: p.name || p.fullName || "",
        department: p.department || p.branch || p.dept || "",
        semester: p.semester || p.sem || "",
        email: p.email || "",
        contact: p.contact || p.phone || "",
      });
    }
    // Option 4: Try to extract from any object with name field
    else {
      console.log(
        "[Receipt] Searching all payload properties for participant data..."
      );
      for (const key in payload) {
        const value = payload[key];
        if (
          value &&
          typeof value === "object" &&
          (value.name || value.fullName)
        ) {
          console.log(`[Receipt] Found participant data in payload.${key}`);
          participants.push({
            name: value.name || value.fullName || "",
            department: value.department || value.branch || value.dept || "",
            semester: value.semester || value.sem || "",
            email: value.email || "",
            contact: value.contact || value.phone || "",
          });
        }
      }
    }
  }

  console.log("[Receipt] Total participants extracted:", participants.length);

  if (participants.length === 0) {
    console.error("[Receipt] No participants found in payload");
    console.error("[Receipt] Available payload:", registrationData.payload);
    return null;
  }

  // Use first participant for leader fields
  const leader = participants[0];

  const receiptData: ReceiptData = {
    eventName,
    leaderName: leader.name,
    email: leader.email || "",
    contact: leader.contact || "",
    department: leader.department || mainDepartment,
    semester: leader.semester || mainSemester,
    institute: institute,
    paymentId,
    registrationNumber,
    amountPaid: registrationData.amountPaid,
    participants: participants.length > 1 ? participants : undefined,
  };

  console.log("[Receipt] Final receipt data:", receiptData);
  return receiptData;
}
