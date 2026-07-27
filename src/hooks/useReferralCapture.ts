import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook to capture referral codes from URL parameters and store them in localStorage.
 * This ensures referral codes persist across page navigations before signup.
 * 
 * Supported URL params: ?ref=CODE or ?referral=CODE
 */
export const useReferralCapture = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const refCode = searchParams.get('ref') || searchParams.get('referral');
    
    if (refCode) {
      // Store the referral code for use during signup
      localStorage.setItem('referralCode', refCode);
    }
  }, [searchParams]);
  
  // Return the current referral code if any
  const getReferralCode = () => {
    return localStorage.getItem('referralCode');
  };
  
  const clearReferralCode = () => {
    localStorage.removeItem('referralCode');
  };
  
  return {
    getReferralCode,
    clearReferralCode,
  };
};
