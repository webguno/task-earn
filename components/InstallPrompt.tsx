import React, { useState } from 'react';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
  isIOS?: boolean;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss, isIOS = false }) => {
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleClick = () => {
    if (isIOS) {
        setShowIOSInstructions(!showIOSInstructions);
    } else {
        onInstall();
    }
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 animate-slide-in sm:left-auto sm:right-6 sm:w-96">
      {/* iOS Instructions Balloon */}
      {showIOSInstructions && (
          <div className="absolute bottom-full left-0 right-0 mb-4 bg-white text-gray-900 p-4 rounded-xl shadow-xl border border-gray-200 animate-fade-up">
              <div className="text-sm">
                  <p className="font-bold mb-2">Install for iOS:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-xs">
                      <li>Tap the <span className="font-bold">Share</span> icon <svg className="inline w-4 h-4 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg> below.</li>
                      <li>Scroll down and select <span className="font-bold">"Add to Home Screen"</span> <svg className="inline w-4 h-4 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>.</li>
                  </ol>
              </div>
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 rotate-45"></div>
          </div>
      )}

      <div className="bg-gray-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 ring-1 ring-white/20">
        <div className="flex items-center gap-3.5">
           {/* App Icon Container */}
           <div className="h-11 w-11 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
           </div>
           <div>
               <h3 className="font-bold text-sm leading-tight text-white">Install App</h3>
               <p className="text-[11px] text-indigo-200 mt-0.5 font-medium">Get the best experience</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={onDismiss}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <button 
                onClick={handleClick}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-white/10 hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap"
            >
                {isIOS ? 'How to?' : 'Download'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;