
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  analyzer?: AnalyserNode;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, analyzer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !analyzer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10b981'); // emerald-500
        gradient.addColorStop(1, '#3b82f6'); // blue-500

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, analyzer]);

  return (
    <div className="w-full h-16 bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/50">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={64} 
        className="w-full h-full"
      />
    </div>
  );
};

export default Visualizer;
