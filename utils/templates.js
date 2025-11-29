/**
 * Email template generator for Smart Shetakari
 * Creates beautiful, responsive HTML email templates
 */

const getContactEmailTemplate = (senderEmail, subject, message) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message from Smart Shetakari</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                🌾 Smart Shetakari
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px; font-weight: 400;">
                                New Contact Message Received
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content Section -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 25px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Hello! 👋
                            </p>
                            <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                You have received a new message through the Smart Shetakari contact form.
                            </p>
                            
                            <!-- Sender Info Card -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; margin-bottom: 25px; border: 1px solid #bae6fd;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #0369a1; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">From</span>
                                                    <p style="margin: 5px 0 0 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">
                                                        ${senderEmail}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; border-top: 1px solid #bae6fd;">
                                                    <span style="color: #0369a1; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span>
                                                    <p style="margin: 5px 0 0 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">
                                                        ${subject}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Message Content -->
                            <div style="background-color: #f9fafb; border-left: 4px solid #667eea; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                                <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                    📧 Message
                                </h3>
                                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word;">
${message}
                                </p>
                            </div>
                            
                            <!-- Action Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <tr>
                                    <td align="center">
                                        <a href="mailto:${senderEmail}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
                                            Reply to ${senderEmail.split('@')[0]}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                                            This email was sent from the <strong>Smart Shetakari</strong> contact form
                                        </p>
                                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                            © ${new Date().getFullYear()} Smart Shetakari. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
                
                <!-- Bottom Spacing -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td align="center">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                                If you have any questions, please contact our support team.
                            </p>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};

/**
 * Plain text version of the contact email
 */
const getContactEmailPlainText = (senderEmail, subject, message) => {
    return `
Smart Shetakari - New Contact Message
====================================

From: ${senderEmail}
Subject: ${subject}

Message:
--------
${message}

====================================
Reply to: ${senderEmail}

This email was sent from the Smart Shetakari contact form.
© ${new Date().getFullYear()} Smart Shetakari. All rights reserved.
    `.trim();
};

module.exports = {
    getContactEmailTemplate,
    getContactEmailPlainText,
};
