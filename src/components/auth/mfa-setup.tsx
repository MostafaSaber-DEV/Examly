'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import QRCode from 'qrcode';

interface MFASetupProps {
  onComplete: () => void;
}

export function MFASetup({ onComplete }: MFASetupProps) {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>(
    'generate'
  );
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const generateMFASecret = async () => {
      try {
        setLoading(true);

        // Generate TOTP secret
        const response = await fetch('/api/auth/mfa/generate', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to generate MFA secret');
        }

        const data = await response.json();
        setSecret(data.secret);

        // Generate QR code
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const otpauthUrl = `otpauth://totp/ExamsPlatform:${user.email}?secret=${data.secret}&issuer=ExamsPlatform`;
          const qrUrl = await QRCode.toDataURL(otpauthUrl);
          setQrCodeUrl(qrUrl);
        }
      } catch {
        setError('Failed to generate MFA setup. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (step === 'generate') {
      generateMFASecret();
    }
  }, [step, supabase]);

  const verifyMFACode = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret,
          token: verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes);
      setStep('backup');
    } catch {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeMFASetup = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/mfa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret,
          backupCodes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enable MFA');
      }

      onComplete();
    } catch {
      setError('Failed to complete MFA setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'generate') {
    return (
      <div className='max-w-md mx-auto'>
        <h2 className='text-2xl font-bold mb-6'>
          Set Up Two-Factor Authentication
        </h2>

        {loading ? (
          <div className='text-center'>Generating MFA secret...</div>
        ) : (
          <>
            <div className='mb-6'>
              <p className='text-sm text-gray-600 mb-4'>
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
              {qrCodeUrl && (
                <div className='flex justify-center mb-4'>
                  <Image
                    src={qrCodeUrl}
                    alt='QR Code for Multi-Factor Authentication Setup'
                    width={256}
                    height={256}
                    unoptimized
                    className='border rounded'
                  />
                </div>
              )}
              <div className='bg-gray-100 p-3 rounded text-center'>
                <p className='text-xs text-gray-600 mb-1'>Manual entry key:</p>
                <code className='text-sm font-mono'>{secret}</code>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} className='w-full'>
              I&apos;ve Added the Account
            </Button>
          </>
        )}

        {error && <div className='mt-4 text-red-600 text-sm'>{error}</div>}
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className='max-w-md mx-auto'>
        <h2 className='text-2xl font-bold mb-6'>Verify Your Setup</h2>

        <div className='mb-6'>
          <p className='text-sm text-gray-600 mb-4'>
            Enter the 6-digit code from your authenticator app to verify the
            setup.
          </p>

          <Input
            type='text'
            placeholder='000000'
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            className='text-center text-2xl tracking-widest'
            maxLength={6}
          />
        </div>

        <div className='flex gap-3'>
          <Button
            variant='secondary'
            onClick={() => setStep('generate')}
            className='flex-1'
          >
            Back
          </Button>
          <Button
            onClick={verifyMFACode}
            disabled={verificationCode.length !== 6 || loading}
            className='flex-1'
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>

        {error && <div className='mt-4 text-red-600 text-sm'>{error}</div>}
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className='max-w-md mx-auto'>
        <h2 className='text-2xl font-bold mb-6'>Save Your Backup Codes</h2>

        <div className='mb-6'>
          <p className='text-sm text-gray-600 mb-4'>
            Save these backup codes in a secure location. You can use them to
            access your account if you lose your authenticator device.
          </p>

          <div className='bg-gray-100 p-4 rounded'>
            {backupCodes.map((code, index) => (
              <div key={index} className='font-mono text-sm mb-1'>
                {code}
              </div>
            ))}
          </div>

          <p className='text-xs text-red-600 mt-2'>
            ⚠️ Each backup code can only be used once.
          </p>
        </div>

        <Button
          onClick={completeMFASetup}
          disabled={loading}
          className='w-full'
        >
          {loading ? 'Enabling MFA...' : 'Complete Setup'}
        </Button>

        {error && <div className='mt-4 text-red-600 text-sm'>{error}</div>}
      </div>
    );
  }

  return null;
}
