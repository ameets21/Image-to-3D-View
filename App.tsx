import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImagesView } from './components/GeneratedImagesView';
import { Loader } from './components/Loader';
import { GeneratedView } from './types';
import { describeImage, editImageView, generateImageView } from './services/geminiService';
import { VIEW_TYPES } from './constants';
import { QuotaManager } from './components/QuotaManager';
import { ModelSelector } from './components/ModelSelector';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedViews, setGeneratedViews] = useState<GeneratedView[]>([]);
  const [basePrompt, setBasePrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'analyzing' | 'generating' | null>(null);
  const [generatingProgress, setGeneratingProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'edit' | 'generate'>('edit');

  // Quota state initialized from localStorage
  const [totalCredits, setTotalCredits] = useState<number>(() => {
    const saved = localStorage.getItem('totalCredits');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [usedCredits, setUsedCredits] = useState<number>(() => {
    const saved = localStorage.getItem('usedCredits');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persist quota changes to localStorage
  useEffect(() => {
    localStorage.setItem('totalCredits', totalCredits.toString());
  }, [totalCredits]);

  useEffect(() => {
    localStorage.setItem('usedCredits', usedCredits.toString());
  }, [usedCredits]);

  const handleSetTotalCredits = (newTotal: number) => {
    if (newTotal >= 0) {
        setTotalCredits(newTotal);
        setUsedCredits(0); // Reset usage when a new total is set
    }
  };

  const handleResetCredits = () => {
    setUsedCredits(0);
  };

  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setGeneratedViews([]);
    setError(null);
    setBasePrompt(null);
  };

  const handleGenerateViews = useCallback(async () => {
    if (!uploadedImage) {
      setError('Please upload an image first.');
      return;
    }
    if (usedCredits >= totalCredits) {
      setError('You have run out of generation credits. Please set a new credit balance or reset usage.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedViews([]);
    setUsedCredits(prev => prev + 1);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    try {
      // Step 1: Describe the image to get a base prompt
      setLoadingStep('analyzing');
      const description = await describeImage(uploadedImage);
      setBasePrompt(description);

      // Step 2: Generate images for different views sequentially to avoid rate limits
      setLoadingStep('generating');
      const newGeneratedViews: GeneratedView[] = [];
      for (const view of VIEW_TYPES) {
        setGeneratingProgress(`Generating: ${view}`);
        const promptView = view.toLowerCase().endsWith('view') ? view : `${view} view`;
        const prompt = `${description}, ${promptView.toLowerCase()}, detailed, cinematic lighting, 4k, trending on artstation`;
        
        try {
            let imageUrl: string;
            if (selectedModel === 'edit') {
              imageUrl = await editImageView(uploadedImage, prompt);
            } else {
              imageUrl = await generateImageView(prompt);
            }
            const newView = { view, imageUrl };
            newGeneratedViews.push(newView);
            setGeneratedViews([...newGeneratedViews]); // Update UI incrementally
        } catch (viewError) {
             console.error(`Failed to generate view for ${view}:`, viewError);
             const message = viewError instanceof Error ? viewError.message : 'An API error occurred.';
             setError(`Error on "${view}": ${message}. The process has been stopped.`);
             // Stop the entire process on the first error
             throw new Error(`Generation failed for view: ${view}`);
        }
        
        // Add a 1-second delay between requests to avoid rate-limiting issues
        await delay(1000);
      }

    } catch (err) {
      // The error is set in the loop, so we just log that the process was aborted.
      if (err instanceof Error && err.message.startsWith('Generation failed')) {
         console.log("Generation process aborted due to a view generation error.");
      } else {
         console.error("An unexpected error occurred:", err);
         setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep(null);
      setGeneratingProgress(null);
    }
  }, [uploadedImage, usedCredits, totalCredits, selectedModel]);

  const creditsDepleted = usedCredits >= totalCredits;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col p-4 md:p-8">
      <Header />
      <main className="flex-grow container mx-auto flex flex-col items-center justify-center space-y-8">
        <QuotaManager
            totalCredits={totalCredits}
            usedCredits={usedCredits}
            onSetCredits={handleSetTotalCredits}
            onResetCredits={handleResetCredits}
            isLoading={isLoading}
        />
        <div className="w-full max-w-2xl text-center space-y-4">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isLoading}
          />
          <p className="text-slate-400">
            Upload an image and our AI will generate multiple 3D-style views of the main object.
          </p>
          <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
        </div>

        {uploadedImage && (
          <button
            onClick={handleGenerateViews}
            disabled={isLoading || creditsDepleted}
            title={creditsDepleted ? 'No generation credits remaining' : ''}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {isLoading ? 'Generating...' : 'Generate 3D Views'}
          </button>
        )}

        {error && <div className="mt-4 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}
        
        {isLoading && <Loader step={loadingStep} progressMessage={generatingProgress} />}

        {basePrompt && !isLoading && (
            <div className="w-full max-w-4xl p-4 bg-slate-800 rounded-lg text-center">
                <p className="text-slate-400 text-sm">Generated Base Prompt:</p>
                <p className="text-indigo-300 font-mono text-sm md:text-base">"{basePrompt}"</p>
            </div>
        )}
        
        {generatedViews.length > 0 && !isLoading && <GeneratedImagesView views={generatedViews} />}
      </main>
    </div>
  );
};

export default App;