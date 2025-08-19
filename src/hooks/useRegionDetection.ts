import { useState, useEffect } from 'react';
import { getBrowserCountryCode } from '@/utils/locale';
import { supabase } from '@/integrations/supabase/client';

interface RegionInfo {
  region: string;
  currency: string;
  pricePerPoint: number;
  isVpnDetected: boolean;
}

interface RegionalPricing {
  region: string;
  currency: string;
  price_per_point: number;
}

export function useRegionDetection() {
  const [regionInfo, setRegionInfo] = useState<RegionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectRegion();
  }, []);

  const detectRegion = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get browser country code
      const countryCode = getBrowserCountryCode();
      
      // Detect VPN by checking multiple IP services
      const isVpnDetected = await detectVPN();
      
      if (isVpnDetected) {
        setError('VPN detected. Please disable your VPN to access regional pricing.');
        setLoading(false);
        return;
      }

      // Map country code to region
      const region = mapCountryToRegion(countryCode);
      
      // Fetch regional pricing from database
      const { data: pricingData, error: pricingError } = await supabase
        .from('regional_pricing')
        .select('*')
        .eq('region', region)
        .single();

      if (pricingError) {
        // Fallback to Europe pricing if region not found
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('regional_pricing')
          .select('*')
          .eq('region', 'Europe')
          .single();

        if (fallbackError) {
          throw new Error('Unable to fetch pricing information');
        }

        setRegionInfo({
          region: 'Europe',
          currency: fallbackData.currency,
          pricePerPoint: Number(fallbackData.price_per_point),
          isVpnDetected: false
        });
      } else {
        setRegionInfo({
          region: pricingData.region,
          currency: pricingData.currency,
          pricePerPoint: Number(pricingData.price_per_point),
          isVpnDetected: false
        });
      }
    } catch (err) {
      console.error('Region detection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect region');
    } finally {
      setLoading(false);
    }
  };

  const mapCountryToRegion = (countryCode: string | null): string => {
    if (!countryCode) return 'Europe';
    
    // India region
    if (countryCode === 'IN') return 'India';
    
    // European countries
    const europeanCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'CH'
    ];
    
    if (europeanCountries.includes(countryCode)) return 'Europe';
    
    // Default to Europe for other countries
    return 'Europe';
  };

  const detectVPN = async (): Promise<boolean> => {
    try {
      // Multiple IP check services to detect VPN
      const checks = await Promise.allSettled([
        fetch('https://ipapi.co/json/').then(r => r.json()),
        fetch('https://ip-api.com/json/').then(r => r.json())
      ]);

      let vpnIndicators = 0;

      // Check results from IP services
      checks.forEach(result => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          // Look for VPN indicators
          if (data.org?.toLowerCase().includes('vpn') ||
              data.org?.toLowerCase().includes('proxy') ||
              data.isp?.toLowerCase().includes('vpn') ||
              data.isp?.toLowerCase().includes('proxy') ||
              data.hosting === true ||
              data.proxy === true) {
            vpnIndicators++;
          }
        }
      });

      // If multiple services indicate VPN, consider it detected
      return vpnIndicators >= 1;
    } catch (error) {
      console.warn('VPN detection failed:', error);
      // If VPN detection fails, allow access
      return false;
    }
  };

  const calculatePrice = (points: number): number => {
    if (!regionInfo) return 0;
    return Math.round(points * regionInfo.pricePerPoint * 100) / 100;
  };

  const calculatePoints = (amount: number): number => {
    if (!regionInfo) return 0;
    return Math.floor(amount / regionInfo.pricePerPoint);
  };

  const getCurrencySymbol = (): string => {
    if (!regionInfo) return '€';
    return regionInfo.currency === 'INR' ? '₹' : '€';
  };

  return {
    regionInfo,
    loading,
    error,
    calculatePrice,
    calculatePoints,
    getCurrencySymbol,
    retryDetection: detectRegion
  };
}