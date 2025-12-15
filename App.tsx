import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './services/supabaseClient';
import { User } from '@supabase/supabase-js';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import OfferCard from './components/OfferCard';
import OfferModal from './components/OfferModal';
import AdminDashboard from './components/AdminDashboard';
import OfflineScreen from './components/OfflineScreen';
import InstallPrompt from './components/InstallPrompt';
import { fetchOffers, trackOfferClick, fetchUserTotalClicks } from './services/offerService';
import { fetchUserProfile } from './services/adminService';
import { Offer } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Network State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // App State
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'admin'>('dashboard');

  // Dashboard State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // PWA Install Event Listener & iOS Detection
  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect Standalone (Installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    if (isStandalone) {
      setShowInstallPrompt(false);
    } else if (isIosDevice) {
      // Always show on iOS if not standalone (since beforeinstallprompt doesn't fire)
      setShowInstallPrompt(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      if (!isStandalone) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      // If no prompt (e.g. iOS or manual logic), we can't trigger native install.
      // The InstallPrompt component will handle showing instructions for iOS.
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  // Network Monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
         checkUserRole(session.user.id);
      } else {
         setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
         checkUserRole(session.user.id);
      } else {
         setLoading(false);
         setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
      try {
          if (!navigator.onLine) {
              setLoading(false);
              return;
          }
          const profile = await fetchUserProfile(userId);
          setIsAdmin(profile?.role === 'admin');
      } catch (err) {
          console.error("Error checking role", err);
      } finally {
          setLoading(false);
      }
  };

  const loadData = useCallback(async () => {
    if (!user || !navigator.onLine) return;
    setLoadingOffers(true);
    try {
      const [fetchedOffers, count] = await Promise.all([
        fetchOffers(),
        fetchUserTotalClicks(user.id)
      ]);
      setOffers(fetchedOffers);
      setClickCount(count);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingOffers(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && currentPage === 'dashboard' && isOnline) {
      loadData();
    }
  }, [user, currentPage, isOnline, loadData]);

  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOffer(null);
  };

  const handleCompleteOffer = async (offerId: string) => {
    if (!user) return;
    try {
      await trackOfferClick(offerId, user.id);
      setClickCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to track offer', error);
    }
  };

  // 1. Show Offline Screen immediately if network is lost
  if (!isOnline) {
      return <OfflineScreen onRetry={() => window.location.reload()} />;
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 3. Auth State
  if (!session) {
    // Render AuthForm without layout constraints so it can control full screen on mobile
    return <AuthForm />;
  }

  // 4. Main App UI
  return (
    <div className="min-h-screen bg-[#eef2f6] pb-20 relative">
      <Navbar 
        userEmail={user?.email} 
        clickCount={clickCount} 
        isAdmin={isAdmin}
        currentPage={currentPage}
        onAdminClick={() => setCurrentPage('admin')}
        onDashboardClick={() => setCurrentPage('dashboard')}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentPage === 'admin' && isAdmin ? (
            <AdminDashboard />
        ) : (
          <div>
              {/* Stats Card */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-indigo-200">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">Total Completed</p>
                        <h2 className="text-4xl font-bold mt-1">{clickCount}</h2>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div className="mt-6 flex items-center gap-2">
                     <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Level 1 User</span>
                     <span className="text-sm text-indigo-100">Keep up the good work!</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-gray-900">Available Tasks</h2>
                 <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm">{offers.length} Found</span>
              </div>

              {loadingOffers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white rounded-2xl p-4 shadow-sm h-28 animate-pulse flex items-center gap-4">
                           <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
                           <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                           </div>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.length === 0 ? (
                    <div className="col-span-full text-center py-16 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
                        <p className="text-base text-gray-500 mt-1">Check back later for new offers.</p>
                    </div>
                    ) : (
                        offers.map((offer) => (
                        <OfferCard 
                            key={offer.id} 
                            offer={offer} 
                            onClick={handleOfferClick} 
                        />
                        ))
                    )}
                </div>
              )}
          </div>
        )}
      </div>

      <OfferModal 
          offer={selectedOffer}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onComplete={handleCompleteOffer}
      />
      
      {/* Install App Prompt */}
      {showInstallPrompt && (
          <InstallPrompt 
            onInstall={handleInstallApp}
            onDismiss={() => setShowInstallPrompt(false)}
            isIOS={isIOS}
          />
      )}
    </div>
  );
};

export default App;