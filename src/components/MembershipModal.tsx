import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const { regionInfo, loading: regionLoading, error: regionError } = useRegionDetection();
  const { packages, loading: packagesLoading } = useCreditPackages(regionInfo?.region);
  const { toast } = useToast();
  const [planType, setPlanType] = useState<'annual' | 'usage'>('annual'); // Default to annual
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

  // Helper functions for pricing
  const formatPrice = (priceInCents: number, currency: string = regionInfo?.currency || 'EUR') => {
    const price = priceInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const calculatePlanPrice = (basePoints: number, basePrice: number) => {
    if (!regionInfo) return { points: basePoints, price: basePrice };
    
    // Usage-based: 1.2x multiplier
    const multiplier = planType === 'usage' ? 1.2 : 1.0;
    const adjustedPrice = Math.round(basePrice * multiplier);
    
    return {
      points: basePoints,
      price: adjustedPrice
    };
  };

  const handlePurchase = async (points: number, planDetails?: { name: string; features: string[] }) => {
    console.log('Starting purchase:', { points, planType, regionInfo, planDetails });
    
    if (!regionInfo || regionError) {
      toast({
        title: 'Region Error',
        description: regionError || 'Unable to determine your region. Please try again.',
        variant: 'destructive'
      });
      return;
    }

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
          planType,
          planDetails,
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
              <Alert className="mt-4 border-destructive bg-destructive/10">
                <AlertDescription className="text-destructive">
                  ⚠️ Low credits! Get more credits to continue posting thoughts and voice replies.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Plan Selection Tabs */}
          <Tabs value={planType} onValueChange={(value: 'annual' | 'usage') => setPlanType(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-12">
              <TabsTrigger value="annual" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                Annual Plans
                <Badge variant="secondary" className="ml-2 text-xs">Best Value</Badge>
              </TabsTrigger>
              <TabsTrigger value="usage" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                Usage-based
                <Badge variant="outline" className="ml-2 text-xs">Pay as you go</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="annual" className="space-y-6 mt-6">
              {/* Annual Credit Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <div className="border border-border rounded-xl p-6 space-y-4 bg-card hover:shadow-lg transition-all duration-300">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Starter</h3>
                    <p className="text-sm text-muted-foreground">Perfect for occasional users</p>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const plan = calculatePlanPrice(100, regionInfo ? Math.round(100 * regionInfo.pricePerPoint) : 1000);
                      return (
                        <>
                          <div className="text-3xl font-bold text-foreground">
                            {formatPrice(plan.price, regionInfo?.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">{plan.points} credits</div>
                        </>
                      );
                    })()}
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
                    onClick={() => handlePurchase(100, { 
                      name: 'Starter', 
                      features: ['Basic features', 'Voice recording'] 
                    })}
                    className="w-full"
                    disabled={purchasing}
                  >
                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Started'}
                  </Button>
                </div>

                {/* Creator+ Plan */}
                <div className="border-2 border-primary rounded-xl p-6 space-y-4 relative bg-card hover:shadow-xl transition-all duration-300 scale-105">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                      Popular
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Creator+</h3>
                    <p className="text-sm text-muted-foreground">Advanced tools for content creators</p>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const plan = calculatePlanPrice(300, regionInfo ? Math.round(300 * regionInfo.pricePerPoint) : 2500);
                      return (
                        <>
                          <div className="text-3xl font-bold text-foreground">
                            {formatPrice(plan.price, regionInfo?.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">{plan.points} credits</div>
                        </>
                      );
                    })()}
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
                    onClick={() => handlePurchase(300, { 
                      name: 'Creator+', 
                      features: ['All Starter features', 'Zapier integration', 'Notion integration', 'Voice bundling', 'AI summarization', 'Priority support'] 
                    })}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={purchasing}
                  >
                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade Now'}
                  </Button>
                </div>

                {/* Business Plan */}
                <div className="border border-border rounded-xl p-6 space-y-4 bg-card hover:shadow-lg transition-all duration-300">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Business</h3>
                    <p className="text-sm text-muted-foreground">Complete solution for businesses</p>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const plan = calculatePlanPrice(700, regionInfo ? Math.round(700 * regionInfo.pricePerPoint) : 5000);
                      return (
                        <>
                          <div className="text-3xl font-bold text-foreground">
                            {formatPrice(plan.price, regionInfo?.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">{plan.points} credits</div>
                        </>
                      );
                    })()}
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
                    onClick={() => handlePurchase(700, { 
                      name: 'Business', 
                      features: ['All Creator+ features', 'Swift customer consultation', 'Advanced analytics', 'Custom integrations'] 
                    })}
                    className="w-full"
                    disabled={purchasing}
                  >
                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Contact Sales'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6 mt-6">
              {/* Usage-based Credit Plans Grid */}
              <div className="bg-muted/30 p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground text-center">
                  Usage-based plans include a 20% premium for flexible, pay-as-you-go pricing
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <div className="border border-border rounded-xl p-6 space-y-4 bg-card hover:shadow-lg transition-all duration-300">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Starter</h3>
                    <p className="text-sm text-muted-foreground">Perfect for occasional users</p>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const plan = calculatePlanPrice(100, regionInfo ? Math.round(100 * regionInfo.pricePerPoint) : 1000);
                      return (
                        <>
                          <div className="text-3xl font-bold text-foreground">
                            {formatPrice(plan.price, regionInfo?.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">{plan.points} credits</div>
                        </>
                      );
                    })()}
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
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-orange-500" />
                      Instant billing
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(100, { 
                      name: 'Starter (Usage-based)', 
                      features: ['Basic features', 'Voice recording', 'Instant billing'] 
                    })}
                    className="w-full"
                    disabled={purchasing}
                  >
                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Started'}
                  </Button>
                </div>

                {/* Creator+ Plan */}
                <div className="border-2 border-primary rounded-xl p-6 space-y-4 relative bg-card hover:shadow-xl transition-all duration-300 scale-105">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                      Popular
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Creator+</h3>
                    <p className="text-sm text-muted-foreground">Advanced tools for content creators</p>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const plan = calculatePlanPrice(300, regionInfo ? Math.round(300 * regionInfo.pricePerPoint) : 2500);
                      return (
                        <>
                          <div className="text-3xl font-bold text-foreground">
                            {formatPrice(plan.price, regionInfo?.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">{plan.points} credits</div>
                        </>
                      );
                    })()}
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
                      <Zap className="h-4 w-4 text-orange-500" />
                      Instant billing
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(300, { 
                      name: 'Creator+ (Usage-based)', 
                      features: ['All Starter features', 'Zapier integration', 'Notion integration', 'Voice bundling', 'AI summarization', 'Instant billing'] 
                    })}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={purchasing}
                  >
                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade Now'}
                  </Button>
                </div>

                {/* Business Plan */}
                <div className="border border-border rounded-xl p-6 space-y-4 bg-card hover:shadow-lg transition-all duration-300">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Business</h3>
                    <p className="text-sm text-muted-foreground">Complete solution for businesses</p>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const plan = calculatePlanPrice(700, regionInfo ? Math.round(700 * regionInfo.pricePerPoint) : 5000);
                      return (
                        <>
                          <div className="text-3xl font-bold text-foreground">
                            {formatPrice(plan.price, regionInfo?.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">{plan.points} credits</div>
                        </>
                      );
                    })()}
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
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-orange-500" />
                      Instant billing
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(700, { 
                      name: 'Business (Usage-based)', 
                      features: ['All Creator+ features', 'Swift customer consultation', 'Advanced analytics', 'Custom integrations', 'Instant billing'] 
                    })}
                    className="w-full"
                    disabled={purchasing}
                  >
                    {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Contact Sales'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Custom Amount Section */}
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-medium text-center mb-4">Custom Amount</h3>
              <div className="max-w-sm mx-auto space-y-4">
                <Input
                  type="number"
                  placeholder="Enter number of credits"
                  value={customPoints || ''}
                  onChange={(e) => setCustomPoints(e.target.value ? parseInt(e.target.value) : null)}
                  min="10"
                  max="10000"
                  className="text-center"
                />
                {customPoints && customPoints > 0 && regionInfo && (
                  <div className="text-center text-sm text-muted-foreground">
                    Total: {formatPrice(Math.round(customPoints * regionInfo.pricePerPoint), regionInfo.currency)}
                  </div>
                )}
                <Button 
                  onClick={() => handlePurchase(customPoints || 0, { 
                    name: 'Custom Amount', 
                    features: ['Custom credit amount'] 
                  })}
                  className="w-full"
                  disabled={purchasing || !customPoints || customPoints < 10}
                >
                  {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy Custom Amount'}
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}