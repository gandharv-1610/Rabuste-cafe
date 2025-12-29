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
  let subject;
  if (type === 'workshop') {
    subject = 'Verify Your Workshop Registration - Rabuste Coffee';
  } else if (type === 'franchise') {
    subject = 'Verify Your Franchise Enquiry - Rabuste Coffee';
  } else if (type === 'customer-email') {
    subject = 'Verify Your Email - Rabuste Coffee';
  } else {
    subject = 'Email Verification - Rabuste Coffee';
  }

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

// ============================================
// MARKETING EMAIL FUNCTIONS
// ============================================
// These functions send consent-based marketing emails to subscribed customers
// IMPORTANT: Only send to customers with marketingConsent = true

/**
 * Send new coffee item announcement email
 * @param {Object} customer - Customer object with name and email
 * @param {Object} coffee - Coffee item object
 * @returns {Promise<boolean>} Success status
 */
const sendCoffeeAnnouncementEmail = async (customer, coffee) => {
  const customerName = customer.name || 'Coffee Lover';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const menuUrl = `${frontendUrl}/menu`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #2C1810; color: #EFEBE9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6F00; font-size: 28px;">Rabuste Coffee</h1>
      </div>
      <div style="background-color: #5D4037; padding: 30px; border-radius: 10px;">
        <h2 style="color: #FF6F00; margin-bottom: 20px;">New Coffee Alert! ☕</h2>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${customerName},
        </p>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We're excited to introduce our newest addition to the menu!
        </p>
        <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #FF6F00; margin-bottom: 15px; font-size: 22px;">${coffee.name}</h3>
          ${coffee.description ? `<p style="color: #EFEBE9; margin: 10px 0; line-height: 1.6;">${coffee.description}</p>` : ''}
          ${coffee.strength ? `<p style="color: #EFEBE9; margin: 10px 0;"><strong>Strength:</strong> ${coffee.strength}</p>` : ''}
          ${coffee.flavorNotes && coffee.flavorNotes.length > 0 ? `
            <p style="color: #EFEBE9; margin: 10px 0;"><strong>Flavor Notes:</strong> ${coffee.flavorNotes.join(', ')}</p>
          ` : ''}
        </div>
        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a
            href="${menuUrl}"
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
            View Menu
          </a>
        </div>
        <p style="color: #EFEBE9; font-size: 14px; line-height: 1.6; margin-top: 16px;">
          Visit us soon to try this amazing new coffee! We can't wait to share it with you.
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #BCAAA4; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Rabuste Coffee. All rights reserved.</p>
        <p style="margin-top: 8px;">
          <a href="${frontendUrl}/unsubscribe" style="color: #BCAAA4; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Rabuste Coffee" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: `New Coffee Alert: ${coffee.name} - Rabuste Coffee`,
      html
    });
    return true;
  } catch (error) {
    console.error('Coffee announcement email error:', error);
    return false;
  }
};

/**
 * Send daily offer announcement email
 * @param {Object} customer - Customer object with name and email
 * @param {Object} offer - Offer object
 * @returns {Promise<boolean>} Success status
 */
const sendOfferAnnouncementEmail = async (customer, offer) => {
  const customerName = customer.name || 'Coffee Lover';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const menuUrl = `${frontendUrl}/menu`;

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const discountText = offer.discountUnit === 'percent'
    ? `${offer.discountValue}% OFF`
    : `Flat ₹${offer.discountValue} OFF`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #2C1810; color: #EFEBE9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6F00; font-size: 28px;">Rabuste Coffee</h1>
      </div>
      <div style="background-color: #5D4037; padding: 30px; border-radius: 10px;">
        ${offer.badgeText ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; background-color: #FF6F00; color: #1B130E; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              ${offer.badgeText}
            </span>
          </div>
        ` : ''}
        <h2 style="color: #FF6F00; margin-bottom: 20px; text-align: center;">${offer.title}</h2>
        ${offer.subtitle ? `<p style="color: #EFEBE9; font-size: 18px; text-align: center; margin-bottom: 20px;">${offer.subtitle}</p>` : ''}
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${customerName},
        </p>
        <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: #FF6F00; font-size: 32px; font-weight: bold; margin: 10px 0;">${discountText}</p>
          ${offer.description ? `<p style="color: #EFEBE9; margin: 10px 0; line-height: 1.6;">${offer.description}</p>` : ''}
        </div>
        ${offer.terms ? `
          <div style="background-color: #3E2723; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #EFEBE9; margin: 5px 0; font-size: 14px;"><strong>Terms:</strong> ${offer.terms}</p>
          </div>
        ` : ''}
        ${offer.endDate ? `
          <p style="color: #FF6F00; font-size: 14px; text-align: center; margin: 20px 0; font-weight: 600;">
            ⏰ Valid until ${formatDate(offer.endDate)}
          </p>
        ` : ''}
        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a
            href="${menuUrl}"
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
            Order Now
          </a>
        </div>
        <p style="color: #EFEBE9; font-size: 14px; line-height: 1.6; margin-top: 16px; text-align: center;">
          Don't miss out on this special offer! Visit us today.
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #BCAAA4; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Rabuste Coffee. All rights reserved.</p>
        <p style="margin-top: 8px;">
          <a href="${frontendUrl}/unsubscribe" style="color: #BCAAA4; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Rabuste Coffee" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: `Special Offer: ${offer.title} - Rabuste Coffee`,
      html
    });
    return true;
  } catch (error) {
    console.error('Offer announcement email error:', error);
    return false;
  }
};

/**
 * Send workshop announcement email
 * @param {Object} customer - Customer object with name and email
 * @param {Object} workshop - Workshop object
 * @returns {Promise<boolean>} Success status
 */
const sendWorkshopAnnouncementEmail = async (customer, workshop) => {
  const customerName = customer.name || 'Coffee Lover';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const workshopUrl = `${frontendUrl}/workshops`;

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
        <h2 style="color: #FF6F00; margin-bottom: 20px;">New Workshop Alert! 🎨</h2>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${customerName},
        </p>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We're excited to announce a new workshop that you might be interested in!
        </p>
        <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #FF6F00; margin-bottom: 15px; font-size: 22px;">${workshop.title}</h3>
          ${workshop.description ? `<p style="color: #EFEBE9; margin: 10px 0; line-height: 1.6;">${workshop.description}</p>` : ''}
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Type:</strong> ${workshop.type}</p>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Date:</strong> ${formatDate(workshop.date)}</p>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Time:</strong> ${workshop.time} (${workshop.duration})</p>
          ${workshop.instructor ? `<p style="color: #EFEBE9; margin: 10px 0;"><strong>Instructor:</strong> ${workshop.instructor}</p>` : ''}
          ${workshop.price > 0 ? `<p style="color: #EFEBE9; margin: 10px 0;"><strong>Price:</strong> ₹${workshop.price}</p>` : ''}
          <p style="color: #FF6F00; margin: 15px 0 5px 0; font-weight: 600;">
            ⚠️ Limited Seats: ${workshop.maxSeats - (workshop.bookedSeats || 0)} seats remaining
          </p>
        </div>
        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a
            href="${workshopUrl}"
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
            Register Now
          </a>
        </div>
        <p style="color: #EFEBE9; font-size: 14px; line-height: 1.6; margin-top: 16px;">
          Seats are limited, so don't wait! Register now to secure your spot.
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #BCAAA4; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Rabuste Coffee. All rights reserved.</p>
        <p style="margin-top: 8px;">
          <a href="${frontendUrl}/unsubscribe" style="color: #BCAAA4; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Rabuste Coffee" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: `New Workshop: ${workshop.title} - Rabuste Coffee`,
      html
    });
    return true;
  } catch (error) {
    console.error('Workshop announcement email error:', error);
    return false;
  }
};

/**
 * Send marketing email to multiple customers (batch)
 * @param {Array} customers - Array of customer objects
 * @param {Function} emailFunction - Function to send email (coffee/offer/workshop)
 * @param {Object} contentData - Data for email content (coffee/offer/workshop object)
 * @returns {Promise<Object>} Results with success/failure counts
 */
const sendBatchMarketingEmails = async (customers, emailFunction, contentData) => {
  const results = {
    total: customers.length,
    success: 0,
    failed: 0,
    errors: []
  };

  // Send emails sequentially to avoid overwhelming the email service
  // In production, consider using a queue system (Bull, RabbitMQ, etc.)
  for (const customer of customers) {
    try {
      // Double-check consent before sending
      if (!customer.marketingConsent || !customer.email) {
        results.failed++;
        results.errors.push({
          email: customer.email,
          reason: 'No marketing consent or missing email'
        });
        continue;
      }

      const success = await emailFunction(customer, contentData);
      if (success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({
          email: customer.email,
          reason: 'Email sending failed'
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: customer.email,
        reason: error.message
      });
      console.error(`Error sending email to ${customer.email}:`, error);
    }
  }

  return results;
};

// Send Pre-Order Acceptance Email
const sendPreOrderAcceptanceEmail = async (order) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #2C1810; color: #EFEBE9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6F00; font-size: 28px;">Rabuste Coffee</h1>
      </div>
      <div style="background-color: #5D4037; padding: 30px; border-radius: 10px;">
        <h2 style="color: #FF6F00; margin-bottom: 20px;">Pre-Order Accepted! ✅</h2>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${order.customerName},
        </p>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Great news! Your pre-order <strong>#${order.orderNumber}</strong> has been accepted and is being prepared.
        </p>
        <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #FF6F00; margin-bottom: 15px;">Order Details</h3>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Pickup Time:</strong> ${order.pickupTimeSlot}</p>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Total Amount:</strong> ₹${order.total.toFixed(2)}</p>
        </div>
        <p style="color: #EFEBE9; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          We're preparing your order and it will be ready for pickup at the scheduled time. See you soon!
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
      to: order.customerEmail,
      subject: `Pre-Order Accepted: Order #${order.orderNumber} - Rabuste Coffee`,
      html
    });
    return true;
  } catch (error) {
    console.error('Pre-order acceptance email error:', error);
    return false;
  }
};

// Send Pre-Order Cancellation Email
const sendPreOrderCancellationEmail = async (order) => {
  // Get customer support number from preorder settings
  const PreOrderSettings = require('../models/PreOrderSettings');
  let customerSupportNumber = 'XXX-XXX-XXXX';
  try {
    const settings = await PreOrderSettings.getSettings();
    customerSupportNumber = settings.customerSupportNumber || 'XXX-XXX-XXXX';
  } catch (error) {
    console.error('Error fetching preorder settings for email:', error);
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #2C1810; color: #EFEBE9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6F00; font-size: 28px;">Rabuste Coffee</h1>
      </div>
      <div style="background-color: #5D4037; padding: 30px; border-radius: 10px;">
        <h2 style="color: #FF6F00; margin-bottom: 20px;">Pre-Order Cancelled</h2>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hello ${order.customerName},
        </p>
        <p style="color: #EFEBE9; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We regret to inform you that your pre-order <strong>#${order.orderNumber}</strong> has been cancelled.
        </p>
        <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #FF6F00; margin-bottom: 15px;">Order Details</h3>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Pickup Time:</strong> ${order.pickupTimeSlot}</p>
          <p style="color: #EFEBE9; margin: 10px 0;"><strong>Amount:</strong> ₹${order.total.toFixed(2)}</p>
        </div>
        ${order.paymentStatus === 'Refunded' ? `
          <div style="background-color: rgba(76, 175, 80, 0.2); border: 2px solid #4CAF50; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #4CAF50; font-weight: bold; margin: 0;">
              💰 Refund Processed: A refund of ₹${order.total.toFixed(2)} has been initiated and will be credited to your account within 5-7 business days.
            </p>
          </div>
        ` : ''}
        <div style="background-color: #3E2723; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #EFEBE9; font-size: 14px; line-height: 1.6; margin: 10px 0;">
            We sincerely apologize for any inconvenience caused. If you have any questions or concerns regarding the refund process, please contact our customer support.
          </p>
          <p style="color: #FF6F00; font-size: 16px; font-weight: bold; margin: 15px 0 5px 0;">
            Customer Support Number: ${customerSupportNumber}
          </p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #BCAAA4; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Rabuste Coffee. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Rabuste Coffee" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Pre-Order Cancelled: Order #${order.orderNumber} - Rabuste Coffee`,
      html
    });
    return true;
  } catch (error) {
    console.error('Pre-order cancellation email error:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWorkshopConfirmationEmail,
  sendFranchiseConfirmationEmail,
  // Marketing emails
  sendCoffeeAnnouncementEmail,
  sendOfferAnnouncementEmail,
  sendWorkshopAnnouncementEmail,
  sendBatchMarketingEmails,
  // Pre-order emails
  sendPreOrderAcceptanceEmail,
  sendPreOrderCancellationEmail
};

