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
  institute: string;
  paymentId: string;
  registrationNumber?: string;
  amountPaid?: number;
  participants?: Participant[]; // For team events
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

  // Try to add logos (top left and top right)
  try {
    // Agnel logo (top left) - try from public folder first
    const agnelLogoPath = "technocratz2.0/agnel-logo-Ce5saIek.png";
    // Technocratz logo (top right) - try from public folder first
    const technocratzLogoPath = "technocratz2.0/technocratz-logo-BE52XFQ0.png";

    // Note: jsPDF addImage requires base64 or URL. For production, you may need to convert images to base64
    // For now, we'll add text placeholders and the user can add actual images later
    // If images are in public folder, they can be loaded and converted to base64

    // Placeholder: Add text labels where logos should be
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Agnel Polytechnic", margin, yPos + 5);
    doc.text("APV Council", pageWidth - margin - 30, yPos + 5);
  } catch (logoError) {
    console.warn("[Receipt] Could not load logos:", logoError);
  }

  yPos += 15;

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

  // Registration Number (if available)
  if (data.registrationNumber) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Registration Number:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(data.registrationNumber, margin + 55, yPos);
    yPos += 10;
  }

  // Event Name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Event Name:", margin, yPos);
  doc.setFont("helvetica", "normal");
  const eventLines = doc.splitTextToSize(data.eventName, contentWidth - 40);
  doc.text(eventLines, margin + 35, yPos);
  yPos += eventLines.length * 7 + 5;

  // Participants Section
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Participant Details:", margin, yPos);
  yPos += 8;

  // If team event with multiple participants
  if (data.participants && data.participants.length > 0) {
    data.participants.forEach((participant, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Participant ${index + 1}:`, margin, yPos);
      yPos += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      // Name
      doc.text(`  Name: ${participant.name}`, margin + 5, yPos);
      yPos += 6;

      // Department
      if (participant.department) {
        doc.text(`  Department: ${participant.department}`, margin + 5, yPos);
        yPos += 6;
      }

      // Semester
      if (participant.semester) {
        doc.text(`  Semester: ${participant.semester}`, margin + 5, yPos);
        yPos += 6;
      }

      // Email
      if (participant.email) {
        doc.text(`  Email: ${participant.email}`, margin + 5, yPos);
        yPos += 6;
      }

      // Contact
      if (participant.contact) {
        doc.text(`  Contact: ${participant.contact}`, margin + 5, yPos);
        yPos += 6;
      }

      yPos += 3; // Space between participants
    });
  } else {
    // Single participant (leader)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`  Name: ${data.leaderName}`, margin + 5, yPos);
    yPos += 6;

    // Email
    doc.text(`  Email: ${data.email}`, margin + 5, yPos);
    yPos += 6;

    // Contact
    doc.text(`  Contact: ${data.contact}`, margin + 5, yPos);
    yPos += 6;

    // Institute
    if (data.institute) {
      const instituteLines = doc.splitTextToSize(
        `  Institute: ${data.institute}`,
        contentWidth - 10
      );
      doc.text(instituteLines, margin + 5, yPos);
      yPos += instituteLines.length * 6;
    }
  }

  // Payment ID
  yPos += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Payment ID:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.paymentId, margin + 30, yPos);
  yPos += 10;

  // Amount Paid
  if (data.amountPaid) {
    yPos += 5;
    doc.setFontSize(12);
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
  doc.text(
    "Thank you for registering for Technocratz 2.0",
    pageWidth / 2,
    yPos,
    {
      align: "center",
    }
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
  const registrationNumber =
    paymentRecord.registrationNumber ||
    paymentRecord.registration_number ||
    paymentRecord.srNo ||
    paymentRecord.sr_no ||
    paymentRecord.serial_number ||
    "";

  // Extract participants
  const participants: Participant[] = [];

  if (registrationData.payload) {
    const payload = registrationData.payload;

    // Single participant events
    if (payload.name) {
      participants.push({
        name: payload.name,
        department: payload.branch,
        semester: payload.semester,
        email: payload.email || "",
        contact: payload.contact || "",
      });
    }
    // Team events
    else if (payload.leader) {
      // Add leader as first participant
      participants.push({
        name: payload.leader.name || "",
        department: payload.leader.branch,
        semester: payload.leader.semester,
        email: payload.leader.email || "",
        contact: payload.leader.contact || "",
      });

      // Add team members
      if (payload.members && Array.isArray(payload.members)) {
        payload.members.forEach((member: any) => {
          participants.push({
            name: member.name || "",
            department: member.branch,
            semester: member.semester,
            email: member.email || "",
            contact: member.contact || "",
          });
        });
      }
    }
  }

  if (participants.length === 0) {
    console.error("[Receipt] No participants found");
    return null;
  }

  // Use first participant (leader) for main fields
  const leader = participants[0];

  return {
    eventName,
    leaderName: leader.name,
    email: leader.email || "",
    contact: leader.contact || "",
    institute:
      registrationData.payload?.leader?.institute ||
      registrationData.payload?.institute ||
      "",
    paymentId,
    registrationNumber,
    amountPaid: registrationData.amountPaid,
    participants: participants.length > 1 ? participants : undefined, // Only include if multiple
  };
}
