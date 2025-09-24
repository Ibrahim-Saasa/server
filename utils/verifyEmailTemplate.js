const verificationEmail = (username, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f6f9fc;
                padding: 20px;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 40px 20px;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            
            .welcome {
                font-size: 24px;
                color: #2c3e50;
                margin-bottom: 20px;
                font-weight: 600;
            }
            
            .message {
                font-size: 16px;
                color: #555;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            
            .otp-container {
                background: #f8f9fa;
                border: 2px dashed #667eea;
                border-radius: 10px;
                padding: 30px;
                margin: 30px 0;
            }
            
            .otp-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 1px;
            }
            
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                margin: 10px 0;
            }
            
            .otp-note {
                font-size: 12px;
                color: #888;
                margin-top: 15px;
            }
            
            .instructions {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            
            .instructions h3 {
                color: #856404;
                margin-bottom: 10px;
                font-size: 16px;
            }
            
            .instructions ol {
                color: #856404;
                padding-left: 20px;
            }
            
            .instructions li {
                margin-bottom: 5px;
            }
            
            .warning {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
            }
            
            .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #eee;
            }
            
            .footer p {
                color: #666;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .company-name {
                color: #667eea;
                font-weight: 600;
            }
            
            .help-text {
                font-size: 12px;
                color: #999;
                margin-top: 20px;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 8px;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .otp-code {
                    font-size: 28px;
                    letter-spacing: 4px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Email Verification</h1>
                <p>Secure your account with email verification</p>
            </div>
            
            <div class="content">
                <div class="welcome">
                    Hello, ${username}! 👋
                </div>
                
                <div class="message">
                    Thank you for registering with <span class="company-name">Ecommerce App</span>! 
                    To complete your registration and secure your account, please verify your email address.
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <div class="otp-note">This code expires in 10 minutes</div>
                </div>
                
                <div class="instructions">
                    <h3>📋 How to verify:</h3>
                    <ol>
                        <li>Return to the registration page</li>
                        <li>Enter the 6-digit code above</li>
                        <li>Click "Verify Email" to complete your registration</li>
                    </ol>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> If you didn't create an account, please ignore this email. 
                    Your email address may have been entered by mistake.
                </div>
            </div>
            
            <div class="footer">
                <p>This email was sent by <span class="company-name">Ecommerce App</span></p>
                <p>If you're having trouble with verification, please contact our support team.</p>
                
                <div class="help-text">
                    Need help? Contact us at support@ecommerceapp.com<br>
                    This is an automated email, please do not reply directly to this message.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

export default verificationEmail;
