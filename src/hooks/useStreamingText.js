import { useState, useEffect, useCallback, useRef } from 'react';

export function useStreamingText(text, options = {}) {
  const {
    speed = 20,
    startDelay = 0,
    onComplete = () => {},
    enabled = true,
  } = options;

  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

  const reset = useCallback(() => {
    setDisplayedText('');
    setIsStreaming(false);
    setIsComplete(false);
    indexRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const start = useCallback(() => {
    if (!enabled || !text) return;
    
    reset();
    setIsStreaming(true);

    const streamChar = () => {
      if (indexRef.current < text.length) {
        // Stream multiple characters at once for faster rendering
        const charsToAdd = Math.min(3, text.length - indexRef.current);
        const nextChars = text.slice(indexRef.current, indexRef.current + charsToAdd);
        setDisplayedText(prev => prev + nextChars);
        indexRef.current += charsToAdd;
        
        // Variable speed based on punctuation
        let delay = speed;
        if (nextChars.includes('.') || nextChars.includes('!') || nextChars.includes('?')) {
          delay = speed * 8;
        } else if (nextChars.includes(',') || nextChars.includes(':')) {
          delay = speed * 4;
        } else if (nextChars.includes('\n')) {
          delay = speed * 6;
        }
        
        timeoutRef.current = setTimeout(streamChar, delay);
      } else {
        setIsStreaming(false);
        setIsComplete(true);
        onComplete();
      }
    };

    timeoutRef.current = setTimeout(streamChar, startDelay);
  }, [text, speed, startDelay, onComplete, enabled, reset]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const skipToEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText(text);
    setIsStreaming(false);
    setIsComplete(true);
    indexRef.current = text.length;
    onComplete();
  }, [text, onComplete]);

  return {
    displayedText,
    isStreaming,
    isComplete,
    start,
    reset,
    skipToEnd,
    progress: text ? (indexRef.current / text.length) * 100 : 0,
  };
}
