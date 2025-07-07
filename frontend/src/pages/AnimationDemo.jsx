import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation, useParallax, useHover, useCountUp, useTypewriter } from '../hooks/useAnimation';
import AnimationWrapper from '../components/common/AnimationWrapper';
import ParticleBackground from '../components/common/ParticleBackground';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  BoltIcon, 
  HeartIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/solid';

const AnimationDemo = () => {
  const [showDemo, setShowDemo] = useState(false);
  const { ref: parallaxRef, offset } = useParallax(0.5);
  const { ref: hoverRef, isHovered } = useHover();
  const { ref: countRef, count } = useCountUp(1000, 2000);
  const { ref: typeRef, displayText } = useTypewriter("Welcome to BlogAdda's Amazing Animations!", 100);

  useEffect(() => {
    const timer = setTimeout(() => setShowDemo(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground 
        particleCount={30}
        particleColor="#8b5cf6"
        particleSize={3}
        speed={0.3}
      />

      {/* Hero Section with Typewriter */}
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <SparklesIcon className="h-20 w-20 mx-auto mb-6 text-purple-400 animate-pulse" />
            <h1 className="text-6xl font-bold mb-4">
              <span ref={typeRef} className="text-gradient-purple">
                {displayText}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the power of modern animations and interactions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Animation Showcase */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimationWrapper animation="fade-in-up" delay={200}>
            <h2 className="text-5xl font-bold text-center mb-16 text-gradient-purple">
              Animation Gallery
            </h2>
          </AnimationWrapper>

          {/* CSS Animations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              { name: 'Fade In Up', class: 'animate-fade-in-up', icon: RocketLaunchIcon },
              { name: 'Slide In', class: 'animate-slide-in', icon: BoltIcon },
              { name: 'Float', class: 'animate-float', icon: HeartIcon },
              { name: 'Wiggle', class: 'animate-wiggle', icon: StarIcon },
              { name: 'Glow', class: 'animate-glow', icon: FireIcon },
              { name: 'Shimmer', class: 'animate-shimmer', icon: SparklesIcon }
            ].map((animation, index) => (
              <AnimationWrapper key={index} animation="zoom-in" delay={index * 100}>
                <div className="bg-slate-800 rounded-2xl p-8 text-center hover:bg-slate-700 transition-colors duration-300">
                  <animation.icon className={`h-16 w-16 mx-auto mb-4 text-purple-400 ${animation.class}`} />
                  <h3 className="text-xl font-bold mb-2">{animation.name}</h3>
                  <p className="text-gray-400">CSS Animation</p>
                </div>
              </AnimationWrapper>
            ))}
          </div>

          {/* Parallax Section */}
          <div ref={parallaxRef} className="relative mb-20">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-20"
              style={{ transform: `translateY(${offset * 0.5}px)` }}
            />
            <div className="relative z-10 text-center py-20">
              <AnimationWrapper animation="slide-left">
                <h2 className="text-4xl font-bold mb-4">Parallax Scrolling</h2>
                <p className="text-xl text-gray-300">Background moves at different speed</p>
              </AnimationWrapper>
            </div>
          </div>

          {/* Hover Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div ref={hoverRef} className="relative">
              <div className={`bg-slate-800 rounded-2xl p-8 text-center transition-all duration-500 ${
                isHovered ? 'transform scale-105 shadow-2xl glow-purple' : ''
              }`}>
                <h3 className="text-2xl font-bold mb-4">Hover Effects</h3>
                <p className="text-gray-400">Hover over me to see the magic!</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Count Up Animation</h3>
              <div ref={countRef} className="text-4xl font-bold text-purple-400 mb-2">
                {count}+
              </div>
              <p className="text-gray-400">Animated Counter</p>
            </div>
          </div>

          {/* Framer Motion Animations */}
          <AnimationWrapper animation="fade-in-up">
            <h2 className="text-4xl font-bold text-center mb-12 text-gradient-blue">
              Framer Motion Animations
            </h2>
          </AnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <motion.div
              whileHover={{ scale: 1.05, rotateY: 10 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-800 rounded-2xl p-8 text-center cursor-pointer"
            >
              <BoltIcon className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold mb-2">Hover & Tap</h3>
              <p className="text-gray-400">Interactive 3D effects</p>
            </motion.div>

            <motion.div
              animate={{ 
                rotate: [0, 360],
                borderRadius: ['20px', '50px', '20px'],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: 'loop'
              }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-center"
            >
              <HeartIcon className="h-12 w-12 mx-auto mb-4 text-white" />
              <h3 className="text-xl font-bold mb-2">Continuous</h3>
              <p className="text-gray-200">Infinite animation loop</p>
            </motion.div>

            <motion.div
              whileInView={{ 
                x: [0, 100, 0],
                opacity: [0, 1, 1]
              }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="bg-slate-800 rounded-2xl p-8 text-center"
            >
              <StarIcon className="h-12 w-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold mb-2">Scroll Trigger</h3>
              <p className="text-gray-400">Animate when visible</p>
            </motion.div>
          </div>

          {/* Advanced Animations */}
          <div className="text-center">
            <AnimationWrapper animation="zoom-in" delay={500}>
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
              >
                {showDemo ? 'Hide Demo' : 'Show Demo'}
              </button>
            </AnimationWrapper>

            <AnimatePresence>
              {showDemo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 bg-slate-800 rounded-2xl p-8 overflow-hidden"
                >
                  <h3 className="text-2xl font-bold mb-4">Advanced Animation Demo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item * 0.1 }}
                        className="bg-slate-700 rounded-xl p-4 text-center"
                      >
                        <div className="text-3xl mb-2">🎨</div>
                        <p>Demo Item {item}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center">
        <AnimationWrapper animation="fade-in-up">
          <p className="text-gray-400 text-lg">
            All animations are optimized for performance and accessibility
          </p>
        </AnimationWrapper>
      </footer>
    </div>
  );
};

export default AnimationDemo;
