/* Minimal Express server to receive contact form and send email via SMTP (nodemailer)
   Configure SMTP via environment variables. The recipient is set to the user's provided
   email but sanitized (spaces removed) to avoid common typos.
*/
require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Recipient (hard-coded from user input, sanitized)
const RAW_RECIPIENT = 'pranoy maz@gmail.com';
const RECIPIENT = RAW_RECIPIENT.replace(/\s+/g, '');

function validateEmail(e) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e || '');
}
function validatePhone(p) {
  return /^\+?\d{7,15}$/.test((p || '').trim());
}

app.post('/contact', async (req, res) => {
  try {
    const { name, business, email, phone, message } = req.body || {};
    if (!name || !email || !phone || !message) return res.status(400).json({ error: 'Missing required fields' });
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!validatePhone(phone)) return res.status(400).json({ error: 'Invalid phone' });

    // Require SMTP configuration
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ error: 'SMTP not configured on server. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true' || SMTP_PORT === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    const subject = `Website contact from ${name}${business ? ' — ' + business : ''}`;
    const text = `Name: ${name}\nBusiness: ${business || ''}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`;
    const html = `<p><strong>Name:</strong> ${name}</p>
      <p><strong>Business:</strong> ${business || ''}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <hr/>
      <p>${(message || '').replace(/\n/g, '<br/>')}</p>`;

    await transporter.sendMail({
      from: SMTP_USER,
      to: RECIPIENT,
      replyTo: email,
      subject,
      text,
      html
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error sending contact email:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
