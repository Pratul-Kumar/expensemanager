import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const userEmail = process.env.GMAIL_EMAIL;
const appPassword = process.env.GMAIL_APP_PASSWORD;

// Only create transporter if credentials exist
const transporter = (userEmail && appPassword) ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: userEmail,
    pass: appPassword,
  },
}) : null;

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    if (!transporter) {
      console.log('GMAIL_EMAIL or GMAIL_APP_PASSWORD missing. Mocking email to:', email);
      return NextResponse.json({ success: true, mocked: true });
    }

    const firstName = name.split(' ')[0];
    const fromString = `"Team RakhLo" <${userEmail}>`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-bottom: 1px solid #eaeaea;">
          <h1 style="margin: 0; color: #111827; font-size: 24px; letter-spacing: -0.5px;">RAKHLO</h1>
          <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Keep track. Keep it simple...</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="margin: 0 0 20px; color: #111827; font-size: 20px;">Welcome, ${firstName}! 👋</h2>
          
          <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.5;">
            Thanks for signing in to RakhLo.
          </p>
          
          <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.5;">
            RakhLo helps you keep your notes, expenses and reminders organized in one simple place.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://rakhlo.vercel.app" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px; display: inline-block;">
              Open RakhLo
            </a>
          </div>
          
          <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.5;">
            You can now start adding notes, tracking expenses and setting reminders.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #eaeaea;">
          <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; text-align: center;">
            Your data is private and secure.
          </p>
          
          <p style="margin: 0 0 16px; color: #374151; font-size: 15px; text-align: center;">
            Thanks for choosing RakhLo. ❤️
          </p>
          
          <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
            — Team RakhLo
          </p>
          <p style="margin: 4px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
            Built By Pratul with love By using AI
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: fromString,
      to: email,
      subject: 'Welcome to RakhLo! 👋',
      html: htmlContent,
    });

    console.log('Successfully sent welcome email via Gmail to', email);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending welcome email via Nodemailer:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
