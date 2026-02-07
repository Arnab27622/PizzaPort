import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Validate request body
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Configure Nodemailer transporter
    // For Gmail, enable "App Password" if 2FA is on.
    // For other providers, use their specific SMTP settings.
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can replace this with host/port for other providers
      auth: {
        user: process.env.SMTP_EMAIL, // Your email address
        pass: process.env.SMTP_PASSWORD, // Your app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.SMTP_EMAIL, // Sender address (must be the authenticated email)
      to: process.env.NEXT_PUBLIC_CONTACT_EMAIL, // Receiver address
      replyTo: email, // Reply to the customer's email
      subject: `New Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Message:
${message}
        `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <div style="background-color: #293380; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Contact Message</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">You have a new inquiry from your website</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <!-- Sender Info -->
                <div style="margin-bottom: 30px;">
                  <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0;">Sender Information</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; color: #666; font-size: 14px; width: 100px; vertical-align: top;">Name:</td>
                      <td style="padding: 12px 0; color: #1a1a1a; font-size: 16px; font-weight: 500;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-top: 1px solid #f5f5f5; color: #666; font-size: 14px; width: 100px; vertical-align: top;">Email:</td>
                      <td style="padding: 12px 0; border-top: 1px solid #f5f5f5; color: #1a1a1a; font-size: 16px; font-weight: 500;">
                        <a href="mailto:${email}" style="color: #293380; text-decoration: none;">${email}</a>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <!-- Message Body -->
                <div>
                  <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 15px 0;">Message</h2>
                  <div style="background-color: #f8f9fa; border-left: 4px solid #293380; padding: 20px; border-radius: 4px; color: #4a4a4a; line-height: 1.6; font-size: 15px;">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                
                <!-- Action Button -->
                <div style="margin-top: 35px; text-align: center;">
                  <a href="mailto:${email}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Reply to Customer</a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; color: #999; font-size: 13px;">Sent via PizzaPort Contact Form</p>
                <p style="margin: 5px 0 0 0; color: #999; font-size: 13px;">${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
              </div>
            </div>
            
            <p style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              &copy; ${new Date().getFullYear()} PizzaPort Express. All rights reserved.
            </p>
          </div>
        </body>
        </html>
        `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
