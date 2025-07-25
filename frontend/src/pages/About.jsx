import React from 'react';
import { 
  SparklesIcon,
  UsersIcon,
  GlobeAltIcon,
  PencilIcon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const features = [
    {
      icon: PencilIcon,
      title: 'Create & Share',
      description: 'Write and publish your stories with our intuitive editor. Share your thoughts with a community of readers.'
    },
    {
      icon: UsersIcon,
      title: 'Connect',
      description: 'Follow your favorite authors, engage with their content, and build meaningful connections.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Discover',
      description: 'Explore trending topics, discover new voices, and find stories that inspire you.'
    },
    {
      icon: HeartIcon,
      title: 'Engage',
      description: 'Like, comment, and bookmark stories. Show appreciation for great content.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safe Space',
      description: 'Enjoy a respectful, moderated community where everyone can express themselves freely.'
    },
    {
      icon: SparklesIcon,
      title: 'Grow',
      description: 'Track your writing analytics, build your audience, and improve your craft.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Writers' },
    { number: '50K+', label: 'Stories Published' },
    { number: '100K+', label: 'Monthly Readers' },
    { number: '500K+', label: 'Story Views' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About BlogAdda
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              A modern platform where stories come to life, voices are heard, and communities are built through the power of words.
            </p>
            <div className="flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-yellow-300 mr-2" />
              <span className="text-lg font-semibold">Empowering storytellers since 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            BlogAdda exists to democratize storytelling and create a space where every voice matters. 
            We believe that everyone has a story worth telling, and we're here to provide the tools, 
            community, and platform to help those stories reach the world.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3 w-fit mb-4">
                  <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Growing Community</h2>
            <p className="text-gray-300 text-lg">
              Join thousands of writers and readers making BlogAdda their home for stories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Growth</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe in continuous learning and helping our community grow as writers and thinkers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Strong connections and meaningful interactions make our platform a welcoming space for all.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We constantly evolve our platform with cutting-edge features to enhance your writing experience.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join our community of passionate writers and readers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Start Writing
            </a>
            <a
              href="/trending"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center justify-center"
            >
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              Explore Stories
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
