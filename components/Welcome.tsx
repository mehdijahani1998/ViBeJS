
import React from 'react';
import { ChartType } from '../types';
import { BarChartIcon, BarChartHorizontalIcon, ScatterPlotIcon } from './Icons';

interface WelcomeProps {
  onSelectType: (type: ChartType) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onSelectType }) => {
  return (
    <div className="text-center w-full max-w-5xl p-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#fdfdfd]">Create a New Visualization</h2>
      <p className="text-lg text-gray-300 mb-12">
        Start by choosing the type of chart you want to build.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <button
          onClick={() => onSelectType(ChartType.VERTICAL)}
          className="group bg-[#fdfdfd]/5 border border-[#fdfdfd]/10 rounded-lg p-8 hover:bg-[#fdfdfd]/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <BarChartIcon className="w-16 h-16 mx-auto mb-4 text-[#f9dc5c] transition-colors" />
          <h3 className="text-2xl font-semibold text-[#fdfdfd]">Vertical Bar Chart</h3>
        </button>
        <button
          onClick={() => onSelectType(ChartType.HORIZONTAL)}
          className="group bg-[#fdfdfd]/5 border border-[#fdfdfd]/10 rounded-lg p-8 hover:bg-[#fdfdfd]/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <BarChartHorizontalIcon className="w-16 h-16 mx-auto mb-4 text-[#f9dc5c] transition-colors" />
          <h3 className="text-2xl font-semibold text-[#fdfdfd]">Horizontal Bar Chart</h3>
        </button>
        <button
          onClick={() => onSelectType(ChartType.SCATTER)}
          className="group bg-[#fdfdfd]/5 border border-[#fdfdfd]/10 rounded-lg p-8 hover:bg-[#fdfdfd]/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <ScatterPlotIcon className="w-16 h-16 mx-auto mb-4 text-[#f9dc5c] transition-colors" />
          <h3 className="text-2xl font-semibold text-[#fdfdfd]">Scatter Plot</h3>
        </button>
      </div>
    </div>
  );
};

export default Welcome;