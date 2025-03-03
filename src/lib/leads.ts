import { Lead } from '@/utils/types';
import { supabase } from './supabase';

export const getLeads = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*, customers(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading leads:', error);
  }
};

export const updateLeadById = async (leadId: string, lead: Partial<Lead>) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(lead)
      .eq('id', leadId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating lead:', error);
  }
};
