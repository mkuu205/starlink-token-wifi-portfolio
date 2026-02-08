const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const pool = require('../config/database');

class EmailService {
  constructor() {
    this.emailProvider = process.env.EMAIL_PROVIDER || 'nodemailer';
    
    if (this.emailProvider === 'resend') {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  /**
   * Send email notification
   */
  async sendNotification(to, subject, htmlContent) {
    try {
      if (this.emailProvider === 'resend') {
        await this.resend.emails.send({
          from: 'Portfolio Admin <admin@yourdomain.com>',
          to: [to],
          subject: subject,
          html: htmlContent,
        });
      } else {
        await this.transporter.sendMail({
          from: `"Portfolio Admin" <${process.env.EMAIL_USER}>`,
          to: to,
          subject: subject,
          html: htmlContent,
        });
      }
      
      console.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  /**
   * Send admin notification for updates
   */
  async sendAdminUpdateNotification(entityType, action, entityData, adminEmail) {
    if (process.env.NOTIFY_ON_UPDATE !== 'true') return;
    
    const subject = `Portfolio ${entityType} ${action}d`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Portfolio Update Notification</h2>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151;">${entityType.toUpperCase()} ${action.toUpperCase()}</h3>
          <p><strong>Action:</strong> ${action}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Details:</strong></p>
          <pre style="background-color: white; padding: 15px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(entityData, null, 2)}
          </pre>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated notification from your portfolio admin panel.
        </p>
      </div>
    `;
    
    return await this.sendNotification(adminEmail, subject, htmlContent);
  }

  /**
   * Send update confirmation to user (if applicable)
   */
  async sendUserUpdateConfirmation(email, entityType, action, details) {
    const subject = `Your ${entityType} has been ${action}d`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Update Confirmation</h2>
        <p>Hello,</p>
        <p>Your ${entityType} has been successfully ${action}d.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Details:</strong> ${details}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Thank you for using our service!</p>
      </div>
    `;
    
    return await this.sendNotification(email, subject, htmlContent);
  }
}

module.exports = new EmailService();
