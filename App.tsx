import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImagesView } from './components/GeneratedImagesView';
import { Loader } from './components/Loader';
import { GeneratedView } from './types';
import { describeImage, generateImageView } from './services/geminiService';
import { VIEW_TYPES } from './constants';
import { QuotaManager } from './components/QuotaManager';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedViews, setGeneratedViews] = useState<GeneratedView[]>([]);
  const [basePrompt, setBasePrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'analyzing' | 'generating' | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      // Step 1: Describe the image to get a base prompt
      setLoadingStep('analyzing');
      const description = await describeImage(uploadedImage);
      setBasePrompt(description);

      // Step 2: Generate images for different views in parallel
      setLoadingStep('generating');
      const imagePromises = VIEW_TYPES.map(view => {
        const prompt = `${description}, ${view.toLowerCase()} view, detailed, cinematic lighting, 4k, trending on artstation`;
        return generateImageView(uploadedImage, prompt);
      });
      
      const results = await Promise.all(imagePromises);

      const newGeneratedViews: GeneratedView[] = results.map((imageUrl, index) => ({
        view: VIEW_TYPES[index],
        imageUrl: imageUrl,
      }));

      setGeneratedViews(newGeneratedViews);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingStep(null);
    }
  }, [uploadedImage, usedCredits, totalCredits]);

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
        
        {isLoading && <Loader step={loadingStep} />}

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