
import React, { useState } from 'react';
import { ChartType, ChartConfig } from '../types';
import { ArrowLeftIcon } from './Icons';

interface ConfigFormProps {
  chartType: ChartType;
  onConfigSubmit: (config: ChartConfig) => void;
  onBack: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ chartType, onConfigSubmit, onBack }) => {
  const [labels, setLabels] = useState('Sales, Marketing, R&D, Support');
  const [maxValue, setMaxValue] = useState('1000');
  const [xAxisLabel, setXAxisLabel] = useState(chartType === ChartType.VERTICAL ? 'Categories' : 'Value');
  const [yAxisLabel, setYAxisLabel] = useState(chartType === ChartType.VERTICAL ? 'Value' : 'Categories');
  const [limitTotalSum, setLimitTotalSum] = useState(false);
  const [totalSum, setTotalSum] = useState('1000');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMaxValue = parseInt(maxValue, 10);
    const parsedLabels = labels.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const parsedTotalSum = parseInt(totalSum, 10);

    if (parsedLabels.length === 0) {
      setError('Please enter at least one label.');
      return;
    }
    if (isNaN(parsedMaxValue) || parsedMaxValue <= 0) {
      setError('Maximum value must be a positive number.');
      return;
    }
    if (limitTotalSum && (isNaN(parsedTotalSum) || parsedTotalSum <= 0)) {
        setError('Total sum limit must be a positive number.');
        return;
    }

    setError('');
    onConfigSubmit({
      labels: parsedLabels,
      maxValue: parsedMaxValue,
      xAxisLabel: xAxisLabel.trim(),
      yAxisLabel: yAxisLabel.trim(),
      totalSumLimit: limitTotalSum ? parsedTotalSum : undefined,
    });
  };

  const axisLabel = chartType === ChartType.VERTICAL ? 'X-Axis' : 'Y-Axis';
  const valueAxisLabel = chartType === ChartType.VERTICAL ? 'Y-Axis' : 'X-Axis';

  return (
    <div className="w-full max-w-lg bg-[#fdfdfd]/5 border border-[#fdfdfd]/10 rounded-xl p-8 shadow-2xl relative backdrop-blur-sm">
       <button onClick={onBack} className="absolute top-4 left-4 text-gray-300 hover:text-[#fdfdfd] transition-colors">
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <h2 className="text-2xl font-bold text-center mb-2 text-[#fdfdfd]">Configure Your Chart</h2>
       <p className="text-center text-gray-300 mb-8">Set up the labels and scale for your chart.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="labels" className="block text-sm font-medium text-gray-200 mb-2">
            {axisLabel} Labels (comma-separated)
          </label>
          <input
            id="labels"
            type="text"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            className="w-full bg-transparent border border-[#fdfdfd]/30 rounded-md px-4 py-2 text-[#fdfdfd] focus:ring-2 focus:ring-[#f9dc5c] focus:border-[#f9dc5c] focus:outline-none transition-colors"
            placeholder="e.g., Q1, Q2, Q3, Q4"
          />
        </div>
        <div>
          <label htmlFor="maxValue" className="block text-sm font-medium text-gray-200 mb-2">
            Maximum {valueAxisLabel} Value
          </label>
          <input
            id="maxValue"
            type="number"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            className="w-full bg-transparent border border-[#fdfdfd]/30 rounded-md px-4 py-2 text-[#fdfdfd] focus:ring-2 focus:ring-[#f9dc5c] focus:border-[#f9dc5c] focus:outline-none transition-colors"
            placeholder="e.g., 100"
          />
        </div>
        
        <div>
          <label htmlFor="xAxisLabel" className="block text-sm font-medium text-gray-200 mb-2">
            X-Axis Label
          </label>
          <input
            id="xAxisLabel"
            type="text"
            value={xAxisLabel}
            onChange={(e) => setXAxisLabel(e.target.value)}
            className="w-full bg-transparent border border-[#fdfdfd]/30 rounded-md px-4 py-2 text-[#fdfdfd] focus:ring-2 focus:ring-[#f9dc5c] focus:border-[#f9dc5c] focus:outline-none transition-colors"
            placeholder="e.g., Quarters"
          />
        </div>
        <div>
          <label htmlFor="yAxisLabel" className="block text-sm font-medium text-gray-200 mb-2">
            Y-Axis Label
          </label>
          <input
            id="yAxisLabel"
            type="text"
            value={yAxisLabel}
            onChange={(e) => setYAxisLabel(e.target.value)}
            className="w-full bg-transparent border border-[#fdfdfd]/30 rounded-md px-4 py-2 text-[#fdfdfd] focus:ring-2 focus:ring-[#f9dc5c] focus:border-[#f9dc5c] focus:outline-none transition-colors"
            placeholder="e.g., Revenue (in USD)"
          />
        </div>

        <div className="space-y-4 pt-2 border-t border-[#fdfdfd]/20">
            <div className="flex items-center">
                <input
                    id="limitTotalSum"
                    type="checkbox"
                    checked={limitTotalSum}
                    onChange={(e) => setLimitTotalSum(e.target.checked)}
                    className="h-4 w-4 rounded border-[#fdfdfd]/30 bg-transparent text-[#f9dc5c] focus:ring-[#f9dc5c] focus:ring-offset-0"
                />
                <label htmlFor="limitTotalSum" className="ml-3 block text-sm font-medium text-gray-200">
                    Limit total sum of values
                </label>
            </div>
            {limitTotalSum && (
                <div>
                    <label htmlFor="totalSum" className="block text-sm font-medium text-gray-200 mb-2">
                        Target Total Sum
                    </label>
                    <input
                        id="totalSum"
                        type="number"
                        value={totalSum}
                        onChange={(e) => setTotalSum(e.target.value)}
                        className="w-full bg-transparent border border-[#fdfdfd]/30 rounded-md px-4 py-2 text-[#fdfdfd] focus:ring-2 focus:ring-[#f9dc5c] focus:border-[#f9dc5c] focus:outline-none transition-colors"
                        placeholder="e.g., 1000"
                    />
                </div>
            )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-[#f9dc5c] text-[#23395d] font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg"
        >
          Build Chart
        </button>
      </form>
    </div>
  );
};

export default ConfigForm;
