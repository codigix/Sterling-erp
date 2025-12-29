require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing Email Configuration...');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('Port:', process.env.EMAIL_PORT);
  console.log('User:', process.env.EMAIL_USER);
  console.log('Secure:', process.env.EMAIL_SECURE);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test Email from Sterling ERP',
      text: 'If you receive this, your email configuration is working correctly!'
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail();