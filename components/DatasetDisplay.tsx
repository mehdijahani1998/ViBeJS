
import React, { useState, useCallback } from 'react';
// FIX: Replaced ChartDataItem with ChartData as it's the correct type for the data prop.
import { ChartData, ChartType, ChartConfig } from '../types';
import { generateAnalysis } from '../services/geminiService';
import { SparklesIcon, CopyIcon, CheckIcon } from './Icons';

interface DatasetDisplayProps {
  data: ChartData;
  config: ChartConfig;
  type: ChartType;
  onReset: () => void;
}

const DatasetDisplay: React.FC<DatasetDisplayProps> = ({ data, type, onReset }) => {
  const [analysis, setAnalysis] = useState<{ title: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGetAnalysis = useCallback(async () => {
    setIsLoading(true);
    const result = await generateAnalysis(data, type);
    setAnalysis(result);
    setIsLoading(false);
  }, [data, type]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const dataString = JSON.stringify(data, null, 2);

  return (
    <div className="w-full max-w-4xl p-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#fdfdfd]">Your Generated Dataset</h2>
        <p className="text-center text-gray-300 mb-8">Here is the data from the chart you created. You can also get an AI-powered analysis.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#fdfdfd]/5 border border-[#fdfdfd]/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[#fdfdfd]">Raw Data (JSON)</h3>
                    <button onClick={handleCopy} className="text-gray-300 hover:text-[#fdfdfd] transition-colors">
                        {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>
                <pre className="bg-black/20 rounded-lg p-4 text-sm text-gray-200 overflow-x-auto h-80">
                    <code>{dataString}</code>
                </pre>
            </div>
            <div className="bg-[#fdfdfd]/5 border border-[#fdfdfd]/10 rounded-xl p-6 flex flex-col backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4 text-[#fdfdfd]">AI Analysis</h3>
                {analysis ? (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-[#f9dc5c]">{analysis.title}</h4>
                        <p className="text-gray-200">{analysis.description}</p>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-300">
                        <SparklesIcon className="w-12 h-12 mb-4"/>
                        <p>Click the button below to generate a title and description for your data using Gemini.</p>
                    </div>
                )}
                <button 
                    onClick={handleGetAnalysis}
                    disabled={isLoading}
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-[#f9dc5c] text-[#23395d] font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#23395d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            {analysis ? 'Regenerate Analysis' : 'Get AI Analysis'}
                        </>
                    )}
                </button>
            </div>
        </div>
         <div className="text-center mt-12">
            <button
              onClick={onReset}
              className="bg-[#f9dc5c] text-[#23395d] font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg text-lg"
            >
              Create New Chart
            </button>
        </div>
    </div>
  );
};

export default DatasetDisplay;