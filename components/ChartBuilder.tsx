
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChartDataItem, ChartType } from '../types';
import { ArrowLeftIcon } from './Icons';
import { ChartVibe } from '../lib/ChartVibe';

interface ChartBuilderProps {
  labels: string[];
  maxValue: number;
  type: ChartType;
  totalSumLimit?: number;
  onComplete: (data: ChartDataItem[]) => void;
  onBack: () => void;
}

const ChartBuilder: React.FC<ChartBuilderProps> = ({ labels, maxValue, type, totalSumLimit, onComplete, onBack }) => {
  const chartRef = useRef<ChartVibe | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSum, setCurrentSum] = useState(0);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        const newWidth = Math.max(clientWidth, 300);
        setDimensions({ width: newWidth, height: newWidth * 0.625 });
      }
    };

    // Set initial dimensions
    // A timeout is used to ensure the container has rendered and has a width.
    const timeoutId = setTimeout(updateDimensions, 0);

    window.addEventListener('resize', updateDimensions);
    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0) return;

    // Cleanup previous instance
    chartRef.current?.destroy();
    while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const chart = new ChartVibe({
        labels,
        maxValue,
        type,
        totalSumLimit,
        width: dimensions.width,
        height: dimensions.height,
        onSumUpdate: setCurrentSum,
    });

    containerRef.current.appendChild(chart.getSvgNode());
    chartRef.current = chart;

    return () => {
        chart.destroy();
    };
  }, [labels, maxValue, type, totalSumLimit, dimensions]);

  const handleComplete = useCallback(() => {
    if (chartRef.current) {
      onComplete(chartRef.current.getData());
    }
  }, [onComplete]);

  return (
    <div className="w-full max-w-5xl flex flex-col items-center p-4">
      <div className="w-full flex justify-between items-center mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>
        <h2 className="text-xl font-bold text-center">Draw Your Chart</h2>
        <div className="w-24"></div>
      </div>
      <div className="w-full text-center mb-4">
        <p className="text-gray-400 mb-2">Click and drag on a category to draw the bar.</p>
        {typeof totalSumLimit === 'number' && (
          <div className="bg-gray-900/50 inline-block px-4 py-1 rounded-full text-lg">
            <span className={`font-bold ${currentSum > totalSumLimit ? 'text-red-400' : 'text-white'}`}>{currentSum.toLocaleString()}</span>
            <span className="text-gray-400"> / {totalSumLimit.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div 
        ref={containerRef} 
        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 shadow-2xl min-h-[300px]"
      />
      <button
        onClick={handleComplete}
        className="mt-8 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg text-lg"
      >
        Get Dataset
      </button>
    </div>
  );
};

export default ChartBuilder;
