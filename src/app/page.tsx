'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DispatchInput from '@/components/DispatchInput';
import AnalysisPanel from '@/components/AnalysisPanel';
import { DispatchAnalysis } from '@/types/dispatch';
import { analyzeDispatch } from '@/services/dispatchAnalyzer';

const IncidentMap = dynamic(() => import('@/components/IncidentMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [analysis, setAnalysis] = useState<DispatchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (dispatchText: string) => {
    setIsLoading(true);
    try {
      const result = await analyzeDispatch(dispatchText);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing dispatch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">🚨</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Res-Q AI</h1>
              <p className="text-xs sm:text-sm text-red-200">AI-Powered Dispatch Analysis for First Responders</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel - Input and Analysis */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <DispatchInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            <AnalysisPanel analysis={analysis} isLoading={isLoading} />
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 h-[400px] sm:h-[500px] lg:h-[calc(100vh-160px)]">
              <IncidentMap analysis={analysis} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-3 sm:py-4 mt-6 sm:mt-8">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm">
          <p>Res-Q AI - Emergency Response Scene Preview System</p>
          <p className="text-gray-400 mt-1">Powered by Azure AI Services</p>
        </div>
      </footer>
    </div>
  );
}
