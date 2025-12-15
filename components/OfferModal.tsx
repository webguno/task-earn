import React, { useState, useRef, useEffect } from 'react';
import { Offer } from '../types';

interface OfferModalProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (offerId: string) => Promise<void>;
}

// Custom Video Player Component
const CustomVideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const controlTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      // Avoid division by zero
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
        setIsPlaying(false);
        setShowControls(true);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      resetControlsTimeout();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    // Clamp between 0 and 1
    const safePos = Math.max(0, Math.min(1, pos));
    videoRef.current.currentTime = safePos * videoRef.current.duration;
  };

  const toggleFullscreen = () => {
    // If we have a container, try to make that fullscreen first for custom controls
    // Otherwise fallback to video fullscreen
    const element = containerRef.current || videoRef.current;
    
    if (element) {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if ((element as any).requestFullscreen) {
            (element as any).requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
            (element as any).webkitRequestFullscreen(); // Safari
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
            // iOS native fallback
            (videoRef.current as any).webkitEnterFullscreen();
        }
    }
  };
  
  const resetControlsTimeout = () => {
      setShowControls(true);
      if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
      
      // Only auto-hide if playing
      if (isPlaying) {
          controlTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
      }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
        ref={containerRef}
        className="relative w-full h-full bg-black group overflow-hidden rounded-xl select-none"
        onMouseMove={resetControlsTimeout}
        onClick={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
    >
        <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-contain"
            playsInline
            controls={false} // Hide native controls (no 3 dots, no default UI)
            controlsList="nodownload" // Additional hint to browser
            onContextMenu={(e) => e.preventDefault()} // Disable right-click menu
            onClick={handlePlayPause}
        />
        
        {/* Play/Pause Overlay Icon (shows when paused or initially) */}
        {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-full shadow-lg border border-white/20">
                    <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
            </div>
        )}

        {/* Custom Control Bar */}
        <div 
            className={`
                absolute bottom-0 left-0 right-0 
                bg-gradient-to-t from-black/90 via-black/60 to-transparent 
                px-4 pb-3 pt-8 
                transition-all duration-300 ease-out
                flex flex-col gap-3
                ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
        >
            
            {/* Progress Bar Container */}
            <div 
                className="group/progress relative w-full h-4 flex items-center cursor-pointer"
                onClick={handleSeek}
            >
                {/* Track Background */}
                <div ref={progressBarRef} className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                   {/* Loaded Buffer (optional placeholder) */}
                </div>

                {/* Red Progress Fill */}
                <div 
                    className="absolute left-0 h-1 bg-red-600 rounded-full pointer-events-none transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
                
                {/* Scrubber Knob (Red) */}
                <div 
                    className="absolute w-3.5 h-3.5 bg-red-600 rounded-full shadow-md border border-white/20 transition-transform duration-100 ease-out scale-0 group-hover/progress:scale-100"
                    style={{ left: `${progress}%`, transform: `translateX(-50%) ${showControls ? 'scale(1)' : 'scale(0)'}` }}
                ></div>
            </div>

            {/* Buttons & Time Row */}
            <div className="flex items-center justify-between text-white -mt-1">
                <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} 
                        className="hover:text-red-500 transition-colors focus:outline-none"
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>
                    
                    {/* Time Display */}
                    <span className="text-xs font-medium tracking-wide opacity-90 font-mono">
                        {formatTime(currentTime)} <span className="text-white/50">/</span> {formatTime(duration)}
                    </span>
                </div>
                
                {/* Fullscreen Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} 
                    className="hover:text-red-500 transition-colors focus:outline-none"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                </button>
            </div>
        </div>
    </div>
  );
};

const OfferModal: React.FC<OfferModalProps> = ({ offer, isOpen, onClose, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!offer) return null;

  const handleComplete = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!offer.link) {
      e.preventDefault();
      alert("This offer does not have a valid link.");
      return;
    }

    setIsSubmitting(true);
    onComplete(offer.id)
      .catch((err) => console.error("Failed to track offer click", err))
      .finally(() => {
        setIsSubmitting(false);
        onClose();
      });
  };

  // Helper to extract YouTube ID safely
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    // Check if it looks like a YouTube URL
    if (!url.includes('youtube') && !url.includes('youtu.be')) return null;
    
    try {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    } catch (e) {
        return null;
    }
  };

  const videoId = offer.video_link ? getYouTubeId(offer.video_link) : null;
  const isYouTube = !!videoId;
  
  const youtubeEmbedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1` 
    : null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>

      {/* Modal / Bottom Sheet Container */}
      <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none ${isOpen ? '' : ''}`}>
        
        {/* The Panel */}
        <div 
          className={`
            w-full bg-white shadow-2xl pointer-events-auto flex flex-col
            transform transition-transform duration-300 ease-out
            
            /* Mobile: Bottom Sheet */
            rounded-t-[2rem] max-h-[90%] 
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
            
            /* Desktop: Centered Modal */
            sm:rounded-2xl sm:max-w-md sm:max-h-[85vh] sm:m-4
            sm:${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95 opacity-0'}
          `}
        >
          
          {/* Mobile Drag Handle (Hidden on Desktop) */}
          <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing sm:hidden" onClick={onClose}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          {/* Desktop Close Button (Hidden on Mobile) */}
          <button 
            onClick={onClose}
            className="hidden sm:flex absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>

          {/* Header */}
          <div className="px-6 pb-4 pt-2 sm:pt-8 flex flex-col items-center border-b border-gray-100 flex-shrink-0">
              <img 
                  src={offer.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.title)}&background=random`} 
                  alt={offer.title} 
                  className="h-20 w-20 rounded-2xl shadow-md mb-3 object-cover bg-gray-50"
              />
              <h3 className="text-xl font-bold text-gray-900 text-center leading-tight">
                  {offer.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 text-center line-clamp-2">{offer.description}</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6">
              
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Instructions</h4>
                <div className="space-y-4">
                  {offer.steps && offer.steps.length > 0 ? (
                    offer.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No instructions provided.</p>
                  )}
                </div>
              </div>

              {offer.terms && offer.terms.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Requirements</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {offer.terms.map((term, index) => (
                      <li key={index} className="text-xs text-orange-800/80">{term}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guide Video Section (Supports YouTube or Direct MP4) */}
              {offer.video_link && (
                <div>
                   <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                     Video Guide
                   </h4>
                   <div className="relative w-full pb-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg border border-gray-100">
                      {isYouTube && youtubeEmbedUrl ? (
                         <iframe 
                           className="absolute top-0 left-0 w-full h-full"
                           src={youtubeEmbedUrl} 
                           title="Guide Video"
                           frameBorder="0" 
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                           allowFullScreen
                         ></iframe>
                      ) : (
                         <div className="absolute top-0 left-0 w-full h-full">
                           <CustomVideoPlayer src={offer.video_link!} />
                         </div>
                      )}
                   </div>
                   
                   {/* Fallback link only for YouTube, as raw video files don't need app switching */}
                   {isYouTube && (
                       <div className="flex justify-center mt-3">
                          <a 
                            href={offer.video_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                            Watch on YouTube App
                          </a>
                       </div>
                   )}
                </div>
              )}
              
              {/* Spacer for button area (mobile only safe area) */}
              <div className="h-4 sm:hidden"></div>
          </div>

          {/* Sticky Footer Button */}
          <div className="p-4 border-t border-gray-100 bg-white pb-6 sm:pb-4 safe-area-bottom rounded-b-[2rem] sm:rounded-b-2xl">
              <a
                href={offer.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleComplete}
                className={`w-full flex items-center justify-center rounded-xl px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all decoration-0 ${
                  isSubmitting || !offer.link
                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Start Task'}
              </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferModal;