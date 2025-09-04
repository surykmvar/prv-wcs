import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface CreditPackage {
  id: string;
  name: string;
  points: number;
  price_cents: number;
  currency: string;
  region: string;
  is_popular: boolean;
  is_active: boolean;
  seasonal_offer_percentage: number | null;
  seasonal_offer_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useCreditPackages(region?: string) {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use edge function for unauthenticated users when region is specified
      if (!user && region) {
        const { data: publicPricingData, error: publicPricingError } = await supabase.functions.invoke('public-pricing', {
          body: { region }
        });

        if (publicPricingError) throw publicPricingError;

        setPackages(publicPricingData.creditPackages || []);
      } else if (user) {
        // Authenticated users can access database directly
        let query = supabase
          .from('credit_packages')
          .select('*')
          .eq('is_active', true)
          .order('points', { ascending: true });

        if (region) {
          query = query.eq('region', region);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setPackages(data || []);
      } else {
        // No region specified and no user - return empty array
        setPackages([]);
      }
    } catch (err) {
      console.error('Failed to fetch credit packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch packages');
      toast({
        title: 'Error',
        description: 'Failed to load credit packages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (packageData: Omit<CreditPackage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .insert(packageData)
        .select()
        .single();

      if (error) throw error;

      await fetchPackages(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Credit package created successfully'
      });

      return data;
    } catch (err) {
      console.error('Failed to create package:', err);
      toast({
        title: 'Error',
        description: 'Failed to create credit package',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updatePackage = async (id: string, updates: Partial<CreditPackage>) => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchPackages(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Credit package updated successfully'
      });

      return data;
    } catch (err) {
      console.error('Failed to update package:', err);
      toast({
        title: 'Error',
        description: 'Failed to update credit package',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credit_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPackages(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Credit package deleted successfully'
      });
    } catch (err) {
      console.error('Failed to delete package:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete credit package',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const applySeasonalOffer = async (id: string, percentage: number, expiresAt: string) => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .update({
          seasonal_offer_percentage: percentage,
          seasonal_offer_expires_at: expiresAt
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchPackages(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Seasonal offer applied successfully'
      });

      return data;
    } catch (err) {
      console.error('Failed to apply seasonal offer:', err);
      toast({
        title: 'Error',
        description: 'Failed to apply seasonal offer',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const removeSeasonalOffer = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .update({
          seasonal_offer_percentage: null,
          seasonal_offer_expires_at: null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchPackages(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Seasonal offer removed successfully'
      });

      return data;
    } catch (err) {
      console.error('Failed to remove seasonal offer:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove seasonal offer',
        variant: 'destructive'
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [region]);

  return {
    packages,
    loading,
    error,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    applySeasonalOffer,
    removeSeasonalOffer
  };
}