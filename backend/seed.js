const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Blog = require('./models/Blog');
const Comment = require('./models/Comment');
const Notification = require('./models/Notification');

const sampleData = {
  users: [
    {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      bio: 'A passionate writer and tech enthusiast. Love exploring new technologies and sharing knowledge.',
      role: 'user',
      isVerified: true
    },
    {
      name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      password: 'password123',
      bio: 'Travel blogger and photographer. Capturing life one moment at a time.',
      role: 'user',
      isVerified: true
    },
    {
      name: 'Admin User',
      username: 'admin',
      email: 'admin@blogadda.com',
      password: 'Admin@123456',
      bio: 'Platform administrator',
      role: 'admin',
      isVerified: true
    },
    {
      name: 'Alex Johnson',
      username: 'alexjohnson',
      email: 'alex@example.com',
      password: 'password123',
      bio: 'Food enthusiast and chef. Sharing delicious recipes and cooking tips.',
      role: 'user',
      isVerified: true
    },
    {
      name: 'Sarah Wilson',
      username: 'sarahwilson',
      email: 'sarah@example.com',
      password: 'password123',
      bio: 'Health and fitness coach. Helping people live healthier lives.',
      role: 'user',
      isVerified: true
    }
  ],
  
  blogs: [
    {
      title: 'Getting Started with React 18: New Features and Improvements',
      content: `
        <h2>Introduction to React 18</h2>
        <p>React 18 brings exciting new features that make building user interfaces even more powerful and efficient. In this comprehensive guide, we'll explore the major improvements and how to implement them in your projects.</p>
        
        <h3>Concurrent Features</h3>
        <p>One of the biggest additions is the concurrent features that allow React to prepare multiple versions of the UI at the same time. This enables better user experiences with features like:</p>
        <ul>
          <li>Automatic batching for better performance</li>
          <li>Suspense for data fetching</li>
          <li>Concurrent rendering</li>
        </ul>
        
        <h3>New Hooks</h3>
        <p>React 18 introduces several new hooks that give developers more control:</p>
        <ul>
          <li><code>useId</code> - for generating unique IDs</li>
          <li><code>useTransition</code> - for marking updates as transitions</li>
          <li><code>useDeferredValue</code> - for deferring non-urgent updates</li>
        </ul>
        
        <h3>Getting Started</h3>
        <p>To upgrade to React 18, simply update your dependencies and switch to the new <code>createRoot</code> API:</p>
        <pre><code>
// Old way
ReactDOM.render(&lt;App /&gt;, document.getElementById('root'));

// New way
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(&lt;App /&gt;);
        </code></pre>
        
        <p>React 18 is a significant step forward in making React applications more performant and user-friendly. Start experimenting with these features today!</p>
      `,
      category: 'technology',
      tags: ['react', 'javascript', 'frontend', 'web-development'],
      status: 'published'
    },
    {
      title: 'The Ultimate Guide to Sustainable Travel in 2025',
      content: `
        <h2>Sustainable Travel: A Responsibility and Adventure</h2>
        <p>As we become more conscious of our environmental impact, sustainable travel has evolved from a niche interest to a mainstream movement. Here's how you can explore the world while protecting it for future generations.</p>
        
        <h3>Choose Eco-Friendly Transportation</h3>
        <p>Transportation is often the largest contributor to a trip's carbon footprint. Consider these alternatives:</p>
        <ul>
          <li>Train travel for medium distances</li>
          <li>Electric or hybrid rental cars</li>
          <li>Direct flights when flying is necessary</li>
          <li>Carbon offset programs for unavoidable emissions</li>
        </ul>
        
        <h3>Support Local Communities</h3>
        <p>Sustainable travel isn't just about the environment—it's about supporting local economies and cultures:</p>
        <ul>
          <li>Stay in locally-owned accommodations</li>
          <li>Eat at family-run restaurants</li>
          <li>Buy from local artisans and markets</li>
          <li>Hire local guides and tour operators</li>
        </ul>
        
        <h3>Pack Light and Smart</h3>
        <p>Every kilogram counts when it comes to fuel consumption. Pack versatile clothes, reusable items, and only what you truly need.</p>
        
        <h3>Respect Natural Spaces</h3>
        <p>Leave no trace, stick to marked trails, and follow local guidelines for wildlife viewing and interaction.</p>
        
        <p>Sustainable travel allows us to experience the world's beauty while ensuring it remains beautiful for generations to come. Every small choice makes a difference!</p>
      `,
      category: 'travel',
      tags: ['sustainable-travel', 'eco-friendly', 'environment', 'responsible-tourism'],
      status: 'published'
    },
    {
      title: '10 Healthy Recipes That Take Less Than 30 Minutes',
      content: `
        <h2>Quick and Healthy Cooking Made Easy</h2>
        <p>Eating healthy doesn't have to be time-consuming. These delicious recipes prove that nutritious meals can be prepared quickly without sacrificing flavor.</p>
        
        <h3>1. Mediterranean Quinoa Bowl</h3>
        <p><strong>Time: 20 minutes</strong></p>
        <p>Combine cooked quinoa with cherry tomatoes, cucumber, olives, feta cheese, and a lemon-herb dressing. High in protein and packed with fresh flavors.</p>
        
        <h3>2. One-Pan Salmon and Vegetables</h3>
        <p><strong>Time: 25 minutes</strong></p>
        <p>Season salmon fillets and roast with asparagus, bell peppers, and sweet potatoes. A complete meal with omega-3s and vitamins.</p>
        
        <h3>3. Black Bean and Avocado Tacos</h3>
        <p><strong>Time: 15 minutes</strong></p>
        <p>Warm corn tortillas filled with seasoned black beans, avocado, salsa, and cilantro. Vegetarian and incredibly satisfying.</p>
        
        <h3>4. Thai-Inspired Chicken Lettuce Wraps</h3>
        <p><strong>Time: 20 minutes</strong></p>
        <p>Sauté ground chicken with ginger, garlic, and soy sauce. Serve in butter lettuce cups with fresh herbs and peanut sauce.</p>
        
        <h3>5. Caprese Stuffed Portobello Mushrooms</h3>
        <p><strong>Time: 25 minutes</strong></p>
        <p>Large portobello caps filled with mozzarella, tomatoes, and basil. Bake until cheese melts for a low-carb Italian treat.</p>
        
        <p>Remember, healthy eating is about consistency, not perfection. These recipes make it easier to maintain nutritious habits even on busy days!</p>
      `,
      category: 'food',
      tags: ['healthy-recipes', 'quick-meals', 'nutrition', 'cooking-tips'],
      status: 'published'
    },
    {
      title: 'The Future of Artificial Intelligence: Trends to Watch in 2025',
      content: `
        <h2>AI Evolution: What's Coming Next</h2>
        <p>Artificial Intelligence continues to reshape industries and daily life. As we progress through 2025, several key trends are emerging that will define the AI landscape.</p>
        
        <h3>Multimodal AI Systems</h3>
        <p>The future belongs to AI that can seamlessly process and understand multiple types of data—text, images, audio, and video—simultaneously. This enables more natural human-computer interactions.</p>
        
        <h3>AI in Healthcare Revolution</h3>
        <p>From diagnostic imaging to drug discovery, AI is accelerating medical breakthroughs:</p>
        <ul>
          <li>Personalized treatment plans</li>
          <li>Early disease detection</li>
          <li>Robotic surgery assistance</li>
          <li>Mental health support applications</li>
        </ul>
        
        <h3>Sustainable AI Development</h3>
        <p>As AI models grow larger, energy efficiency becomes crucial. Green AI initiatives focus on:</p>
        <ul>
          <li>More efficient algorithms</li>
          <li>Specialized hardware for AI workloads</li>
          <li>Sustainable data center practices</li>
        </ul>
        
        <h3>Democratization of AI Tools</h3>
        <p>No-code and low-code AI platforms are making artificial intelligence accessible to non-technical users, enabling small businesses and individuals to leverage AI capabilities.</p>
        
        <h3>Ethical AI and Regulation</h3>
        <p>With great power comes great responsibility. The industry is focusing on:</p>
        <ul>
          <li>Bias reduction in AI systems</li>
          <li>Transparent AI decision-making</li>
          <li>Privacy-preserving AI techniques</li>
          <li>Global AI governance frameworks</li>
        </ul>
        
        <p>The AI revolution is just beginning. By staying informed about these trends, we can better prepare for a future where AI enhances human capabilities while respecting our values.</p>
      `,
      category: 'technology',
      tags: ['artificial-intelligence', 'machine-learning', 'future-tech', 'innovation'],
      status: 'published'
    },
    {
      title: 'Building Better Mental Health Habits: A Practical Guide',
      content: `
        <h2>Prioritizing Mental Wellness in Daily Life</h2>
        <p>Mental health is just as important as physical health, yet it's often overlooked in our busy lives. Here's a practical guide to building sustainable mental health habits.</p>
        
        <h3>Start Your Day Mindfully</h3>
        <p>How you begin your morning sets the tone for the entire day:</p>
        <ul>
          <li>Practice 5 minutes of meditation or deep breathing</li>
          <li>Write three things you're grateful for</li>
          <li>Avoid checking your phone for the first hour</li>
          <li>Eat a nutritious breakfast mindfully</li>
        </ul>
        
        <h3>Create Boundaries</h3>
        <p>Healthy boundaries are essential for mental well-being:</p>
        <ul>
          <li>Learn to say "no" to commitments that drain you</li>
          <li>Set specific work hours and stick to them</li>
          <li>Limit social media consumption</li>
          <li>Communicate your needs clearly to others</li>
        </ul>
        
        <h3>Move Your Body Regularly</h3>
        <p>Physical activity is a powerful mood booster. Find activities you enjoy:</p>
        <ul>
          <li>Take a 20-minute walk in nature</li>
          <li>Try yoga or stretching</li>
          <li>Dance to your favorite music</li>
          <li>Play a sport with friends</li>
        </ul>
        
        <h3>Connect with Others</h3>
        <p>Human connection is vital for mental health. Make time for:</p>
        <ul>
          <li>Regular check-ins with friends and family</li>
          <li>Joining community groups or clubs</li>
          <li>Volunteering for causes you care about</li>
          <li>Seeking professional help when needed</li>
        </ul>
        
        <h3>Practice Self-Compassion</h3>
        <p>Be kind to yourself, especially during difficult times. Remember that it's okay to have bad days, and seeking help is a sign of strength, not weakness.</p>
        
        <p>Building better mental health habits takes time and consistency. Start small, be patient with yourself, and celebrate every step forward.</p>
      `,
      category: 'health',
      tags: ['mental-health', 'wellness', 'self-care', 'mindfulness'],
      status: 'published'
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Blog.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');
    
    // Create users
    const users = [];
    for (const userData of sampleData.users) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      users.push(user);
      console.log(`👤 Created user: ${user.name}`);
    }
    
    // Create blogs
    const blogs = [];
    for (let i = 0; i < sampleData.blogs.length; i++) {
      const blogData = sampleData.blogs[i];
      const randomAuthor = users[i % users.length]; // Assign blogs to different authors
      
      const blog = await Blog.create({
        ...blogData,
        author: randomAuthor._id,
        publishedAt: new Date()
      });
      blogs.push(blog);
      console.log(`📝 Created blog: ${blog.title}`);
    }
    
    // Create some sample comments
    const comments = [];
    for (let i = 0; i < 3; i++) {
      const blog = blogs[i % blogs.length];
      const commenter = users[(i + 1) % users.length];
      
      const comment = await Comment.create({
        content: `Great article! This really helped me understand the topic better. Thanks for sharing your insights.`,
        author: commenter._id,
        blog: blog._id
      });
      comments.push(comment);
      console.log(`💬 Created comment on: ${blog.title}`);
    }
    
    // Add some likes and bookmarks
    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      const likers = users.slice(0, Math.floor(Math.random() * 3) + 1);
      const bookmarkers = users.slice(0, Math.floor(Math.random() * 2) + 1);
      
      blog.likes = likers.map(user => ({ user: user._id }));
      blog.bookmarks = bookmarkers.map(user => ({ user: user._id }));
      blog.views = Math.floor(Math.random() * 100) + 10;
      
      await blog.save();
      console.log(`❤️ Added ${blog.likes.length} likes and ${blog.bookmarks.length} bookmarks to: ${blog.title}`);
    }
    
    // Create some followers relationships
    users[0].followers.push(users[1]._id, users[2]._id);
    users[0].following.push(users[3]._id);
    users[1].followers.push(users[0]._id, users[3]._id);
    users[1].following.push(users[0]._id, users[4]._id);
    
    await Promise.all(users.map(user => user.save()));
    console.log('👥 Created follower relationships');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:
    - ${users.length} users created
    - ${blogs.length} blogs created  
    - ${comments.length} comments created
    - Likes, bookmarks, and follows added`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
