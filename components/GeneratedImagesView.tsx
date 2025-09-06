import React from 'react';
import type { GeneratedView } from '../types';

interface GeneratedImagesViewProps {
  views: GeneratedView[];
}

const ImageViewCard: React.FC<{ viewData: GeneratedView }> = ({ viewData }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-slate-800 shadow-lg transform transition-transform duration-300 hover:scale-105">
      <img
        src={viewData.imageUrl}
        alt={`${viewData.view} view`}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <h3 className="text-lg font-bold text-white drop-shadow-md">{viewData.view} View</h3>
      </div>
    </div>
  );
};

export const GeneratedImagesView: React.FC<GeneratedImagesViewProps> = ({ views }) => {
  return (
    <div className="w-full max-w-7xl mt-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-300">Generated 3D Views</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {views.map((view, index) => (
          <ImageViewCard key={index} viewData={view} />
        ))}
      </div>
    </div>
  );
};
