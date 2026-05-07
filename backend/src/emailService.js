const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = 'marcojxmartins@gmail.com';

async function sendWelcomeEmail(userEmail, userName, password) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'SprintBase <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `🚀 New User Created: ${userEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { background: white; padding: 40px 30px; }
            .credentials { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; }
            .credential-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .credential-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #6b7280; font-size: 14px; }
            .value { font-family: 'Courier New', monospace; color: #111827; background: white; padding: 8px 12px; border-radius: 6px; font-size: 14px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
            .footer { background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; padding: 30px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 6px; font-size: 14px; }
            .features { list-style: none; padding: 0; }
            .features li { padding: 8px 0; color: #4b5563; }
            .features li:before { content: '✓'; color: #10b981; font-weight: bold; margin-right: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🚀 Welcome to SprintBase!</h1>
              <p style="margin: 12px 0 0 0; opacity: 0.95; font-size: 16px;">Your account has been created</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Hi <strong>Admin</strong>,</p>
              
              <p style="font-size: 15px; color: #4b5563;">A new user has been created. Share these credentials with them:</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0; color: #111827; font-size: 18px;">🔐 User Credentials</h3>
                <div class="credential-row">
                  <span class="label">Name</span>
                  <span class="value">${userName || 'N/A'}</span>
                </div>
                <div class="credential-row">
                  <span class="label">Email</span>
                  <span class="value">${userEmail}</span>
                </div>
                <div class="credential-row">
                  <span class="label">Password</span>
                  <span class="value">${password}</span>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security reasons.
              </div>
              
              <div style="text-align: center;">
                <a href="${appUrl}/login" class="button">Sign In to SprintBase →</a>
              </div>
              
              <h3 style="color: #111827; margin-top: 40px; font-size: 18px;">What you can do with SprintBase:</h3>
              <ul class="features">
                <li>Create and manage sprints with start/end dates</li>
                <li>Track tasks with priorities, hours, and assignees</li>
                <li>Monitor progress with real-time weighted progress bars</li>
                <li>Export professional PDF reports</li>
                <li>Collaborate with your team seamlessly</li>
              </ul>
              
              <p style="color: #6b7280; margin-top: 40px; font-size: 14px;">If you have any questions, feel free to reach out to your administrator.</p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">This email was sent by <strong>SprintBase</strong></p>
              <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} SprintBase. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send email:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Welcome email sent to:', userEmail, '| ID:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendInviteEmail,
  sendCompanyWelcomeEmail,
};

async function sendInviteEmail(userEmail, companyName, token) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const acceptUrl = `${appUrl}/accept-invite/${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'SprintBase <onboarding@resend.dev>',
      to: [adminEmail], // Send to admin for testing
      subject: `🎉 You're invited to join ${companyName} on SprintBase`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { background: white; padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
            .footer { background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; padding: 30px; }
            .info-box { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🎉 You're Invited!</h1>
              <p style="margin: 12px 0 0 0; opacity: 0.95; font-size: 16px;">Join ${companyName} on SprintBase</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Hi there,</p>
              
              <p style="font-size: 15px; color: #4b5563;"><strong>${companyName}</strong> has invited you to join their team on SprintBase!</p>
              
              <div class="info-box">
                <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Invited email:</strong> ${userEmail}</p>
              </div>
              
              <p style="font-size: 15px; color: #4b5563;">Click the button below to accept the invitation and create your account:</p>
              
              <div style="text-align: center;">
                <a href="${acceptUrl}" class="button">Accept Invitation →</a>
              </div>
              
              <p style="color: #9ca3af; font-size: 13px; margin-top: 30px;">This invitation will expire in 7 days.</p>
              <p style="color: #9ca3af; font-size: 13px;">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">This email was sent by <strong>SprintBase</strong></p>
              <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} SprintBase. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send invite email:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Invite email sent to:', userEmail, '| ID:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Invite email service error:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendCompanyWelcomeEmail(companyEmail, companyName, ownerName) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'SprintBase <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `🚀 Welcome to SprintBase - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { background: white; padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 24px 0; }
            .footer { background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; padding: 30px; }
            .features { list-style: none; padding: 0; }
            .features li { padding: 8px 0; color: #4b5563; }
            .features li:before { content: '✓'; color: #10b981; font-weight: bold; margin-right: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🚀 Welcome to SprintBase!</h1>
              <p style="margin: 12px 0 0 0; opacity: 0.95; font-size: 16px;">${companyName} is ready to go</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Hi <strong>${ownerName}</strong>,</p>
              
              <p style="font-size: 15px; color: #4b5563;">Welcome to SprintBase! Your company <strong>${companyName}</strong> has been successfully registered.</p>
              
              <h3 style="color: #111827; margin-top: 30px; font-size: 18px;">What's next?</h3>
              <ul class="features">
                <li>Invite your team members</li>
                <li>Create your first sprint</li>
                <li>Start tracking tasks</li>
                <li>Export professional reports</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${appUrl}/app/dashboard" class="button">Go to Dashboard →</a>
              </div>
              
              <p style="color: #6b7280; margin-top: 40px; font-size: 14px;">You're currently on the <strong>Free plan</strong>. Upgrade anytime to unlock more features!</p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">This email was sent by <strong>SprintBase</strong></p>
              <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} SprintBase. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send company welcome email:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Company welcome email sent | ID:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Company welcome email error:', error.message);
    return { success: false, error: error.message };
  }
}
