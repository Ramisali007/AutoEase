/**
 * Certificate Generator Utility
 * Generates a downloadable PDF certificate for car bookings
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a booking certificate as a PDF
 * @param {Object} booking - The booking details
 * @param {Object} car - The car details
 * @param {Object} user - The user details
 * @returns {Blob} - The PDF file as a Blob
 */
export const generateBookingCertificate = (booking, car, user) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add company logo/header
  doc.setFontSize(22);
  doc.setTextColor(0, 102, 204);
  doc.text('AutoEase Car Rental', 105, 20, { align: 'center' });
  
  // Add certificate title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Booking Confirmation Certificate', 105, 35, { align: 'center' });
  
  // Add decorative line
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);
  
  // Add booking reference
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Booking Reference: ${booking.bookingId}`, 105, 50, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 57, { align: 'center' });
  
  // Add user information
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Customer Information', 20, 70);
  
  doc.setFontSize(12);
  doc.text(`Name: ${user.name || 'Customer'}`, 20, 80);
  doc.text(`Email: ${user.email || 'N/A'}`, 20, 87);
  
  // Add car information
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Vehicle Information', 20, 105);
  
  doc.setFontSize(12);
  doc.text(`Vehicle: ${car.brand} ${car.model} (${car.year})`, 20, 115);
  doc.text(`Type: ${car.type || 'N/A'}`, 20, 122);
  doc.text(`Transmission: ${car.transmission || 'N/A'}`, 20, 129);
  doc.text(`Seating Capacity: ${car.seatingCapacity || 'N/A'}`, 20, 136);
  
  // Add booking details
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Booking Details', 20, 155);
  
  doc.setFontSize(12);
  doc.text(`Pickup Date: ${booking.startDate || new Date().toLocaleDateString()}`, 20, 165);
  doc.text(`Return Date: ${booking.endDate || new Date(new Date().setDate(new Date().getDate() + 3)).toLocaleDateString()}`, 20, 172);
  doc.text(`Duration: ${booking.duration || '3'} days`, 20, 179);
  doc.text(`Total Amount: $${booking.totalAmount?.toFixed(2) || '0.00'}`, 20, 186);
  
  // Add terms and conditions
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Terms and Conditions:', 20, 205);
  doc.text('1. Please present this certificate along with your ID at the time of pickup.', 20, 212);
  doc.text('2. Cancellation policy: Free cancellation up to 24 hours before pickup.', 20, 219);
  doc.text('3. Late returns will incur additional charges.', 20, 226);
  
  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('AutoEase Car Rental - Your journey, our priority', 105, 250, { align: 'center' });
  doc.text('www.autoease.com | support@autoease.com | +1-234-567-8900', 105, 257, { align: 'center' });
  
  // Return the PDF as a blob
  return doc.output('blob');
};

/**
 * Download the booking certificate
 * @param {Object} booking - The booking details
 * @param {Object} car - The car details
 * @param {Object} user - The user details
 */
export const downloadBookingCertificate = (booking, car, user) => {
  const pdfBlob = generateBookingCertificate(booking, car, user);
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Create a link element and trigger download
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = `AutoEase_Booking_${booking.bookingId || 'Certificate'}.pdf`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(pdfUrl);
};

export default {
  generateBookingCertificate,
  downloadBookingCertificate
};
