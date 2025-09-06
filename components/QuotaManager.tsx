import React, { useState, useEffect } from 'react';

interface QuotaManagerProps {
  totalCredits: number;
  usedCredits: number;
  onSetCredits: (newTotal: number) => void;
  onResetCredits: () => void;
  isLoading: boolean;
}

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);


export const QuotaManager: React.FC<QuotaManagerProps> = ({
  totalCredits,
  usedCredits,
  onSetCredits,
  onResetCredits,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState<string>(totalCredits.toString());
  const remainingCredits = Math.max(0, totalCredits - usedCredits);

  useEffect(() => {
    setInputValue(totalCredits.toString());
  }, [totalCredits]);

  const handleSetClick = () => {
    const newTotal = parseInt(inputValue, 10);
    if (!isNaN(newTotal) && newTotal >= 0) {
      onSetCredits(newTotal);
    } else {
        setInputValue(totalCredits.toString()); // Revert if invalid
    }
  };

  return (
    <div className="w-full max-w-2xl p-4 bg-slate-800/60 rounded-xl mb-6">
      <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2 mb-4">
        <SettingsIcon className="w-5 h-5 text-indigo-400" />
        Generation Quota
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-grow w-full">
            <label htmlFor="quota-input" className="block text-sm font-medium text-slate-400 mb-1">
                Set Total Credits
            </label>
            <div className="flex items-center gap-2">
                <input
                    id="quota-input"
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleSetClick}
                    onKeyDown={(e) => {if (e.key === 'Enter') (e.target as HTMLInputElement).blur()}}
                    min="0"
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
                    aria-label="Set total generation credits"
                />
                <button
                    onClick={handleSetClick}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition"
                    aria-label="Confirm new credit total"
                >
                    Set
                </button>
            </div>
        </div>
        <div className="text-center p-4 bg-slate-900 rounded-lg w-full sm:w-auto flex-shrink-0">
            <p className="text-sm text-slate-400 uppercase tracking-wider">Remaining</p>
            <p className="text-3xl font-bold text-cyan-400">
                {remainingCredits}
                <span className="text-xl text-slate-500"> / {totalCredits}</span>
            </p>
        </div>
        <button
            onClick={onResetCredits}
            disabled={isLoading}
            className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Reset used credits to zero"
            aria-label="Reset used credits"
        >
            <RefreshIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};