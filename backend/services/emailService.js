const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    // Reload env vars to ensure we have the latest
    // This helps if the service is instantiated before dotenv (though it shouldn't be)
    
    console.log('📧 Initializing Email Service with credentials from .env');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false 
      }
    });

    this.verifyConnection();
  }

  async verifyConnection() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection established successfully');
      this.initialized = true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error.message);
    }
  }

  async sendMail({ to, subject, text, html, attachments }) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email credentials not configured in .env file');
        return { success: false, message: 'Email credentials not configured' };
      }

      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
      console.log(`📤 Attempting to send email FROM: ${fromEmail} TO: ${to}`);

      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Sterling ERP'}" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
        attachments
      });

      console.log('✅ Email sent successfully from:', fromEmail, 'Message ID:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
