import React from 'react';
import Lottie from 'lottie-react';

const LottieAnimation = ({ 
  animationData, 
  className = '', 
  loop = true, 
  autoplay = true,
  speed = 1,
  style = {},
  ...props 
}) => {
  const defaultOptions = {
    loop,
    autoplay,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div className={`${className}`} style={style}>
      <Lottie 
        {...defaultOptions} 
        {...props}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieAnimation;
