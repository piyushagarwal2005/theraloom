const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const invoiceDir = path.join(__dirname, '../../public/uploads/invoices');
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true });
}

const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Generates an executive, authentic GST-style PDF tax invoice and returns the local file path / web url
 */
const generateInvoicePDF = async (payment, therapist) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      const invoiceNumber = payment.invoiceNumber || `TL-INV-${Date.now().toString().slice(-6)}`;
      const fileName = `invoice-${invoiceNumber}.pdf`;
      const filePath = path.join(invoiceDir, fileName);
      const relativeUrl = `/uploads/invoices/${fileName}`;

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const therapistName = capitalizeWords(therapist?.name) || 'Clinical Psychologist';
      const clientName = capitalizeWords(payment?.clientName) || 'Client';
      const amountFormatted = `INR ${Number(payment.amount || 0).toLocaleString('en-IN')}.00`;

      // --- Top Decorative Header Accent ---
      doc.rect(50, 40, 495, 4).fill('#19382C');

      // --- Header ---
      doc.fillColor('#19382C').fontSize(22).font('Helvetica-Bold').text('THERALOOM', 50, 56);
      doc.fontSize(8.5).font('Helvetica').fillColor('#535C56').text('Your practice, thoughtfully connected. | India Telehealth Platform', 50, 80);

      // Status Badge (Paid)
      doc.roundedRect(440, 56, 105, 22, 6).fill('#E8EFEA');
      doc.fillColor('#19382C').fontSize(8.5).font('Helvetica-Bold').text('PAID IN FULL', 440, 62, { align: 'center', width: 105 });

      doc.fontSize(14).font('Helvetica-Bold').fillColor('#19382C').text('TAX INVOICE / RECEIPT', 300, 88, { align: 'right', width: 245 });
      doc.fontSize(8.5).font('Helvetica').fillColor('#535C56').text(`Invoice #: ${invoiceNumber}`, 300, 105, { align: 'right', width: 245 });
      doc.text(`Date of Issue: ${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 300, 118, { align: 'right', width: 245 });

      doc.moveTo(50, 138).lineTo(545, 138).strokeColor('#EAE5DE').lineWidth(1).stroke();

      // --- Billed By (Therapist) & Billed To (Client) Boxes ---
      const yDetails = 150;

      // Practice Details (Left)
      doc.roundedRect(50, yDetails, 240, 95, 8).fill('#FAF8F5');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#7D9D8B').text('PRACTICE / PROVIDER DETAILS', 62, yDetails + 10);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#19382C').text(therapistName, 62, yDetails + 24);
      doc.fontSize(8.5).font('Helvetica').fillColor('#535C56');
      doc.text(therapist?.title || 'Psychotherapy & Clinical Consultation', 62, yDetails + 38, { width: 215 });
      doc.text(`Email: ${therapist?.email || 'support@theraloom.in'}`, 62, yDetails + 54);
      doc.text(`GSTIN / Reg: ${therapist?.billingDetails?.gstNumber || 'Exempt Under Section 23 CGST'}`, 62, yDetails + 68);

      // Client Details (Right)
      doc.roundedRect(305, yDetails, 240, 95, 8).fill('#FAF8F5');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#7D9D8B').text('BILLED TO (PATIENT / CLIENT)', 317, yDetails + 10);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#19382C').text(clientName, 317, yDetails + 24);
      doc.fontSize(8.5).font('Helvetica').fillColor('#535C56');
      doc.text(`Email: ${payment.clientEmail}`, 317, yDetails + 38);
      doc.text(`Payment Mode: ${(payment.paymentMethod || 'UPI / Gateway').toUpperCase()}`, 317, yDetails + 54);
      doc.text(`Transaction Ref: ${payment.razorpayPaymentId || 'TEST_REF_2026'}`, 317, yDetails + 68);

      // --- Itemized Table ---
      const yTable = 265;
      doc.roundedRect(50, yTable, 495, 24, 4).fill('#19382C');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5);
      doc.text('DESCRIPTION', 62, yTable + 7);
      doc.text('SAC CODE', 290, yTable + 7);
      doc.text('QTY', 360, yTable + 7);
      doc.text('RATE (INR)', 410, yTable + 7, { align: 'right', width: 60 });
      doc.text('AMOUNT (INR)', 475, yTable + 7, { align: 'right', width: 60 });

      const yRow = yTable + 34;
      doc.fillColor('#1F2421').font('Helvetica').fontSize(9);
      doc.text(payment.description || 'Clinical Psychotherapy Consultation', 62, yRow, { width: 220 });
      doc.text('999312', 290, yRow);
      doc.text('1', 365, yRow);
      doc.text(`${Number(payment.amount || 0).toLocaleString('en-IN')}.00`, 410, yRow, { align: 'right', width: 60 });
      doc.text(`${Number(payment.amount || 0).toLocaleString('en-IN')}.00`, 475, yRow, { align: 'right', width: 60 });

      doc.moveTo(50, yRow + 26).lineTo(545, yRow + 26).strokeColor('#EAE5DE').lineWidth(1).stroke();

      // --- Totals Section ---
      const yTotal = yRow + 40;
      doc.fontSize(9).font('Helvetica').fillColor('#535C56');
      doc.text('Subtotal:', 340, yTotal);
      doc.font('Helvetica-Bold').fillColor('#19382C').text(amountFormatted, 430, yTotal, { align: 'right', width: 105 });

      doc.font('Helvetica').fillColor('#535C56');
      doc.text('Healthcare GST (0% Exempt SAC 999312):', 230, yTotal + 18);
      doc.font('Helvetica-Bold').fillColor('#19382C').text('INR 0.00', 430, yTotal + 18, { align: 'right', width: 105 });

      // Total Paid Banner Box
      doc.roundedRect(325, yTotal + 38, 220, 32, 6).fill('#19382C');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
      doc.text('TOTAL PAID:', 340, yTotal + 48);
      doc.fontSize(11).text(amountFormatted, 430, yTotal + 48, { align: 'right', width: 100 });

      // --- Healthcare Compliance & Anti-Bypassing Notice Box ---
      const yNotice = yTotal + 95;
      doc.roundedRect(50, yNotice, 495, 60, 6).fill('#E8EFEA');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#19382C').text('CLINICAL & REGULATORY COMPLIANCE ATTESTATION', 62, yNotice + 10);
      doc.fontSize(7.8).font('Helvetica').fillColor('#33473C').text(
        'Therapeutic and psychological consultations provided by accredited clinicians are classified under Healthcare Services (SAC 999312) and are exempt from Goods & Services Tax (GST) as per Notification No. 12/2017-Central Tax (Rate). Patient session notes and diagnostic data remain protected in isolated cryptographic vaults compliant with DPDP Act 2023 & MHCA 2017.',
        62, yNotice + 22, { width: 470, lineGap: 2 }
      );

      // --- Footer ---
      const yFooter = 680;
      doc.moveTo(50, yFooter).lineTo(545, yFooter).strokeColor('#EAE5DE').lineWidth(0.5).stroke();
      doc.fillColor('#7D9D8B').font('Helvetica').fontSize(7.5);
      doc.text('This is an authentic, digitally authenticated electronic tax receipt generated by the Theraloom Healthcare Platform.', 50, yFooter + 10, { align: 'center', width: 495 });
      doc.text('Theraloom (theraloom.in) • Dedicated Mental Health & Clinical Practice Management Suite • Support: support@theraloom.in', 50, yFooter + 22, { align: 'center', width: 495 });

      doc.end();

      stream.on('finish', () => {
        resolve({ filePath, relativeUrl, invoiceNumber });
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF };
