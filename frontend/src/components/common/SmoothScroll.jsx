import React, { useEffect } from 'react';

const SmoothScroll = ({ children, speed = 1 }) => {
  useEffect(() => {
    let requestId;
    let currentY = 0;
    let targetY = 0;

    const smoothScroll = () => {
      targetY = window.scrollY;
      currentY += (targetY - currentY) * 0.1 * speed;
      
      document.body.style.transform = `translateY(${currentY - targetY}px)`;
      
      requestId = requestAnimationFrame(smoothScroll);
    };

    // Start smooth scroll
    smoothScroll();

    return () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
      document.body.style.transform = '';
    };
  }, [speed]);

  return <>{children}</>;
};

export default SmoothScroll;
