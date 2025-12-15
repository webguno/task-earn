import { supabase } from './supabaseClient';
import { Offer, UserStat, OfferClick } from '../types';

export const createOffer = async (offer: Omit<Offer, 'id' | 'created_at'>): Promise<void> => {
  const { error } = await supabase
    .from('offers')
    .insert([offer]);

  if (error) {
    console.error('Error creating offer:', error.message);
    throw error;
  }
};

export const updateOffer = async (id: string, updates: Partial<Offer>): Promise<void> => {
  const { error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating offer:', error.message);
    throw error;
  }
};

export const deleteOffer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting offer:', error.message);
    throw error;
  }
};

export const fetchAllUsersStats = async (): Promise<UserStat[]> => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("View 'user_stats' missing or error:", error.message);
      // Fallback: Just get profiles
      const { data: profiles, error: pError } = await supabase
          .from('profiles')
          .select('*');
      
      if (pError) {
        console.error('Error fetching profiles fallback:', pError.message);
        return [];
      }
      // Return profiles with 0 clicks as default
      return profiles ? profiles.map((p: any) => ({ ...p, total_clicks: 0 })) : [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error in fetchAllUsersStats:", err);
    return [];
  }
};

export const fetchUserProfile = async (userId: string): Promise<{ role: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
       // Silent fail for profile fetch, default to user
       return { role: 'user' };
    }
    return data;
  } catch (err) {
    return { role: 'user' };
  }
};

export const fetchRecentClicks = async (): Promise<OfferClick[]> => {
  try {
    // Note: For this to work, you must have an RLS policy that allows admins to view all clicks.
    // CHECK db_setup.sql for the policy: "Admins can see all clicks"
    const { data, error } = await supabase
      .from('offer_clicks')
      .select('*')
      .order('clicked_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching recent clicks:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Unexpected error in fetchRecentClicks:", err);
    return [];
  }
};