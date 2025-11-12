
import React from 'react';
import { ChartType } from '../types';
import { BarChartIcon, BarChartHorizontalIcon } from './Icons';

interface WelcomeProps {
  onSelectType: (type: ChartType) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onSelectType }) => {
  return (
    <div className="text-center w-full max-w-3xl p-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Create a New Visualization</h2>
      <p className="text-lg text-gray-400 mb-12">
        Start by choosing the type of bar chart you want to build.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          onClick={() => onSelectType(ChartType.VERTICAL)}
          className="group bg-gray-800 border border-gray-700 rounded-lg p-8 hover:bg-blue-600/20 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          <BarChartIcon className="w-16 h-16 mx-auto mb-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <h3 className="text-2xl font-semibold text-white">Vertical Bar Chart</h3>
        </button>
        <button
          onClick={() => onSelectType(ChartType.HORIZONTAL)}
          className="group bg-gray-800 border border-gray-700 rounded-lg p-8 hover:bg-teal-600/20 hover:border-teal-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          <BarChartHorizontalIcon className="w-16 h-16 mx-auto mb-4 text-teal-400 group-hover:text-teal-300 transition-colors" />
          <h3 className="text-2xl font-semibold text-white">Horizontal Bar Chart</h3>
        </button>
      </div>
    </div>
  );
};

export default Welcome;
