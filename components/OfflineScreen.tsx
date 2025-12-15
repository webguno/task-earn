import React from 'react';

interface OfflineScreenProps {
  onRetry: () => void;
}

const OfflineScreen: React.FC<OfflineScreenProps> = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#eef2f6] flex flex-col items-center justify-center p-6 text-center animate-fade-up">
      {/* Pulse Animation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-300/30 rounded-full animate-ping opacity-75"></div>
      </div>

      <div className="relative z-10 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
             {/* Logo SVG in Gray (Disconnected state) */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
             {/* Disconnected Icon overlay */}
             <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1.5 border-4 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">You're Offline</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
            It seems you lost your internet connection. Please check your network and try again to access tasks.
        </p>

        <button 
            onClick={onRetry}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
        </button>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-medium">
          TASK COMPLETE & EARN
      </p>
    </div>
  );
};

export default OfflineScreen;