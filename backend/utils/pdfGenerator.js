// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');

exports.generatePdf = async (booking) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument();
      
      // Create a buffer to store the PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Add content to the PDF
      
      // Header
      doc.fontSize(20).text('AUTOEASE CAR RENTAL AGREEMENT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Contract #: ${booking._id}`, { align: 'right' });
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);
      
      // Parties
      doc.fontSize(14).text('RENTAL AGREEMENT BETWEEN:');
      doc.moveDown();
      doc.fontSize(12).text('AutoEase Car Rental Service (hereinafter referred to as "LESSOR")');
      doc.moveDown();
      doc.fontSize(12).text('AND');
      doc.moveDown();
      doc.fontSize(12).text(`${booking.user.name} (hereinafter referred to as "LESSEE")`);
      doc.moveDown(2);
      
      // User details
      doc.fontSize(14).text('LESSEE DETAILS:');
      doc.moveDown();
      doc.fontSize(12).text(`Name: ${booking.user.name}`);
      doc.fontSize(12).text(`Email: ${booking.user.email}`);
      doc.fontSize(12).text(`Phone: ${booking.user.phone}`);
      doc.fontSize(12).text(`Address: ${booking.user.address}`);
      doc.fontSize(12).text(`Driver's License: ${booking.user.driverLicense}`);
      doc.moveDown(2);
      
      // Car details
      doc.fontSize(14).text('VEHICLE DETAILS:');
      doc.moveDown();
      doc.fontSize(12).text(`Make & Model: ${booking.car.brand} ${booking.car.model}`);
      doc.fontSize(12).text(`Year: ${booking.car.year}`);
      doc.fontSize(12).text(`Type: ${booking.car.type}`);
      doc.fontSize(12).text(`Fuel Type: ${booking.car.fuelType}`);
      doc.fontSize(12).text(`Transmission: ${booking.car.transmission}`);
      doc.moveDown(2);
      
      // Rental details
      doc.fontSize(14).text('RENTAL DETAILS:');
      doc.moveDown();
      doc.fontSize(12).text(`Pickup Location: ${booking.pickupLocation}`);
      doc.fontSize(12).text(`Start Date: ${new Date(booking.startDate).toLocaleDateString()}`);
      doc.fontSize(12).text(`End Date: ${new Date(booking.endDate).toLocaleDateString()}`);
      doc.fontSize(12).text(`Daily Rate: $${booking.car.pricePerDay.toFixed(2)}`);
      doc.fontSize(12).text(`Total Amount: $${booking.totalAmount.toFixed(2)}`);
      doc.fontSize(12).text(`Invoice Number: ${booking.invoiceNumber}`);
      doc.moveDown(2);
      
      // Terms and conditions
      doc.fontSize(14).text('TERMS AND CONDITIONS:');
      doc.moveDown();
      doc.fontSize(10).text('1. The LESSEE agrees to return the vehicle in the same condition as received, except for normal wear and tear.');
      doc.fontSize(10).text('2. The LESSEE is responsible for any damages to the vehicle during the rental period.');
      doc.fontSize(10).text('3. The LESSEE must have a valid driver\'s license to operate the vehicle.');
      doc.fontSize(10).text('4. The vehicle must not be used for illegal purposes or in a manner that would void insurance.');
      doc.fontSize(10).text('5. Early returns will not result in a refund unless agreed upon in writing.');
      doc.fontSize(10).text('6. Late returns will incur additional charges at the daily rate plus a late fee.');
      doc.moveDown(2);
      
      // Signatures
      doc.fontSize(12).text('AGREED AND ACCEPTED:');
      doc.moveDown(2);
      doc.fontSize(12).text('____________________', { align: 'left' });
      doc.fontSize(10).text('LESSEE Signature', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12).text('____________________', { align: 'right' });
      doc.fontSize(10).text('LESSOR Signature', { align: 'right' });
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
};