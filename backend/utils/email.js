const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email configuration not found - email features will be disabled');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (email not configured), skip sending
    if (!transporter) {
      console.log('ℹ️  Email not configured - skipping email send');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@blogadda.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email: ', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to BlogAdda!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to BlogAdda, ${user.name}!</h1>
        <p>We're excited to have you join our community of writers and readers.</p>
        <p>Here's what you can do on BlogAdda:</p>
        <ul>
          <li>✍️ Write and publish your own blog posts</li>
          <li>📖 Read amazing content from other writers</li>
          <li>💬 Engage with the community through comments</li>
          <li>👥 Follow your favorite authors</li>
          <li>🔖 Bookmark posts to read later</li>
        </ul>
        <p>Ready to get started?</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          If you have any questions, feel free to reach out to us at support@blogadda.com
        </p>
      </div>
    `
  });
};

// Send blog published notification
const sendBlogPublishedEmail = async (author, blog) => {
  await sendEmail({
    to: author.email,
    subject: 'Your blog post has been published!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">🎉 Your blog is now live!</h1>
        <p>Hi ${author.name},</p>
        <p>Great news! Your blog post "<strong>${blog.title}</strong>" has been published and is now live on BlogAdda.</p>
        <a href="${process.env.CLIENT_URL}/blog/${blog.slug}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Post</a>
        <p style="margin-top: 20px;">Share it with your friends and followers to get more readers!</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0;">${blog.title}</h3>
          <p style="margin: 0; color: #666;">${blog.excerpt}</p>
        </div>
      </div>
    `
  });
};

// Send newsletter
const sendNewsletter = async (subscribers, featuredBlogs) => {
  const emailPromises = subscribers.map(subscriber => {
    return sendEmail({
      to: subscriber.email,
      subject: 'BlogAdda Weekly Newsletter - Featured Posts',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">📰 This Week on BlogAdda</h1>
          <p>Hi ${subscriber.name},</p>
          <p>Here are the most popular blog posts from this week:</p>
          
          ${featuredBlogs.map(blog => `
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
              <h3 style="margin: 0 0 10px 0;">
                <a href="${process.env.CLIENT_URL}/blog/${blog.slug}" style="color: #1f2937; text-decoration: none;">${blog.title}</a>
              </h3>
              <p style="margin: 0 0 10px 0; color: #666;">${blog.excerpt}</p>
              <p style="margin: 0; font-size: 14px; color: #888;">
                By ${blog.author.name} • ${blog.readingTime} min read • ${blog.likeCount} likes
              </p>
            </div>
          `).join('')}
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.CLIENT_URL}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Read More on BlogAdda</a>
          </div>
          
          <p style="font-size: 12px; color: #888; margin-top: 30px;">
            You're receiving this because you subscribed to BlogAdda newsletter. 
            <a href="${process.env.CLIENT_URL}/unsubscribe?token=${subscriber.unsubscribeToken}">Unsubscribe</a>
          </p>
        </div>
      `
    });
  });

  await Promise.all(emailPromises);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBlogPublishedEmail,
  sendNewsletter
};
