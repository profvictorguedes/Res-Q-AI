'use client';

import { useState, FormEvent } from 'react';

interface DispatchInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const SAMPLE_DISPATCHES = [
  "Structure fire at 123 Main Street, New York. 3-story apartment building with heavy smoke from upper floors. Multiple residents trapped on 3rd floor. Fire spreading rapidly. Gas line nearby. 5 victims reported.",
  "Chemical spill at 456 Industrial Blvd, Houston. Warehouse facility with unknown hazardous materials leaking from storage containers. Strong fumes detected. 2 workers injured. Building evacuation in progress.",
  "Vehicle accident with entrapment at 789 Highway 101, Los Angeles. Multi-vehicle collision involving fuel tanker. Fire risk. Power lines down. 8 people involved, 3 critical.",
  "Structural collapse at 321 Oak Avenue, Chicago. Construction site with partial building collapse. Workers trapped under debris. Electrical hazards present. Unstable structure. 4 victims trapped.",
];

export default function DispatchInput({ onAnalyze, isLoading }: DispatchInputProps) {
  const [dispatchText, setDispatchText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (dispatchText.trim()) {
      onAnalyze(dispatchText.trim());
    }
  };

  const handleSampleClick = (sample: string) => {
    setDispatchText(sample);
    onAnalyze(sample);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="dispatch" className="block text-sm font-medium text-gray-700 mb-2">
            📞 Dispatch Notes
          </label>
          <textarea
            id="dispatch"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base text-gray-900"
            placeholder="Enter dispatch notes here... (e.g., 'Structure fire at 123 Main Street, 3-story building, multiple victims trapped')"
            value={dispatchText}
            onChange={(e) => setDispatchText(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!dispatchText.trim() || isLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              🔍 Analyze Dispatch
            </>
          )}
        </button>
      </form>

      <div className="mt-4 sm:mt-6">
        <p className="text-xs sm:text-sm text-gray-500 mb-2">Or try a sample dispatch:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_DISPATCHES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSampleClick(sample)}
              disabled={isLoading}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 text-xs sm:text-sm rounded-full transition-colors duration-200 truncate max-w-[150px] sm:max-w-[200px]"
              title={sample}
            >
              {sample.split('.')[0]}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
