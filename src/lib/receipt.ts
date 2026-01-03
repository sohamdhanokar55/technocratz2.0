/**
 * PDF Receipt Generator using jsPDF
 */
import jsPDF from "jspdf";
import { loadLogosForReceipt } from "./imageConverter";

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

  // Load and add logos with fallback text
  try {
    console.log("[Receipt] Loading logos...");
    const { agnelLogo, technocratzLogo } = await loadLogosForReceipt();

    // Add Agnel logo (top left) or text fallback
    if (agnelLogo && agnelLogo.length > 100) {
      try {
        console.log("[Receipt] Adding Agnel logo image");
        doc.addImage(agnelLogo, "PNG", margin, yPos, 35, 20);
        console.log("[Receipt] ✅ Agnel logo image added");
      } catch (logoError) {
        console.error("[Receipt] Logo image failed, using text:", logoError);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Agnel Polytechnic", margin, yPos + 10);
      }
    } else {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Agnel Polytechnic", margin, yPos + 10);
    }

    // Add Technocratz logo (top right) or text fallback
    if (technocratzLogo && technocratzLogo.length > 100) {
      try {
        const techLogoX = pageWidth - margin - 35;
        console.log("[Receipt] Adding Technocratz logo image");
        doc.addImage(technocratzLogo, "PNG", techLogoX, yPos, 35, 20);
        console.log("[Receipt] ✅ Technocratz logo image added");
      } catch (logoError) {
        console.error("[Receipt] Logo image failed, using text:", logoError);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("APV Council", pageWidth - margin - 20, yPos + 10);
      }
    } else {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("APV Council", pageWidth - margin - 20, yPos + 10);
    }
  } catch (logoError) {
    console.error("[Receipt] ⚠️ Error in logo section:", logoError);
  }

  yPos += 30;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Technocratz 2.0", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Registration Receipt", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Registration Number - FIXED
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
    doc.setFont("helvetica", "normal");
    doc.setTextColor(5, 150, 105);
    doc.text(String(data.registrationNumber), margin + 58, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  } else {
    console.warn("[Receipt] ⚠️ Registration number is missing or empty");
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

  // Participants Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Participant Details:", margin, yPos);
  yPos += 10;

  // Check if multiple participants (team event)
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

      // Name
      if (participant.name) {
        doc.text(`Name: ${participant.name}`, margin + 6, yPos);
        yPos += 6;
      }

      // Department
      if (participant.department) {
        doc.text(`Department: ${participant.department}`, margin + 6, yPos);
        yPos += 6;
      }

      // Semester
      if (participant.semester) {
        doc.text(`Semester: ${participant.semester}`, margin + 6, yPos);
        yPos += 6;
      }

      // Email
      if (participant.email) {
        doc.text(`Email: ${participant.email}`, margin + 6, yPos);
        yPos += 6;
      }

      // Contact
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
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Payment ID
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Payment ID:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(192, 21, 47);
  doc.setFontSize(10);
  const paymentIdLines = doc.splitTextToSize(data.paymentId, contentWidth - 40);
  doc.text(paymentIdLines, margin + 35, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += paymentIdLines.length * 6 + 5;

  // Amount Paid
  if (data.amountPaid) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.text(`Amount Paid: Rs. ${data.amountPaid}`, margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
  }

  // Footer line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Footer text
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Thank you for registering for Technocratz 2.0",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 5;
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

  if (!registrationData || !paymentRecord) {
    console.error("[Receipt] Missing registration or payment data");
    return null;
  }

  const paymentId =
    paymentRecord.razorpay_payment_id || paymentRecord.payment_id || "";

  // Extract registration number - IMPROVED
  let registrationNumber: string | number | null =
    paymentRecord.registrationNumber ||
    paymentRecord.registration_number ||
    paymentRecord.srNo ||
    paymentRecord.sr_no ||
    paymentRecord.serial_number ||
    null;

  console.log("[Receipt] Extracted registration number:", registrationNumber);

  // Extract participants
  const participants: Participant[] = [];
  let mainDepartment = "";
  let mainSemester = "";

  if (registrationData.payload) {
    const payload = registrationData.payload;

    // Check for participants array (new format - team events)
    // ✅ NEW FORMAT SUPPORT
    if (Array.isArray(payload.participants)) {
      payload.participants.forEach((p: any) => {
        if (p.name) {
          participants.push({
            name: p.name,
            department: p.department,
            semester: p.semester,
            email: p.email,
            contact: p.contact,
          });
        }
      });
    }

    // Single participant event (old format)
    else if (payload.name) {
      console.log("[Receipt] Found single participant");
      mainDepartment = payload.department || payload.branch || "";
      mainSemester = payload.semester || "";
      participants.push({
        name: payload.name,
        department: mainDepartment,
        semester: mainSemester,
        email: payload.email || "",
        contact: payload.contact || "",
      });
    }
  }

  if (participants.length === 0) {
    console.error("[Receipt] No participants found");
    return null;
  }

  // Use first participant for leader fields
  const leader = participants[0];

  return {
    eventName,
    leaderName: leader.name,
    email: leader.email || "",
    contact: leader.contact || "",
    department: leader.department || mainDepartment,
    semester: leader.semester || mainSemester,
    institute: registrationData.payload?.institute || "",
    paymentId,
    registrationNumber, // Can be string or number
    amountPaid: registrationData.amountPaid,
    participants: participants.length > 1 ? participants : undefined,
  };
}
