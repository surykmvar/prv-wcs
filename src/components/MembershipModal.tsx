import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Zap, Star, Crown } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useRegionDetection } from '@/hooks/useRegionDetection';
import { useCreditPackages } from '@/hooks/useCreditPackages';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [customPoints, setCustomPoints] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  if (!user) return null;

  const currentPoints = creditsInfo?.balance || 0;
  // Use total purchased credits or default to 30 for new users
  const totalCredits = creditsInfo?.totalPurchased || 30;
  const progressPercentage = totalCredits > 0 ? (currentPoints / totalCredits) * 100 : 0;

  const handlePurchase = async (packageId?: string) => {
    if (!regionInfo || regionError) {
      toast({
        title: 'Region Error',
        description: regionError || 'Unable to determine your region. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    const points = getPointsToUse();
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
      const selectedPkg = packages.find(p => p.id === packageId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          points,
          packageId: packageId || null,
          region: regionInfo.region,
          currency: regionInfo.currency,
          pricePerPoint: regionInfo.pricePerPoint,
          packagePrice: selectedPkg ? selectedPkg.price_cents : null
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

  const getPointsToUse = () => {
    if (isCustom) {
      return parseInt(customPoints) || 0;
    }
    const selectedPkg = packages.find(p => p.id === selectedPackage);
    return selectedPkg ? selectedPkg.points : 0;
  };

  const currentPrice = calculatePrice(getPointsToUse());

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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">Woices Credits</DialogTitle>
        </DialogHeader>
        
        {/* Current Credits Display */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold">Credits</h3>
              <p className="text-3xl font-bold text-primary">{currentPoints.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Region: {regionInfo?.region}</p>
              <p className="text-sm text-muted-foreground">Rate: {getCurrencySymbol()}{regionInfo?.pricePerPoint}/credit</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Credits remaining</span>
              <span>{currentPoints} of {totalCredits.toLocaleString()}</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Premium voice experiences
            </div>
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Advanced audio features
            </div>
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Exclusive content access
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Credits Package</h3>
            <div className={`grid gap-4 ${
              packages.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
              packages.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
              packages.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto'
            }`}>
              {packages.map((pkg) => {
                const hasSeasonalOffer = pkg.seasonal_offer_percentage && 
                  pkg.seasonal_offer_expires_at && 
                  new Date(pkg.seasonal_offer_expires_at) > new Date();
                
                const originalPrice = pkg.price_cents / 100;
                const discountedPrice = hasSeasonalOffer 
                  ? originalPrice * (1 - pkg.seasonal_offer_percentage! / 100)
                  : originalPrice;

                return (
                  <div
                    key={pkg.id}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedPackage === pkg.id && !isCustom
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border'
                    }`}
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setIsCustom(false);
                    }}
                  >
                    {pkg.is_popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 whitespace-nowrap shadow-md z-10">
                        <Star className="h-3 w-3 mr-1 flex-shrink-0" />
                        Most Popular
                      </Badge>
                    )}

                    {hasSeasonalOffer && (
                      <Badge className="absolute -top-3 right-2 bg-red-500 text-white text-xs px-2 py-1">
                        -{pkg.seasonal_offer_percentage}%
                      </Badge>
                    )}
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{pkg.points}</div>
                      <div className="text-sm text-muted-foreground mb-3">Credits</div>
                      <div className="text-lg font-semibold text-primary">
                        {hasSeasonalOffer && (
                          <span className="text-sm text-muted-foreground line-through mr-2">
                            {getCurrencySymbol()}{originalPrice.toFixed(2)}
                          </span>
                        )}
                        {getCurrencySymbol()}{discountedPrice.toFixed(2)}
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-center text-xs">
                          <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                          {pkg.points} premium features
                        </div>
                        {pkg.points >= 200 && (
                          <div className="flex items-center justify-center text-xs">
                            <Crown className="h-3 w-3 mr-1 text-purple-500" />
                            Bonus content
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="radio"
                id="custom"
                checked={isCustom}
                onChange={() => setIsCustom(true)}
                className="w-4 h-4"
              />
              <Label htmlFor="custom" className="text-sm font-medium">
                Custom Amount
              </Label>
            </div>
            
            {isCustom && (
              <div className="space-y-2">
                <Label htmlFor="customPoints">Enter Credits Amount</Label>
                <Input
                  id="customPoints"
                  type="number"
                  placeholder="Enter credits (minimum 10)"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  min="10"
                  max="10000"
                />
                {customPoints && parseInt(customPoints) >= 10 && (
                  <p className="text-sm text-muted-foreground">
                    Total: {getCurrencySymbol()}{calculatePrice(parseInt(customPoints))}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Purchase Button */}
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {getPointsToUse()} Credits
                </span>
                <span className="text-lg font-bold">
                  {getCurrencySymbol()}{currentPrice}
                </span>
              </div>
              
              {regionInfo?.region === 'India' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Special pricing for India
                </p>
              )}
            </div>
            
            <Button 
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => handlePurchase(isCustom ? undefined : selectedPackage)}
              disabled={purchasing || getPointsToUse() < 10}
            >
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Purchase ${getPointsToUse()} Credits`
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe • Cancel anytime
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
