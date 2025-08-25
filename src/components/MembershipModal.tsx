import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Zap, Star, Crown, Settings, FileText, HeadphonesIcon, Sparkles, Users, Phone } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useRegionDetection } from '@/hooks/useRegionDetection';
import { useCreditPackages } from '@/hooks/useCreditPackages';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MembershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipModal({ open, onOpenChange }: MembershipModalProps) {
  const { user } = useAuth();
  const { creditsInfo, loading: creditsLoading } = useCredits();
  const { regionInfo, loading: regionLoading, error: regionError, calculatePrice, getCurrencySymbol } = useRegionDetection();
  const { packages, loading: packagesLoading } = useCreditPackages(regionInfo?.region);
  const { toast } = useToast();
  const [planType, setPlanType] = useState<'usage' | 'annual'>('usage');
  const [customPoints, setCustomPoints] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showLowCreditsAlert, setShowLowCreditsAlert] = useState(false);

  const currentPoints = creditsInfo?.balance || 0;
  const isLowCredits = currentPoints < 45;

  // Check if opened due to low credits warning
  useEffect(() => {
    if (open && isLowCredits) {
      setShowLowCreditsAlert(true);
    }
  }, [open, isLowCredits]);

  if (!user) return null;

  const handlePurchase = async (packageId?: string) => {
    if (!regionInfo || regionError) {
      toast({
        title: 'Region Error',
        description: regionError || 'Unable to determine your region. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    const points = customPoints || 0;
    if (points < 10) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum purchase is 10 credits.',
        variant: 'destructive'
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          points,
          packageId: packageId || null,
          region: regionInfo.region,
          currency: regionInfo.currency,
          pricePerPoint: regionInfo.pricePerPoint
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Unable to start checkout process. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (creditsLoading || regionLoading || packagesLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (regionError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Region Detection Error</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-muted-foreground mb-4">{regionError}</p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Credit Plans
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Credits Display */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{currentPoints} Credits</div>
            <p className="text-sm text-muted-foreground">
              Credits remaining
            </p>
            {isLowCredits && (
              <Alert className="mt-4 border-red-500 bg-red-50">
                <AlertDescription className="text-red-700">
                  ⚠️ Low credits! Get more credits to continue posting thoughts and voice replies.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Plan Selection Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button 
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                planType === 'usage' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setPlanType('usage')}
            >
              Usage-based
            </button>
            <button 
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                planType === 'annual' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setPlanType('annual')}
            >
              Annual
            </button>
          </div>

          {/* Credit Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Starter</h3>
                <p className="text-sm text-gray-600">Perfect for occasional users</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">$10</div>
                <div className="text-sm text-gray-600">100 credits</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Basic features
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Voice recording
                </div>
              </div>
              <Button 
                onClick={() => {
                  setCustomPoints(100);
                  handlePurchase();
                }}
                className="w-full"
                disabled={purchasing}
              >
                Get Started
              </Button>
            </div>

            {/* Creator+ Plan */}
            <div className="border-2 border-woices-violet rounded-lg p-6 space-y-4 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-woices-violet text-white px-3 py-1 rounded-full text-xs font-medium">
                  Popular
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Creator+</h3>
                <p className="text-sm text-gray-600">Advanced tools for content creators</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">$25</div>
                <div className="text-sm text-gray-600">300 credits</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  All Starter features
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-blue-500" />
                  Zapier integration
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Notion integration
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HeadphonesIcon className="h-4 w-4 text-purple-500" />
                  Voice bundling
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI summarization
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Priority support
                </div>
              </div>
              <Button 
                onClick={() => {
                  setCustomPoints(300);
                  handlePurchase();
                }}
                className="w-full bg-woices-violet hover:bg-woices-violet/90"
                disabled={purchasing}
              >
                Upgrade Now
              </Button>
            </div>

            {/* Business Plan */}
            <div className="border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Business</h3>
                <p className="text-sm text-gray-600">Complete solution for businesses</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">$50</div>
                <div className="text-sm text-gray-600">700 credits</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  All Creator+ features
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  Swift customer consultation
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-emerald-500" />
                  Advanced analytics
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-emerald-500" />
                  Custom integrations
                </div>
              </div>
              <Button 
                onClick={() => {
                  setCustomPoints(700);
                  handlePurchase();
                }}
                className="w-full"
                disabled={purchasing}
              >
                Contact Sales
              </Button>
            </div>
          </div>

          {/* Custom Amount Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-center mb-4">Custom Amount</h3>
            <div className="max-w-sm mx-auto space-y-4">
              <Input
                type="number"
                placeholder="Enter number of credits"
                value={customPoints || ''}
                onChange={(e) => setCustomPoints(e.target.value ? parseInt(e.target.value) : null)}
                min="1"
                max="10000"
                className="text-center"
              />
              {customPoints && customPoints > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Total: ${((customPoints * (regionInfo?.pricePerPoint || 1)) / 100).toFixed(2)} {regionInfo?.currency?.toUpperCase() || 'USD'}
                </div>
              )}
              <Button 
                onClick={() => handlePurchase()}
                className="w-full"
                disabled={purchasing || !customPoints || customPoints <= 0}
              >
                {purchasing ? 'Processing...' : 'Buy Custom Amount'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}