import React from 'react';
import { Offer } from '../types';

interface OfferCardProps {
  offer: Offer;
  onClick: (offer: Offer) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onClick }) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] active:bg-gray-50 transition-all duration-200 cursor-pointer overflow-hidden relative"
      onClick={() => onClick(offer)}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 relative">
             <img 
                src={offer.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.title)}&background=random`} 
                alt={offer.title} 
                className="h-14 w-14 rounded-2xl object-cover shadow-sm bg-gray-100"
            />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
                 <h3 className="text-base font-bold text-gray-900 truncate pr-2">{offer.title}</h3>
                 <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                     Free
                 </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                {offer.description}
            </p>
            <div className="flex items-center gap-1 mt-2">
                 <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Instant
                 </span>
            </div>
        </div>

        {/* Arrow */}
        <div className="text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;