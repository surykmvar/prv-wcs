import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/useCredits';
import { Helmet } from 'react-helmet-async';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [pointsAdded, setPointsAdded] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { refreshCredits } = useCredits();

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setVerificationStatus('error');
      setErrorMessage('No session ID provided');
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data.success) {
        setVerificationStatus('success');
        setPointsAdded(data.pointsAdded || 0);
        // Refresh credits in the background
        setTimeout(() => refreshCredits(), 1000);
      } else {
        setVerificationStatus('error');
        setErrorMessage(data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setVerificationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment verification failed');
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment Success - Woices</title>
        <meta name="description" content="Your payment has been processed successfully. Welcome to Woices premium features!" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {verificationStatus === 'loading' && (
                <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
              )}
              {verificationStatus === 'success' && (
                <CheckCircle className="h-16 w-16 text-green-500" />
              )}
              {verificationStatus === 'error' && (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {verificationStatus === 'loading' && 'Processing Payment...'}
              {verificationStatus === 'success' && 'Payment Successful!'}
              {verificationStatus === 'error' && 'Payment Issue'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {verificationStatus === 'loading' && (
              <p className="text-muted-foreground">
                We're verifying your payment. This may take a moment...
              </p>
            )}
            
            {verificationStatus === 'success' && (
              <>
                <p className="text-muted-foreground">
                  Thank you for your purchase! Your credits have been added to your account.
                </p>
                {pointsAdded > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      +{pointsAdded} Credits Added
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      You can now access premium features on Woices
                    </p>
                  </div>
                )}
              </>
            )}
            
            {verificationStatus === 'error' && (
              <>
                <p className="text-muted-foreground">
                  There was an issue processing your payment verification.
                </p>
                {errorMessage && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  If you believe this is an error, please contact support with your session ID: {sessionId}
                </p>
              </>
            )}
            
            <div className="pt-4">
              <Link to="/">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Woices
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}