
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChartData, ChartType, ChartConfig, BarChartConfig, ScatterPlotConfig } from '../types';
import { ArrowLeftIcon } from './Icons';
import { BarChartVibe, ScatterPlotVibe } from '../lib/ChartVibe';

interface ChartBuilderProps {
  config: ChartConfig;
  type: ChartType;
  onComplete: (data: ChartData) => void;
  onBack: () => void;
}

const ChartBuilder: React.FC<ChartBuilderProps> = ({ config, type, onComplete, onBack }) => {
  const chartRef = useRef<BarChartVibe | ScatterPlotVibe | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSum, setCurrentSum] = useState(0);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        const newWidth = Math.max(clientWidth, 300);
        setDimensions({ width: newWidth, height: newWidth * 0.75 });
      }
    };
    const timeoutId = setTimeout(updateDimensions, 0);
    window.addEventListener('resize', updateDimensions);
    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0) return;

    chartRef.current?.destroy();
    while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
    }

    let chart: BarChartVibe | ScatterPlotVibe;

    if (type === ChartType.VERTICAL || type === ChartType.HORIZONTAL) {
        const barConfig = config as BarChartConfig;
        chart = new BarChartVibe({
            ...barConfig,
            type,
            width: dimensions.width,
            height: dimensions.height,
            onSumUpdate: setCurrentSum,
        });
    } else if (type === ChartType.SCATTER) {
        chart = new ScatterPlotVibe({
            config: config as ScatterPlotConfig,
            width: dimensions.width,
            height: dimensions.height,
        });
    } else {
      return;
    }
    
    containerRef.current.appendChild(chart.getSvgNode());
    chartRef.current = chart;

    return () => {
        chart.destroy();
    };
  }, [config, type, dimensions]);

  const handleComplete = useCallback(() => {
    if (chartRef.current) {
      onComplete(chartRef.current.getData());
    }
  }, [onComplete]);

  const isBarChart = type === ChartType.VERTICAL || type === ChartType.HORIZONTAL;
  const { totalSumLimit } = (isBarChart ? config : {}) as BarChartConfig;
  const title = isBarChart ? "Draw Your Chart" : "Plot Your Data";
  const instruction = isBarChart ? "Click and drag on a category to draw the bar." : "Click on the canvas to add a data point.";

  return (
    <div className="w-full max-w-5xl flex flex-col items-center p-4">
      <div className="w-full flex justify-between items-center mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-[#fdfdfd] transition-colors">
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>
        <h2 className="text-xl font-bold text-center text-[#fdfdfd]">{title}</h2>
        <div className="w-24"></div>
      </div>
      <div className="w-full text-center mb-4">
        <p className="text-gray-300 mb-2">{instruction}</p>
        {isBarChart && typeof totalSumLimit === 'number' && (
          <div className="bg-[#fdfdfd]/10 inline-block px-4 py-1 rounded-full text-lg">
            <span className={`font-bold ${currentSum > totalSumLimit ? 'text-red-400' : 'text-[#fdfdfd]'}`}>{currentSum.toLocaleString()}</span>
            <span className="text-gray-300"> / {totalSumLimit.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div 
        ref={containerRef} 
        className="w-full bg-[#fdfdfd]/5 border border-[#fdfdfd]/10 rounded-xl p-4 shadow-2xl min-h-[300px] backdrop-blur-sm"
      />
      <button
        onClick={handleComplete}
        className="mt-8 bg-[#f9dc5c] text-[#23395d] font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg text-lg"
      >
        Get Dataset
      </button>
    </div>
  );
};

export default ChartBuilder;