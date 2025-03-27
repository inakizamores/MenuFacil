'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, AlertTriangle, Mail } from 'lucide-react';
import { captureException } from '@/lib/sentry';
import Link from 'next/link';

type VerificationStatus = 'pending' | 'success' | 'error' | 'verifying';

/**
 * Email Verification Page
 * 
 * Handles two scenarios:
 * 1. User clicked the link in the verification email (with token in URL)
 * 2. User wants to request a new verification email
 */
export default function VerifyEmailPage() {
  const { user, sendVerificationEmail, refreshSession } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for verification token in URL
  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (token) {
        setStatus('verifying');
        try {
          // The verification happens automatically via Supabase
          // We just need to refresh the session to get the updated status
          await refreshSession();
          
          // If we get here, verification was successful
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } catch (error) {
          console.error('Email verification error:', error);
          captureException(error);
          setStatus('error');
          setMessage('There was a problem verifying your email. Please try again or request a new verification link.');
        }
      }
    };
    
    verifyToken();
  }, [searchParams, refreshSession, router]);
  
  // Handle sending a new verification email
  const handleSendVerificationEmail = async () => {
    if (!user) {
      setStatus('error');
      setMessage('You must be logged in to verify your email.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await sendVerificationEmail();
      
      if (result.success) {
        setStatus('success');
        setMessage(`Verification email sent to ${user.email}. Please check your inbox and spam folder.`);
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to send verification email. Please try again later.');
      }
    } catch (error) {
      console.error('Send verification email error:', error);
      captureException(error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Email Verification</CardTitle>
            <CardDescription>
              Verify your email address to access all features
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'pending' && (
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <p className="text-gray-600">
                  Your email address needs to be verified. Please check your inbox for a verification link or request a new one below.
                </p>
              </div>
            )}
            
            {status === 'verifying' && (
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p className="text-gray-600">{message}</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-center">
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <p className="text-gray-600">{message}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            {(status === 'pending' || status === 'error') && (
              <Button
                className="w-full flex items-center justify-center"
                onClick={handleSendVerificationEmail}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Verification Email
              </Button>
            )}
            
            <div className="text-center text-sm">
              <Link
                href="/dashboard"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Return to dashboard
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 