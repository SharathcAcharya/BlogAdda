import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import AnalyticsAPI from '../services/analyticsAPI';
import { 
  ChartBarIcon, 
  SparklesIcon,
  UsersIcon,
  PencilIcon,
  RocketLaunchIcon,
  FireIcon,
  BookOpenIcon,
  ArrowRightIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
  CalendarIcon,
  BoltIcon,
  TrophyIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  CheckIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  CursorArrowRaysIcon,
  AcademicCapIcon,
  BeakerIcon,
  CommandLineIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  FaceSmileIcon,
  HandRaisedIcon,
  IdentificationIcon,
  LinkIcon,
  MapPinIcon,
  MegaphoneIcon,
  NewspaperIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  QueueListIcon,
  RssIcon,
  ShareIcon,
  SpeakerWaveIcon,
  TagIcon,
  VideoCameraIcon,
  WifiIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  SparklesIcon as SparklesSolid,
  FireIcon as FireSolid,
  StarIcon as StarSolid,
  HeartIcon as HeartSolid,
  BoltIcon as BoltSolid,
  PlayIcon as PlaySolid,
  CheckIcon as CheckSolid,
  BeakerIcon as BeakerSolid,
  CpuChipIcon as CpuChipSolid,
  HandRaisedIcon as HandRaisedSolid,
  MegaphoneIcon as MegaphoneSolid,
  NewspaperIcon as NewspaperSolid,
  PresentationChartBarIcon as PresentationChartBarSolid,
  VideoCameraIcon as VideoCameraSolid
} from '@heroicons/react/24/solid';
import BlogCard from '../components/blog/BlogCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { fetchBlogs, fetchTrendingBlogs } from '../store/slices/blogSlice';

const Home = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleBlogs, setVisibleBlogs] = useState(6);
  const [currentTab, setCurrentTab] = useState('latest');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const heroRef = useRef(null);
  const { 
    blogs, 
    trendingBlogs, 
    loading, 
    featuredBlog,
    hasMore 
  } = useSelector((state) => state.blogs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Mouse movement tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchBlogs({ page: 1, limit: 12 }));
    dispatch(fetchTrendingBlogs());
  }, [dispatch]);

  // Analytics tracking
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await AnalyticsAPI.trackPageView('home');
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, []);

  const filteredBlogs = blogs?.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Advanced stats with real-time counter animation
  const [stats, setStats] = useState([
    { number: 0, target: 2000000, label: 'Active Writers', icon: UsersIcon, suffix: '+' },
    { number: 0, target: 50000000, label: 'Stories Published', icon: BookOpenIcon, suffix: '+' },
    { number: 0, target: 100000000, label: 'Monthly Readers', icon: EyeIcon, suffix: '+' },
    { number: 0, target: 10000, label: 'Featured Authors', icon: StarIcon, suffix: '+' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          number: stat.number < stat.target ? 
            Math.min(stat.number + Math.ceil(stat.target / 100), stat.target) : 
            stat.target
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (loading && (!blogs || blogs.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-purple-500/30 rounded-full animate-spin">
              <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesSolid className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-white text-2xl mt-8 font-bold">Loading Amazing Stories...</h2>
          <p className="text-purple-300 mt-2">Preparing the best content for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Ultra Modern Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Interactive Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          {/* Animated Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-blue-600/20 to-cyan-500/30 animate-gradient-xy"></div>
          
          {/* Interactive Mouse-Following Orb */}
          <div 
            className="absolute w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl transition-all duration-700 ease-out opacity-60"
            style={{
              left: `${mousePosition.x}%`,
              top: `${mousePosition.y}%`,
              transform: `translate(-50%, -50%) scale(${isHovered ? 1.3 : 1})`,
              opacity: isHovered ? 0.8 : 0.4
            }}
          ></div>
          
          {/* Floating Orbs with Enhanced Glow */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-full blur-2xl animate-float-slow glow-purple"></div>
          <div className="absolute top-60 right-20 w-60 h-60 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-float-slow animation-delay-1000 glow-blue"></div>
          <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-float-slow animation-delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-50 h-50 bg-gradient-to-r from-pink-500/25 to-red-500/25 rounded-full blur-2xl animate-float-slow animation-delay-3000 glow-pink"></div>
          
          {/* Dynamic Particle System */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Enhanced Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Modern Navigation with Glassmorphism */}
        <nav className="relative z-50 flex justify-between items-center px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl glow-purple">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-white text-2xl font-bold">BlogAdda</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium hover:scale-105 transform duration-200">Features</a>
            <a href="#trending" className="text-gray-300 hover:text-white transition-colors font-medium hover:scale-105 transform duration-200">Trending</a>
            <a href="#community" className="text-gray-300 hover:text-white transition-colors font-medium hover:scale-105 transform duration-200">Community</a>
            <Link to="/login" className="glass text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 font-medium transform hover:scale-105">
              Sign In
            </Link>
          </div>
        </nav>

        {/* Enhanced Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center space-x-2 glass rounded-full px-8 py-4 border border-purple-500/30 animate-fade-in-up hover:scale-105 transform transition-all duration-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <SparklesSolid className="h-5 w-5 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">✨ Next Generation Blogging Platform</span>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ml-2">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            </div>
            
            {/* Enhanced Main Title with Better Typography */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-tight animate-fade-in-up animation-delay-200">
              <span className="block text-white mb-4 hover:scale-105 transform transition-all duration-500">Create.</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x mb-4 hover:scale-105 transform transition-all duration-500">
                Share.
              </span>
              <span className="block text-white hover:scale-105 transform transition-all duration-500">Inspire.</span>
            </h1>
            
            {/* Enhanced Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Join millions of creators on the world's most advanced blogging platform. 
              <br className="hidden md:block" />
              <span className="text-purple-300 font-semibold">Write with AI</span>, 
              <span className="text-blue-300 font-semibold"> engage with your audience</span>, and 
              <span className="text-pink-300 font-semibold"> grow your influence</span>.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12 animate-fade-in-up animation-delay-600">
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/write" className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl flex items-center space-x-3 btn-modern">
                      <PencilIcon className="h-6 w-6" />
                      <span>Start Writing</span>
                      <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link to="/dashboard" className="group">
                    <button className="glass border-2 border-white/20 text-white hover:bg-white/20 font-bold px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                      <UserGroupIcon className="h-6 w-6" />
                      <span>Dashboard</span>
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register" className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl flex items-center space-x-3 text-lg btn-modern">
                      <RocketLaunchIcon className="h-6 w-6" />
                      <span>Start Writing Free</span>
                      <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link to="/login" className="group">
                    <button className="glass border-2 border-white/20 text-white hover:bg-white/20 font-bold px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 text-lg">
                      <span>Sign In</span>
                      <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Enhanced Stats with Real-time Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fade-in-up animation-delay-800">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-3xl border border-purple-500/30 mb-6 group-hover:scale-110 transition-all duration-300 glow-purple">
                    <stat.icon className="h-10 w-10 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2 font-mono tracking-tight">
                    {stat.number.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-gray-400 text-sm font-medium uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* New: Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-4 mt-16 animate-fade-in-up animation-delay-1000">
              {[
                { icon: BoltSolid, text: 'AI-Powered Writing', color: 'from-yellow-400 to-orange-500' },
                { icon: ChartBarIcon, text: 'Advanced Analytics', color: 'from-green-400 to-blue-500' },
                { icon: HandRaisedSolid, text: 'Community Support', color: 'from-blue-400 to-purple-500' },
                { icon: NewspaperSolid, text: 'Professional Templates', color: 'from-purple-400 to-pink-500' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 glass rounded-full px-6 py-3 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 transform">
                  <div className={`w-8 h-8 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center`}>
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
            <span className="text-xs text-white/60 font-medium">Scroll</span>
          </div>
        </div>
      </section>

      {/* Enhanced Modern Features Section */}
      <section id="features" className="relative py-32 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-500/10 to-pink-500/10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 glass rounded-full px-8 py-4 border border-blue-500/30 mb-8 hover:scale-105 transform transition-all duration-300">
              <SparklesSolid className="h-6 w-6 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Platform Features</span>
              <BeakerSolid className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create Amazing Content
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Professional tools, AI assistance, and a thriving community to help you succeed in the digital world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BoltSolid,
                title: 'AI-Powered Writing',
                description: 'Get intelligent suggestions, grammar corrections, and content optimization with our advanced AI writing assistant.',
                color: 'from-yellow-400 to-orange-500',
                bgColor: 'from-yellow-500/10 to-orange-500/10',
                features: ['Smart Grammar Check', 'Content Optimization', 'SEO Suggestions']
              },
              {
                icon: PresentationChartBarSolid,
                title: 'Advanced Analytics',
                description: 'Track your performance with detailed insights, audience analytics, and growth metrics in real-time.',
                color: 'from-green-400 to-emerald-500',
                bgColor: 'from-green-500/10 to-emerald-500/10',
                features: ['Real-time Metrics', 'Audience Insights', 'Growth Tracking']
              },
              {
                icon: UserGroupIcon,
                title: 'Community Engagement',
                description: 'Connect with readers, build your network, and participate in meaningful discussions.',
                color: 'from-blue-400 to-cyan-500',
                bgColor: 'from-blue-500/10 to-cyan-500/10',
                features: ['Interactive Comments', 'Social Sharing', 'Network Building']
              },
              {
                icon: ShieldCheckIcon,
                title: 'Premium Security',
                description: 'Your content is protected with enterprise-grade security and privacy controls.',
                color: 'from-purple-400 to-pink-500',
                bgColor: 'from-purple-500/10 to-pink-500/10',
                features: ['End-to-End Encryption', 'Privacy Controls', 'Backup & Recovery']
              },
              {
                icon: GlobeAltIcon,
                title: 'Global Reach',
                description: 'Reach audiences worldwide with built-in SEO optimization and social media integration.',
                color: 'from-indigo-400 to-purple-500',
                bgColor: 'from-indigo-500/10 to-purple-500/10',
                features: ['SEO Optimization', 'Social Integration', 'Multi-language Support']
              },
              {
                icon: CursorArrowRaysIcon,
                title: 'Interactive Experience',
                description: 'Engage readers with interactive elements, polls, multimedia content, and immersive storytelling.',
                color: 'from-pink-400 to-red-500',
                bgColor: 'from-pink-500/10 to-red-500/10',
                features: ['Interactive Elements', 'Multimedia Support', 'Polls & Surveys']
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`glass rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover-lift`}>
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6">{feature.description}</p>
                  
                  {/* Feature List */}
                  <div className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-2">
                        <CheckSolid className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced CTA for Features */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-4 glass rounded-full px-8 py-4 border border-purple-500/30 hover:scale-105 transform transition-all duration-300">
              <span className="text-white font-medium">Ready to explore all features?</span>
              <Link to="/register" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transform transition-all duration-300 flex items-center space-x-2">
                <span>Get Started</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Trending Section */}
      <section id="trending" className="relative py-32 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-red-500/5 to-pink-500/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-red-500/10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 glass rounded-full px-8 py-4 border border-red-500/30 mb-8 hover:scale-105 transform transition-all duration-300">
              <FireSolid className="h-6 w-6 text-red-400 animate-pulse" />
              <span className="text-sm font-semibold text-red-300 uppercase tracking-wide">Hot Right Now</span>
              <ChartBarIcon className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Trending 
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x"> Stories</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover the most popular and engaging content from our creative community.
            </p>
          </div>
          
          {trendingBlogs && trendingBlogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trendingBlogs.slice(0, 6).map((blog, index) => (
                  <div key={blog._id} className="group relative">
                    <div className="glass rounded-3xl p-6 border border-white/10 hover:border-red-500/30 transition-all duration-500 transform hover:scale-105 hover-lift">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-r from-yellow-600 to-yellow-800' :
                            'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}>
                            #{index + 1}
                          </div>
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Trending
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FireSolid className="h-5 w-5 text-red-400 animate-pulse" />
                          <span className="text-red-400 font-bold text-sm">+{Math.floor(Math.random() * 50 + 10)}%</span>
                        </div>
                      </div>
                      <div className="blog-card">
                        <BlogCard blog={blog} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* View All Trending Button */}
              <div className="text-center mt-16">
                <Link to="/trending" className="group relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <button className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-10 py-5 rounded-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 btn-modern">
                    <ChartBarIcon className="h-6 w-6" />
                    <span>View All Trending</span>
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 glass rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30">
                <FireSolid className="h-16 w-16 text-red-400 animate-pulse" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">No Trending Stories Yet</h3>
              <p className="text-gray-400 mb-8 text-lg">Be the first to create content that sets the trend!</p>
              {isAuthenticated && (
                <Link to="/write" className="group relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <button className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-10 py-5 rounded-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 btn-modern">
                    <PencilIcon className="h-6 w-6" />
                    <span>Write Your Story</span>
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Latest Stories Section */}
      <section className="relative py-32 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500/10 to-purple-500/10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 glass rounded-full px-8 py-4 border border-purple-500/30 mb-8 hover:scale-105 transform transition-all duration-300">
              <NewspaperSolid className="h-6 w-6 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300 uppercase tracking-wide">Latest Content</span>
              <BookOpenIcon className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Fresh 
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x"> Stories</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover the newest content from our creative community of writers and storytellers.
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto mb-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 z-10" />
                  <input
                    type="text"
                    placeholder="Search stories, authors, topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 py-6 input-modern rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {(!filteredBlogs || filteredBlogs.length === 0) ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 glass rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/30">
                <BookOpenIcon className="h-16 w-16 text-purple-400" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">
                {searchTerm ? 'No Stories Found' : 'No Stories Yet'}
              </h3>
              <p className="text-gray-400 mb-8 text-lg">
                {searchTerm 
                  ? `No stories match "${searchTerm}". Try different keywords or explore trending content.`
                  : 'Be the first to share your amazing story with the world!'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated && !searchTerm && (
                  <Link to="/write" className="group relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button className="relative bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-10 py-5 rounded-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 btn-modern">
                      <PencilIcon className="h-6 w-6" />
                      <span>Write Your First Story</span>
                      <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                )}
                {searchTerm && (
                  <Link to="/trending" className="group">
                    <button className="glass border-2 border-purple-500/30 text-white hover:bg-purple-500/20 font-bold px-10 py-5 rounded-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                      <ChartBarIcon className="h-6 w-6" />
                      <span>Explore Trending</span>
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs?.slice(0, visibleBlogs).map((blog, index) => (
                  <div key={blog._id} className="group relative">
                    <div className="glass rounded-3xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-500 transform hover:scale-105 hover-lift">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <NewspaperSolid className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-purple-300 text-sm font-medium">Latest</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-green-400 text-xs">•</span>
                          <span className="text-gray-400 text-xs">New</span>
                        </div>
                      </div>
                      <div className="blog-card">
                        <BlogCard blog={blog} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {visibleBlogs < filteredBlogs?.length && (
                <div className="text-center mt-16">
                  <button
                    onClick={() => setVisibleBlogs(prev => prev + 6)}
                    className="group relative inline-block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-10 py-5 rounded-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 btn-modern">
                      <span>Load More Stories</span>
                      <div className="w-6 h-6 border-2 border-white/30 rounded-full flex items-center justify-center">
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      {!isAuthenticated && (
        <section className="relative py-32 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-pink-500/10 to-purple-500/10 blur-3xl"></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-float-slow animation-delay-1000"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-32 h-32 glass rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/30 glow-purple">
              <RocketLaunchIcon className="h-16 w-16 text-purple-400" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
              Ready to Start Your
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                Writing Journey?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of writers who are already building their audience and growing their influence with our advanced platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link to="/register" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                <button className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl text-xl flex items-center space-x-3 btn-modern">
                  <RocketLaunchIcon className="h-6 w-6" />
                  <span>Start Writing Today</span>
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/trending" className="group">
                <button className="glass border-2 border-white/20 text-white hover:bg-white/20 font-bold px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 text-xl flex items-center space-x-3">
                  <FireIcon className="h-6 w-6" />
                  <span>Explore Stories</span>
                </button>
              </Link>
            </div>

            {/* Additional Features Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { icon: BoltSolid, title: '100% Free', description: 'Start writing without any cost' },
                { icon: ShieldCheckIcon, title: 'Secure & Private', description: 'Your content is protected' },
                { icon: UserGroupIcon, title: 'Growing Community', description: 'Connect with like-minded writers' }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <feature.icon className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-purple-500/25 transform hover:scale-110 transition-all duration-300 z-50 group glass border border-white/20"
      >
        <ArrowUpIcon className="h-6 w-6 group-hover:-translate-y-1 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default Home;
