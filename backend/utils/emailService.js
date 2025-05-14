// utils/emailService.js
const nodemailer = require('nodemailer');

// Initialize nodemailer transporter
let transporter;

// Determine if we're in development or production mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// For development, we'll use Ethereal Email by default
if (isDevelopment) {
  console.log('Running in development mode - using Ethereal Email for testing');

  // Create a test account on Ethereal Email
  nodemailer.createTestAccount().then(testAccount => {
    console.log('Ethereal Email test account created:');
    console.log('- User:', testAccount.user);
    console.log('- Pass:', testAccount.pass);

    // Create a transporter with the test account
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    console.log('Ethereal Email service configured. Emails will be sent to Ethereal Email for testing.');
  }).catch(err => {
    console.error('Failed to create Ethereal test account:', err);
    setupGmailTransport(); // Fall back to Gmail if Ethereal fails
  });
} else {
  // For production, use the configured SMTP settings (Gmail)
  setupGmailTransport();
}

// Function to set up Gmail transport
function setupGmailTransport() {
  // Log the SMTP configuration (without password)
  console.log('SMTP Configuration:');
  console.log('- Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('- Port:', process.env.SMTP_PORT || 465);
  console.log('- User:', process.env.SMTP_USER || 'f223703@cfd.nu.edu.pk');
  console.log('- Secure:', process.env.SMTP_SECURE === 'true' || true);

  // Create the transporter with the correct secure settings for Gmail
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === 'true' || true, // true for port 465
    auth: {
      user: process.env.SMTP_USER || 'f223703@cfd.nu.edu.pk',
      pass: process.env.SMTP_PASS
    },
    debug: true, // Enable debug output
    logger: true // Log information about the mail
  });
}

// Function to verify the email connection
function verifyEmailConnection() {
  // Check if transporter is initialized
  if (!transporter) {
    console.log('Email transporter not yet initialized. Will verify later.');
    // Try again in 2 seconds
    setTimeout(verifyEmailConnection, 2000);
    return;
  }

  // Test the connection
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP connection error:', error);

      // Only log detailed error info if we're not already using Ethereal
      if (!isDevelopment) {
        console.error('This might be due to:');
        console.error('1. Incorrect username or password');
        console.error('2. Gmail security settings blocking the connection');
        console.error('3. App Password not being used correctly');
        console.error('Please check your Gmail account settings and make sure:');
        console.error('- 2-Step Verification is enabled');
        console.error('- You\'re using an App Password, not your regular password');
        console.error('- The App Password is entered without spaces');
      }
    } else {
      console.log('SMTP server is ready to send emails');
    }
  });
}

// Start the verification process
setTimeout(verifyEmailConnection, 1000);

/**
 * Send email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 * @param {Buffer} attachments - Attachments (optional)
 * @returns {Promise<Object>} - Email info with preview URL if using Ethereal
 */
exports.sendEmail = async (to, subject, text, html, attachments) => {
  try {
    // Check if transporter is initialized
    if (!transporter) {
      console.log('Email transporter not yet initialized. Waiting...');
      // Wait for transporter to be initialized (max 5 seconds)
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (transporter) break;
      }

      // If still not initialized, throw error
      if (!transporter) {
        throw new Error('Email transporter not initialized after waiting');
      }
    }

    console.log(`Attempting to send email to ${to} with subject: ${subject}`);
    console.log('Email content:', text.substring(0, 100) + '...');

    // Email options
    const mailOptions = {
      from: `"AutoEase" <${isDevelopment ? 'noreply@autoease.com' : process.env.SMTP_USER}>`,
      to,
      subject,
      text
    };

    // Add HTML content if provided
    if (html) {
      mailOptions.html = html;
      console.log('HTML email content provided');
    }

    // Add attachments if provided
    if (attachments) {
      mailOptions.attachments = attachments;
    }

    console.log('Sending email with the following options:');
    console.log('- From:', mailOptions.from);
    console.log('- To:', mailOptions.to);
    console.log('- Subject:', mailOptions.subject);

    // Send email using the configured transporter
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);

    // If using Ethereal Email, provide a preview URL
    if (info.messageId && (info.messageId.includes('ethereal') || isDevelopment)) {
      try {
        const previewURL = nodemailer.getTestMessageUrl(info);
        if (previewURL) {
          console.log('Preview URL (open this in your browser to see the email): %s', previewURL);
          // Return the preview URL so we can show it to the user
          return { ...info, previewURL };
        }
      } catch (previewError) {
        console.error('Error generating preview URL:', previewError);
      }
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', error.message);

    if (error.code === 'EAUTH') {
      console.error('Authentication error. Please check your username and password.');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error. Please check your connection and SMTP settings.');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection error. Please check your SMTP host and port.');
    }

    // Don't throw the error, just log it and continue
    // This prevents email errors from breaking the main functionality
    return { messageId: 'error-sending-email', error: error.message };
  }
};

/**
 * Send booking confirmation email
 * @param {Object} booking - Booking object
 * @param {Object} user - User object
 */
exports.sendBookingConfirmation = async (booking, user) => {
  const subject = `Booking Confirmation - AutoEase #${booking.invoiceNumber}`;

  const text = `
    Dear ${user.name},

    Thank you for booking with AutoEase!

    Booking Details:
    - Car: ${booking.car.brand} ${booking.car.model}
    - Start Date: ${new Date(booking.startDate).toLocaleDateString()}
    - End Date: ${new Date(booking.endDate).toLocaleDateString()}
    - Pickup Location: ${booking.pickupLocation}
    - Total Amount: $${booking.totalAmount}

    Your booking has been confirmed. You can check all the details in your account dashboard.

    Thank you for choosing AutoEase!

    Best Regards,
    The AutoEase Team
  `;

  await exports.sendEmail(user.email, subject, text);
};

/**
 * Send reminder email
 * @param {Object} booking - Booking object
 * @param {Object} user - User object
 */
exports.sendReminderEmail = async (booking, user) => {
  const subject = `Reminder: Your AutoEase Booking #${booking.invoiceNumber}`;

  const text = `
    Dear ${user.name},

    This is a friendly reminder about your upcoming car rental:

    - Car: ${booking.car.brand} ${booking.car.model}
    - Start Date: ${new Date(booking.startDate).toLocaleDateString()}
    - End Date: ${new Date(booking.endDate).toLocaleDateString()}
    - Pickup Location: ${booking.pickupLocation}

    Please make sure to bring your driver's license and a valid ID for pickup.

    If you need to make any changes to your booking, please contact us as soon as possible.

    Thank you for choosing AutoEase!

    Best Regards,
    The AutoEase Team
  `;

  await exports.sendEmail(user.email, subject, text);
};