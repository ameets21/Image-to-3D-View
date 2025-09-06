import React from 'react';

interface ModelSelectorProps {
  selectedModel: 'edit' | 'generate';
  onModelChange: (model: 'edit' | 'generate') => void;
  disabled: boolean;
}

const ModelOption: React.FC<{
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
    disabled: boolean;
}> = ({ title, description, isSelected, onClick, disabled }) => (
    <div
        onClick={!disabled ? onClick : undefined}
        className={`w-full p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected
                ? 'border-indigo-500 bg-indigo-900/30'
                : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full border-2 mr-4 ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-500'}`}></div>
            <div>
                <h4 className={`font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>{title}</h4>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
        </div>
    </div>
);

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange, disabled }) => {
  return (
    <div className="w-full space-y-3 mb-4">
        <ModelOption
            title="Image Editing (Preserves Face)"
            description="Uses the original photo to keep the face consistent. Recommended for best results."
            isSelected={selectedModel === 'edit'}
            onClick={() => onModelChange('edit')}
            disabled={disabled}
        />
        <ModelOption
            title="Image Generation (New Face)"
            description="Generates from text only. Use this if the editing model is unavailable or over quota."
            // Fix: Changed `selected.model` to `selectedModel` which is the correct prop name.
            isSelected={selectedModel === 'generate'}
            onClick={() => onModelChange('generate')}
            disabled={disabled}
        />
    </div>
  );
};
