import { supabase } from './supabaseClient';
import { Offer } from '../types';

// Fallback data in case the database is not set up yet
const MOCK_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Download TikTok',
    description: 'Install and open the app to earn rewards.',
    link: 'https://tiktok.com',
    icon_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png',
    steps: ['Click Start Task', 'Install the App', 'Open for 30 seconds'],
    terms: ['New users only', 'Must enable tracking'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Play Candy Crush',
    description: 'Reach level 10 to claim your points.',
    link: 'https://king.com',
    icon_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Candy_Crush_Saga_logo.svg/1200px-Candy_Crush_Saga_logo.svg.png',
    steps: ['Install game', 'Play to level 10', 'Screenshot profile'],
    terms: [],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Take Survey',
    description: 'Complete a 5 minute survey about shopping habits.',
    link: 'https://google.com',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Google_Forms_2020_Logo.svg/1200px-Google_Forms_2020_Logo.svg.png',
    steps: ['Complete all questions', 'Submit valid email'],
    terms: ['One per household'],
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const fetchOffers = async (): Promise<Offer[]> => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase Error (fetchOffers):', error.message);
      console.info('Serving mock offers due to database error.');
      return MOCK_OFFERS;
    }

    return data || [];
  } catch (err: any) {
    console.error('Unexpected error in fetchOffers:', err.message || err);
    return MOCK_OFFERS;
  }
};

export const fetchUserTotalClicks = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('offer_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      // If table doesn't exist or RLS fails, just return 0
      console.warn('Supabase Error (fetchUserTotalClicks):', error.message);
      return 0;
    }

    return count || 0;
  } catch (err: any) {
    console.error('Unexpected error in fetchUserTotalClicks:', err.message || err);
    return 0;
  }
};

export const trackOfferClick = async (offerId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('offer_clicks')
      .insert([
        {
          offer_id: offerId,
          user_id: userId,
          clicked_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase Error (trackOfferClick):', error.message);
      // We don't throw here to avoid disrupting the user experience
    }
  } catch (err: any) {
    console.error('Unexpected error in trackOfferClick:', err.message || err);
  }
};