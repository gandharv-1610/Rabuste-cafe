const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp, type) => {
  const subject = type === 'workshop' 
    ? 'Verify Your Workshop Registration - Rabuste Coffee'
    : 'Verify Your Franchise Enquiry - Rabuste Coffee';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #2C1810; color: #EFEBE9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6F00; font-size: 28px;">Rabuste Coffee</h1>
      </div>
      <div style="background-color: #5D4037; padding: 30px; border-radius: 10px;">
        <h2 style="color: #FF6F00; margin-bottom: 20px;">Email Verification</h2>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6;">
          Thank you for your interest! Please verify your email address by entering the OTP below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 36px; font-weight: bold; color: #FF6F00; letter-spacing: 8px;">${otp}</span>
          </div>
        </div>
        <p style="color: #EFEBE9; font-size: 14px; line-height: 1.6;">
          This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #BCAAA4; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Rabuste Coffee. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Rabuste Coffee" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send Workshop Confirmation Email
// calendarUrl is optional; when provided, a Google Calendar button is included.
const sendWorkshopConfirmationEmail = async (registration, workshop, calendarUrl) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #2C1810; color: #EFEBE9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6F00; font-size: 28px;">Rabuste Coffee</h1>
      </div>
      <div style="background-color: #5D4037; padding: 30px; border-radius: 10px;">
        <h2 style="color: #FF6F00; margin-bottom: 20px;">Workshop Registration Confirmed!</h2>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${registration.name},
        </p>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Your registration for <strong>${workshop.title}</strong> has been confirmed!
        </p>
        <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #FF6F00; margin-bottom: 15px;">Workshop Details</h3>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Date:</strong> ${formatDate(workshop.date)}</p>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Time:</strong> ${workshop.time} (${workshop.duration})</p>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Type:</strong> ${workshop.type}</p>
          ${workshop.instructor ? `<p style="color: #EFEBE9; margin: 10px 0;"><strong>Instructor:</strong> ${workshop.instructor}</p>` : ''}
          ${workshop.price > 0 ? `<p style="color: #EFEBE9; margin: 10px 0;"><strong>Price:</strong> ₹${workshop.price}</p>` : ''}
        </div>
        <div style="background-color: #3E2723; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #EFEBE9; margin: 5px 0;"><strong>Confirmation Code:</strong> ${registration.confirmationCode}</p>
        </div>
        ${calendarUrl ? `
        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a
            href="${calendarUrl}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: inline-block;
              padding: 12px 22px;
              background-color: #FF6F00;
              color: #1B130E;
              text-decoration: none;
              border-radius: 999px;
              font-size: 13px;
              font-weight: 600;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              border: 1px solid #FFB74D;
            "
          >
            Add to Google Calendar
          </a>
        </div>
        ` : ''}
        <p style="color: #EFEBE9; font-size: 14px; line-height: 1.6; margin-top: 16px;">
          We look forward to seeing you at the workshop! If you have any questions, please don't hesitate to contact us.
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #BCAAA4; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Rabuste Coffee. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Rabuste Coffee" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: `Workshop Confirmation: ${workshop.title}`,
      html
    });
    return true;
  } catch (error) {
    console.error('Confirmation email error:', error);
    return false;
  }
};

// Send Franchise Enquiry Confirmation
const sendFranchiseConfirmationEmail = async (enquiry) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #2C1810; color: #EFEBE9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6F00; font-size: 28px;">Rabuste Coffee</h1>
      </div>
      <div style="background-color: #5D4037; padding: 30px; border-radius: 10px;">
        <h2 style="color: #FF6F00; margin-bottom: 20px;">Franchise Enquiry Received</h2>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${enquiry.name},
        </p>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Thank you for your interest in franchising with Rabuste Coffee! We've received your enquiry and our team will review it shortly.
        </p>
        <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #FF6F00; margin-bottom: 15px;">Your Details</h3>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Location:</strong> ${enquiry.location}</p>
          ${enquiry.investmentRange ? `<p style="color: #EFEBE9; margin: 10px 0;"><strong>Investment Range:</strong> ${enquiry.investmentRange}</p>` : ''}
        </div>
        <p style="color: #EFEBE9; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          We'll be in touch with you soon. In the meantime, feel free to explore our website to learn more about Rabuste Coffee.
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #BCAAA4; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Rabuste Coffee. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Rabuste Coffee" <${process.env.EMAIL_USER}>`,
      to: enquiry.email,
      subject: 'Franchise Enquiry Received - Rabuste Coffee',
      html
    });
    return true;
  } catch (error) {
    console.error('Franchise confirmation email error:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWorkshopConfirmationEmail,
  sendFranchiseConfirmationEmail
};

