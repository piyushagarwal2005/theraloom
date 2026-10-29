const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const invoiceDir = path.join(__dirname, '../../public/uploads/invoices');
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true });
}

/**
 * Generates a GST-style PDF invoice and returns the local file path / web url
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

      // --- Header ---
      doc.fillColor('#19382C').fontSize(22).font('Helvetica-Bold').text('THERALOOM', 50, 45);
      doc.fontSize(9).font('Helvetica').fillColor('#535C56').text('Your practice, thoughtfully connected.', 50, 70);
      
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#19382C').text('TAX INVOICE / RECEIPT', 350, 45, { align: 'right' });
      doc.fontSize(9).font('Helvetica').fillColor('#535C56').text(`Invoice #: ${invoiceNumber}`, 350, 68, { align: 'right' });
      doc.text(`Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 350, 82, { align: 'right' });

      doc.moveTo(50, 105).lineTo(545, 105).strokeColor('#EAE5DE').lineWidth(1).stroke();

      // --- Billed By (Therapist) & Billed To (Client) ---
      const yDetails = 120;
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#19382C').text('PRACTICE / PROVIDER DETAILS:', 50, yDetails);
      doc.font('Helvetica').fillColor('#1F2421').fontSize(9);
      doc.text(therapist?.name || 'Licensed Psychologist', 50, yDetails + 16);
      doc.text(therapist?.title || 'Psychotherapy & Counseling', 50, yDetails + 28);
      doc.text(`Email: ${therapist?.email || 'support@theraloom.in'}`, 50, yDetails + 40);
      if (therapist?.billingDetails?.gstNumber) {
        doc.text(`GSTIN: ${therapist.billingDetails.gstNumber}`, 50, yDetails + 52);
      }

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#19382C').text('BILLED TO (CLIENT):', 330, yDetails);
      doc.font('Helvetica').fillColor('#1F2421').fontSize(9);
      doc.text(payment.clientName, 330, yDetails + 16);
      doc.text(`Email: ${payment.clientEmail}`, 330, yDetails + 28);
      if (payment.paymentMethod) {
        doc.text(`Payment Mode: ${payment.paymentMethod.toUpperCase()}`, 330, yDetails + 40);
      }
      doc.text(`Transaction Ref: ${payment.razorpayPaymentId || 'TEST_PAYMENT_REF'}`, 330, yDetails + 52);

      // --- Itemized Table ---
      const yTable = 200;
      doc.rect(50, yTable, 495, 24).fill('#E4ECE7');
      doc.fillColor('#19382C').font('Helvetica-Bold').fontSize(9);
      doc.text('DESCRIPTION', 60, yTable + 7);
      doc.text('QTY', 350, yTable + 7);
      doc.text('RATE (INR)', 410, yTable + 7);
      doc.text('AMOUNT (INR)', 470, yTable + 7, { align: 'right', width: 65 });

      const yRow = yTable + 32;
      doc.fillColor('#1F2421').font('Helvetica').fontSize(9);
      doc.text(payment.description || 'Clinical Psychotherapy Consultation', 60, yRow);
      doc.text('1', 355, yRow);
      doc.text(`₹${payment.amount.toLocaleString('en-IN')}`, 410, yRow);
      doc.text(`₹${payment.amount.toLocaleString('en-IN')}`, 470, yRow, { align: 'right', width: 65 });

      doc.moveTo(50, yRow + 25).lineTo(545, yRow + 25).strokeColor('#EAE5DE').stroke();

      // --- Totals ---
      const yTotal = yRow + 40;
      doc.text('Subtotal:', 380, yTotal);
      doc.text(`₹${payment.amount.toLocaleString('en-IN')}`, 470, yTotal, { align: 'right', width: 65 });

      doc.text('GST / Taxes (0% Exempt Healthcare):', 260, yTotal + 16);
      doc.text('₹0.00', 470, yTotal + 16, { align: 'right', width: 65 });

      doc.rect(370, yTotal + 34, 175, 26).fill('#19382C');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
      doc.text('TOTAL PAID:', 380, yTotal + 42);
      doc.text(`₹${payment.amount.toLocaleString('en-IN')}`, 470, yTotal + 42, { align: 'right', width: 65 });

      // --- Footer ---
      doc.fillColor('#535C56').font('Helvetica').fontSize(8);
      const footerY = 700;
      doc.text('This is an authentic, system-generated electronic invoice generated via Theraloom SaaS Platform.', 50, footerY, { align: 'center', width: 495 });
      doc.text('All clinical records and payment receipts are confidential and protected under Indian Telehealth regulations.', 50, footerY + 12, { align: 'center', width: 495 });

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
