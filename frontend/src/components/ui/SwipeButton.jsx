import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

const SwipeButton = ({ onSwipeComplete, isLoading = false, isCompleted = false }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLocked, setIsLocked] = useState(isCompleted);
  const [maxDrag, setMaxDrag] = useState(0);
  const containerRef = useRef(null);
  const isTriggeredRef = useRef(false);

  const HANDLE_SIZE = 64;
  const COMPLETION_THRESHOLD = 0.8;

  useEffect(() => {
    setIsLocked(isCompleted);
    if (!isCompleted) {
      isTriggeredRef.current = false;
    }
  }, [isCompleted]);

  useEffect(() => {
    const updateMaxDrag = () => {
      if (containerRef.current) {
        setMaxDrag(containerRef.current.offsetWidth - HANDLE_SIZE - 8);
      }
    };

    updateMaxDrag();
    window.addEventListener('resize', updateMaxDrag);
    return () => window.removeEventListener('resize', updateMaxDrag);
  }, []);

  const handleStart = useCallback(() => {
    if (isLoading || isLocked || isCompleted) return;
    setIsDragging(true);
  }, [isLoading, isLocked, isCompleted]);

  const handleMove = useCallback(
    (clientX) => {
      if (!isDragging || isLocked || isCompleted || isLoading || maxDrag === 0) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relativeX = clientX - rect.left - HANDLE_SIZE / 2;
      const newX = Math.max(0, Math.min(relativeX, maxDrag));

      setDragX(newX);

      const dragPercentage = newX / maxDrag;
      if (dragPercentage >= COMPLETION_THRESHOLD && !isTriggeredRef.current) {
        isTriggeredRef.current = true;
        setIsLocked(true);
        setIsDragging(false);
        setDragX(maxDrag);
        onSwipeComplete();
      }
    },
    [isDragging, isLocked, isCompleted, isLoading, maxDrag, onSwipeComplete]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging || maxDrag === 0) return;
    setIsDragging(false);

    const dragPercentage = dragX / maxDrag;

    if (dragPercentage < COMPLETION_THRESHOLD) {
      setDragX(0);
    }
  }, [isDragging, dragX, maxDrag]);

  const handleMouseDown = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleMouseMove = useCallback((e) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleTouchStart = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const dragPercentage = maxDrag > 0 ? dragX / maxDrag : 0;
  const isNearCompletion = dragPercentage >= COMPLETION_THRESHOLD;

  const getCursorClass = () => {
    if (isCompleted || isLocked) return 'cursor-not-allowed';
    if (isLoading) return 'cursor-wait';
    if (isDragging) return 'cursor-grabbing';
    return 'cursor-grab';
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={`relative w-full h-16 rounded-full overflow-hidden transition-all duration-200 ${
          isCompleted || isLocked
            ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20'
            : isDragging && isNearCompletion
            ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20'
            : 'bg-slate-100 dark:bg-slate-800'
        } border-2 ${
          isCompleted || isLocked
            ? 'border-green-300 dark:border-green-700'
            : isDragging && isNearCompletion
            ? 'border-green-400 dark:border-green-600'
            : 'border-slate-300 dark:border-slate-700'
        } ${getCursorClass()}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 pointer-events-none ${
            isDragging ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span
            className={`font-semibold transition-all duration-200 ${
              isCompleted || isLocked
                ? 'text-green-600 dark:text-green-400 text-sm'
                : 'text-slate-600 dark:text-slate-400 text-base'
            }`}
          >
            {isCompleted || isLocked ? 'Task Complete!' : 'Swipe to Complete Task'}
          </span>
        </div>

        <div
          className={`absolute top-1 left-1 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-100 ${
            isCompleted || isLocked
              ? 'bg-green-500 shadow-lg'
              : isDragging
              ? 'bg-blue-500 shadow-2xl scale-110'
              : 'bg-white shadow-md dark:bg-slate-700'
          }`}
          style={{
            transform: `translateX(${dragX}px)`,
          }}
        >
          {isLoading ? (
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 animate-spin">
                <div className="w-6 h-6 border-2 border-transparent border-t-white rounded-full" />
              </div>
            </div>
          ) : isCompleted || isLocked ? (
            <CheckCircle2 className="w-7 h-7 text-white" />
          ) : isDragging ? (
            <ChevronRight className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          )}
        </div>
      </div>


    </div>
  );
};

export default SwipeButton;
