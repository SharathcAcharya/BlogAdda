import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const AnimationWrapper = ({ 
  children, 
  animation = 'fade-in-up', 
  delay = 0, 
  duration = 0.8, 
  threshold = 0.1,
  triggerOnce = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  });

  useEffect(() => {
    if (inView) {
      setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else if (!triggerOnce) {
      setIsVisible(false);
    }
  }, [inView, delay, triggerOnce]);

  const animationClass = isVisible ? `animate-${animation}` : 'opacity-0';

  return (
    <div 
      ref={ref}
      className={`${animationClass} ${className}`}
      style={{ 
        animationDuration: `${duration}s`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
};

export default AnimationWrapper;
