const nodemailer = require('nodemailer');
const User = require('../models/User');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    // Fallback to console logging if no email config
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email service running in development mode (console logging)');
      this.transporter = null;
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter(emailConfig);
      console.log('📧 Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.transporter) {
        // Development mode - log to console
        console.log('\n📧 EMAIL (Development Mode):');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:', text || html);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return { success: true, messageId: 'dev-mode' };
      }

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'BlogAdda'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const subject = `Welcome to ${process.env.APP_NAME || 'BlogAdda'}! 🎉`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to BlogAdda</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .feature { margin: 20px 0; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to BlogAdda!</h1>
            <p>Start your blogging journey today</p>
          </div>
          <div class="content">
            <h2>Hi ${user.name}! 👋</h2>
            <p>Welcome to BlogAdda - the modern platform for sharing your thoughts, stories, and expertise with the world!</p>
            
            <div class="feature">
              <h3>✨ What you can do:</h3>
              <ul>
                <li>Write and publish beautiful blog posts</li>
                <li>Connect with fellow writers and readers</li>
                <li>Use AI-powered writing assistance</li>
                <li>Track your content performance</li>
                <li>Build your personal brand</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/write" class="button">
                Write Your First Story
              </a>
            </div>

            <p>Need help getting started? Check out our <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/help">Help Center</a> or reply to this email with any questions.</p>

            <p>Happy writing!</p>
            <p>The BlogAdda Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${user.email}</p>
            <p>© ${new Date().getFullYear()} BlogAdda. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to BlogAdda, ${user.name}!

      Thank you for joining our community of writers and readers. 

      What you can do on BlogAdda:
      • Write and publish beautiful blog posts
      • Connect with fellow writers and readers  
      • Use AI-powered writing assistance
      • Track your content performance
      • Build your personal brand

      Get started: ${process.env.CLIENT_URL || 'http://localhost:3000'}/write

      Need help? Visit our Help Center or reply to this email.

      Happy writing!
      The BlogAdda Team
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your BlogAdda Password';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3cd; border: 1px solid #fde047; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>Reset your BlogAdda password</p>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>We received a request to reset your password for your BlogAdda account.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-family: monospace; background: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>

            <p>If you have any concerns about your account security, please contact our support team.</p>

            <p>Best regards,<br>The BlogAdda Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${user.email}</p>
            <p>© ${new Date().getFullYear()} BlogAdda. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request

      Hi ${user.name},

      We received a request to reset your password for your BlogAdda account.

      Reset your password: ${resetUrl}

      Security Notice:
      - This link will expire in 1 hour
      - If you didn't request this reset, please ignore this email
      - Your password will remain unchanged until you create a new one

      If you have any concerns, please contact our support team.

      Best regards,
      The BlogAdda Team
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }

  // New blog notification for followers
  async sendNewBlogNotification(blog, follower) {
    const blogUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/blog/${blog.slug}`;
    const subject = `${blog.author.name} published a new story: ${blog.title}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Story Published</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .blog-preview { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .author { display: flex; align-items: center; margin-bottom: 15px; }
          .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 New Story Published!</h1>
            <p>From an author you follow</p>
          </div>
          <div class="content">
            <h2>Hi ${follower.name}!</h2>
            <p>${blog.author.name} just published a new story that you might enjoy:</p>
            
            <div class="blog-preview">
              <div class="author">
                <img src="${blog.author.profilePic || process.env.CLIENT_URL + '/default-avatar.png'}" alt="${blog.author.name}" class="avatar">
                <div>
                  <strong>${blog.author.name}</strong>
                  <div style="font-size: 14px; color: #666;">${new Date(blog.publishedAt).toLocaleDateString()}</div>
                </div>
              </div>
              
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">${blog.title}</h3>
              <p style="color: #6b7280; margin: 0;">${blog.excerpt || blog.content.substring(0, 200) + '...'}</p>
              
              ${blog.category ? `<div style="margin-top: 15px;"><span style="background: #dbeafe; color: #1d4ed8; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${blog.category}</span></div>` : ''}
            </div>

            <div style="text-align: center;">
              <a href="${blogUrl}" class="button">Read the Story</a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              You're receiving this because you follow ${blog.author.name}. 
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/notifications">Manage your notification preferences</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BlogAdda. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Story Published!

      Hi ${follower.name}!

      ${blog.author.name} just published a new story: "${blog.title}"

      ${blog.excerpt || blog.content.substring(0, 200) + '...'}

      Read the full story: ${blogUrl}

      You're receiving this because you follow ${blog.author.name}.
      Manage notifications: ${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/notifications

      © ${new Date().getFullYear()} BlogAdda. All rights reserved.
    `;

    return await this.sendEmail({
      to: follower.email,
      subject,
      html,
      text
    });
  }

  // Weekly digest email
  async sendWeeklyDigest(user, topBlogs, stats) {
    const subject = `Your Weekly BlogAdda Digest 📰`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Weekly Digest</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #8b5cf6; }
          .blog-item { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #8b5cf6; }
          .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📰 Your Weekly Digest</h1>
            <p>What happened this week on BlogAdda</p>
          </div>
          <div class="content">
            <h2>Hi ${user.name}! 👋</h2>
            <p>Here's what you missed this week on BlogAdda:</p>
            
            ${stats ? `
            <h3>📊 Your Stats This Week</h3>
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-number">${stats.views || 0}</div>
                <div>Views</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.likes || 0}</div>
                <div>Likes</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.comments || 0}</div>
                <div>Comments</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.followers || 0}</div>
                <div>New Followers</div>
              </div>
            </div>
            ` : ''}

            ${topBlogs && topBlogs.length > 0 ? `
            <h3>🔥 Trending This Week</h3>
            ${topBlogs.map(blog => `
              <div class="blog-item">
                <h4 style="margin: 0 0 8px 0;">${blog.title}</h4>
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">by ${blog.author.name}</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${blog.views} views • ${blog.likes} likes</p>
              </div>
            `).join('')}
            ` : ''}

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="button">
                Explore BlogAdda
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/notifications">Manage your email preferences</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BlogAdda. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Your Weekly BlogAdda Digest

      Hi ${user.name}!

      Here's what happened this week:

      ${stats ? `
      Your Stats:
      - ${stats.views || 0} views
      - ${stats.likes || 0} likes  
      - ${stats.comments || 0} comments
      - ${stats.followers || 0} new followers
      ` : ''}

      ${topBlogs && topBlogs.length > 0 ? `
      Trending This Week:
      ${topBlogs.map(blog => `- ${blog.title} by ${blog.author.name} (${blog.views} views)`).join('\n')}
      ` : ''}

      Explore more: ${process.env.CLIENT_URL || 'http://localhost:3000'}

      Manage preferences: ${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/notifications
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
      text
    });
  }

  // Comment notification
  async sendCommentNotification(comment, blogAuthor) {
    const blogUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/blog/${comment.blog.slug}#comment-${comment._id}`;
    const subject = `💬 New comment on "${comment.blog.title}"`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Comment</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .comment { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Comment</h1>
            <p>Someone commented on your story</p>
          </div>
          <div class="content">
            <h2>Hi ${blogAuthor.name}!</h2>
            <p>${comment.author.name} left a comment on your story "<strong>${comment.blog.title}</strong>":</p>
            
            <div class="comment">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <img src="${comment.author.profilePic || process.env.CLIENT_URL + '/default-avatar.png'}" alt="${comment.author.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;">
                <div>
                  <strong>${comment.author.name}</strong>
                  <div style="font-size: 14px; color: #666;">${new Date(comment.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <p style="margin: 0; color: #374151;">${comment.content}</p>
            </div>

            <div style="text-align: center;">
              <a href="${blogUrl}" class="button">View Comment</a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/notifications">Manage your notification preferences</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BlogAdda. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Comment

      Hi ${blogAuthor.name}!

      ${comment.author.name} commented on your story "${comment.blog.title}":

      "${comment.content}"

      View comment: ${blogUrl}

      Manage notifications: ${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/notifications
    `;

    return await this.sendEmail({
      to: blogAuthor.email,
      subject,
      html,
      text
    });
  }

  // Batch send emails (for newsletters, announcements)
  async sendBatchEmails(emails, subject, html, text) {
    const results = [];
    
    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 10;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map(email => 
        this.sendEmail({ to: email, subject, html, text })
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

module.exports = new EmailService();
