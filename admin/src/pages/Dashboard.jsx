import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAdminStats } from '../services/adminAPI';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  FlagIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  SparklesIcon,
  CogIcon,
  BellIcon,
  FireIcon,
  GlobeAltIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAdminStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium text-lg">Loading your dashboard...</p>
          <p className="mt-2 text-slate-500 text-sm">Please wait while we gather your data</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-50 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${color} shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              <ArrowTrendingUpIcon className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span className="text-sm font-semibold">{change}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">vs last month</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-20"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-lg text-slate-600 mt-2">
                    {format(new Date(), 'EEEE, MMMM dd, yyyy')} • Here's your platform overview
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Last login</p>
                  <p className="text-lg font-semibold text-slate-700">{format(new Date(), 'MMM dd, HH:mm')}</p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BellIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats?.overview?.totalUsers || 0}
            change={`+${stats?.growth?.thisMonthUsers || 0}`}
            icon={UsersIcon}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="up"
          />
          <StatCard 
            title="Total Blogs" 
            value={stats?.overview?.totalBlogs || 0}
            change={`+${stats?.growth?.thisMonthBlogs || 0}`}
            icon={DocumentTextIcon}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            trend="up"
          />
          <StatCard 
            title="Comments" 
            value={stats?.overview?.totalComments || 0}
            change={`+${stats?.growth?.thisMonthComments || 0}`}
            icon={ChatBubbleLeftRightIcon}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend="up"
          />
          <StatCard 
            title="Published" 
            value={stats?.overview?.publishedBlogs || 0}
            change={`+${stats?.growth?.thisMonthPublished || 0}`}
            icon={GlobeAltIcon}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            trend="up"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FireIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
                      <p className="text-sm text-slate-500">Latest blog posts and updates</p>
                    </div>
                  </div>
                  <Link to="/blogs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats?.recent?.blogs?.slice(0, 5).map((blog, index) => (
                    <div key={blog._id} className="group flex items-center space-x-4 p-4 hover:bg-blue-50/50 rounded-xl transition-all duration-200">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={blog.author.profilePic || '/default-avatar.png'} 
                          alt={blog.author.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center space-x-2">
                          <span>by <span className="font-medium text-slate-700">{blog.author.name}</span></span>
                          <span>•</span>
                          <span>{format(new Date(blog.publishedAt), 'MMM dd, yyyy')}</span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span className="font-medium">{blog.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Moderation Panel */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FlagIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Moderation</h3>
                    <p className="text-sm text-slate-500">Items needing attention</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FlagIcon className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-semibold text-slate-900">Reported Blogs</p>
                        <p className="text-sm text-slate-600">Need review</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-600">{stats?.overview?.reportedBlogs || 0}</span>
                      <Link to="/blogs?status=reported" className="block text-xs text-red-600 hover:text-red-700 font-medium mt-1">
                        Review →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <XCircleIcon className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-semibold text-slate-900">Reported Comments</p>
                        <p className="text-sm text-slate-600">Need attention</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-orange-600">{stats?.overview?.reportedComments || 0}</span>
                      <Link to="/comments" className="block text-xs text-orange-600 hover:text-orange-700 font-medium mt-1">
                        Review →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-slate-900">Banned Users</p>
                        <p className="text-sm text-slate-600">Currently banned</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">{stats?.overview?.bannedUsers || 0}</span>
                      <Link to="/users?status=banned" className="block text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                        Manage →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Authors */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl mb-8">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrophyIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Top Authors</h3>
                  <p className="text-sm text-slate-500">Most active content creators</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats?.trending?.authors?.map((author, index) => (
                <div key={author._id} className="group hover:scale-105 transition-all duration-300">
                  <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img 
                          src={author.profilePic || '/default-avatar.png'} 
                          alt={author.name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
                        />
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 
                          'bg-gradient-to-br from-orange-400 to-orange-500'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                          {author.name}
                        </p>
                        <div className="flex items-center space-x-3 text-sm text-slate-500 mt-2">
                          <span className="flex items-center space-x-1">
                            <HeartIcon className="w-4 h-4" />
                            <span>{author.followerCount}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DocumentTextIcon className="w-4 h-4" />
                            <span>{author.blogCount}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CogIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Quick Actions</h3>
                <p className="text-sm text-slate-500">Manage your platform efficiently</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/users" className="group">
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="absolute top-4 right-4 opacity-20">
                    <UsersIcon className="w-16 h-16" />
                  </div>
                  <div className="relative">
                    <UsersIcon className="w-10 h-10 mb-4" />
                    <h4 className="text-xl font-semibold mb-2">Manage Users</h4>
                    <p className="text-blue-100 text-sm">View and manage all platform users</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/blogs" className="group">
                <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="absolute top-4 right-4 opacity-20">
                    <DocumentTextIcon className="w-16 h-16" />
                  </div>
                  <div className="relative">
                    <DocumentTextIcon className="w-10 h-10 mb-4" />
                    <h4 className="text-xl font-semibold mb-2">Review Blogs</h4>
                    <p className="text-purple-100 text-sm">Moderate and manage blog content</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/comments" className="group">
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="absolute top-4 right-4 opacity-20">
                    <ChatBubbleLeftRightIcon className="w-16 h-16" />
                  </div>
                  <div className="relative">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 mb-4" />
                    <h4 className="text-xl font-semibold mb-2">Moderate Comments</h4>
                    <p className="text-emerald-100 text-sm">Review and moderate user comments</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
