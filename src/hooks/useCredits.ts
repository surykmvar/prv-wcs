import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreditsInfo {
  balance: number;
  totalPurchased: number;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  region: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

export function useCredits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creditsInfo, setCreditsInfo] = useState<CreditsInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCreditsInfo();
      fetchTransactions();
    }
  }, [user]);

  const fetchCreditsInfo = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get or create user subscription record
      let { data: subscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Create subscription record if it doesn't exist
      if (!subscription) {
        const { data: newSubscription, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            credits_balance: 0,
            total_credits_purchased: 0,
            is_premium: false
          })
          .select()
          .single();

        if (insertError) throw insertError;
        subscription = newSubscription;
      }

      setCreditsInfo({
        balance: subscription.credits_balance || 0,
        totalPurchased: subscription.total_credits_purchased || 0,
        isPremium: subscription.is_premium || false,
        premiumExpiresAt: subscription.premium_expires_at,
        region: subscription.region
      });
    } catch (err) {
      console.error('Failed to fetch credits info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credits_ledger')
        .select('id, amount, transaction_type, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const useCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!user || !creditsInfo) return false;

    try {
      const { data, error } = await supabase.rpc('update_user_credits', {
        user_uuid: user.id,
        credit_amount: -amount,
        transaction_type: 'usage',
        description
      });

      if (error) throw error;

      if (data) {
        await fetchCreditsInfo();
        await fetchTransactions();
        toast({
          title: 'Credits Used',
          description: `Used ${amount} credits for ${description}`,
        });
        return true;
      } else {
        toast({
          title: 'Insufficient Credits',
          description: 'You don\'t have enough credits for this action.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      console.error('Failed to use credits:', err);
      toast({
        title: 'Error',
        description: 'Failed to use credits. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const hasEnoughCredits = (required: number): boolean => {
    return creditsInfo ? creditsInfo.balance >= required : false;
  };

  const refreshCredits = () => {
    if (user) {
      fetchCreditsInfo();
      fetchTransactions();
    }
  };

  return {
    creditsInfo,
    transactions,
    loading,
    error,
    useCredits,
    hasEnoughCredits,
    refreshCredits
  };
}