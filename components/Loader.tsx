import React from 'react';

interface LoaderProps {
  step: 'analyzing' | 'generating' | null;
  progressMessage?: string | null;
}

export const Loader: React.FC<LoaderProps> = ({ step, progressMessage }) => {
  const getMessage = () => {
    switch (step) {
      case 'analyzing':
        return 'Analyzing your image...';
      case 'generating':
        return 'Generating 3D views... This may take a moment.';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8 p-6 bg-slate-800/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      <p className="text-lg text-slate-300 font-medium">{getMessage()}</p>
      {progressMessage && (
        <p className="text-sm text-slate-400 font-mono mt-2">{progressMessage}</p>
      )}
    </div>
  );
};