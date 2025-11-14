
import React, { useState, useCallback } from 'react';
import Welcome from './components/Welcome';
import ConfigForm from './components/ConfigForm';
import ChartBuilder from './components/ChartBuilder';
import DatasetDisplay from './components/DatasetDisplay';
import { ChartType, ChartDataItem, ChartConfig } from './types';
import { GithubIcon } from './components/Icons';

type AppState = 'welcome' | 'config' | 'build' | 'dataset';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [chartType, setChartType] = useState<ChartType | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[] | null>(null);

  const handleTypeSelect = useCallback((type: ChartType) => {
    setChartType(type);
    setAppState('config');
  }, []);

  const handleConfigSubmit = useCallback((config: ChartConfig) => {
    setChartConfig(config);
    setAppState('build');
  }, []);
  
  const handleBuildComplete = useCallback((data: ChartDataItem[]) => {
    setChartData(data);
    setAppState('dataset');
  }, []);

  const handleReset = useCallback(() => {
    setAppState('welcome');
    setChartType(null);
    setChartConfig(null);
    setChartData(null);
  }, []);

  const handleBackToConfig = useCallback(() => {
    setAppState('config');
    setChartConfig(null);
    setChartData(null);
  }, []);


  const renderContent = () => {
    switch (appState) {
      case 'config':
        return chartType && <ConfigForm chartType={chartType} onConfigSubmit={handleConfigSubmit} onBack={() => setAppState('welcome')} />;
      case 'build':
        return chartConfig && chartType && <ChartBuilder {...chartConfig} type={chartType} onComplete={handleBuildComplete} onBack={handleBackToConfig} />;
      case 'dataset':
        return chartData && chartConfig && chartType && <DatasetDisplay data={chartData} config={chartConfig} type={chartType} onReset={handleReset} />;
      case 'welcome':
      default:
        return <Welcome onSelectType={handleTypeSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#23395d] text-[#fdfdfd] flex flex-col items-center justify-center p-4 font-sans">
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#f9dc5c]">
          VibeJS
        </h1>
        <a href="https://github.com/mehdijahani1998/ViBeJS" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#fdfdfd] transition-colors">
          <GithubIcon className="w-8 h-8" />
        </a>
      </header>
      <main className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
