import { useState, useEffect } from 'react';

export const useMouseParallax = (strength: number = 20) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Skip on touch devices / mobile — no mouse to track
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * strength;
      const y = (e.clientY / window.innerHeight - 0.5) * strength;
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength]);

  return position;
};
