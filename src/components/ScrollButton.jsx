import React, { useState, useEffect } from 'react';
import './ScrollButton.css';

const ScrollButton = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      
      // Check if we're at the top of the page
      setIsAtTop(scrolled < 50);
      
      // Show button when scrolled down
      setIsAtBottom(scrolled > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTopOrBottom = () => {
    if (isAtTop) {
      // If at top, scroll to bottom
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      // If not at top, scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // Delay state update slightly to avoid conflicts with scroll event handler
    setTimeout(() => {
      setIsAtTop(!isAtTop);
    }, 50);
  };
  
  return (
    <button 
      id="scroll-button" 
      className={`scroll-button ${isAtBottom ? "at-bottom" : ""} ${isAtTop ? "at-top" : ""}`}
      title={isAtTop ? "Scroll to bottom" : "Scroll to top"}
      aria-label={isAtTop ? "Scroll to bottom of page" : "Scroll to top of page"}
      onClick={scrollToTopOrBottom}
      data-component-name="ScrollButton">
      <svg 
        aria-hidden="true" 
        focusable="false" 
        data-prefix="fas" 
        data-icon="arrow-up"
        className="svg-inline--fa fa-arrow-up"
        role="img" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 384 512">
        <path 
          fill="currentColor" 
          d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z">
        </path>
      </svg>
      <span>{isAtTop ? "Bottom" : "Top"}</span>
    </button>
  );
};

export default ScrollButton;