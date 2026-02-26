import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying, color = '#BEE7FF', barCount = 60 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>([]);

  // Initialize bars if needed
  if (barsRef.current.length !== barCount) {
    barsRef.current = new Array(barCount).fill(0).map(() => Math.random() * 20);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Set internal resolution to match display size for sharpness
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
    };
    
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (!ctx || !canvas) return;
      
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = width / barCount;
      const gap = Math.max(2, barWidth * 0.2);
      const actualBarWidth = barWidth - gap;
      
      ctx.fillStyle = color;
      
      for (let i = 0; i < barCount; i++) {
        // Target height based on playing state
        // Use sine waves + noise for more organic look
        let targetHeight = 4;
        if (isPlaying) {
          const time = Date.now() / 200;
          const noise = Math.random() * height * 0.5;
          const wave = Math.sin(i * 0.2 + time) * height * 0.3;
          targetHeight = Math.max(4, (height * 0.2) + wave + noise);
        } else {
           targetHeight = 4 + Math.sin(i * 0.5 + Date.now() / 500) * 5; // Idle animation
        }
        
        // Smooth interpolation
        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.15;
        
        const h = barsRef.current[i];
        const x = i * barWidth + gap / 2;
        const y = (height - h) / 2; // Center vertically
        
        // Draw rounded rect manually for better browser support if needed, but roundRect is widely supported now
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
           ctx.roundRect(x, y, actualBarWidth, h, actualBarWidth / 2);
        } else {
           ctx.rect(x, y, actualBarWidth, h);
        }
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, color, barCount]);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
