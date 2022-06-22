import { useEffect, useRef, useState } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';

export default function useSignature(
  personalSignText: string,
  account: string,
  callback?: (signature: string | null, error?: any) => void
) {
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState('');

  const savedCallback = useRef<any>(null);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled() && !!account) {
      const msg = `0x${Buffer.from(personalSignText, 'utf8').toString('hex')}`;
      setLoading(true);
      window.ethereum
        .request({
          method: 'personal_sign',
          params: [account, msg],
        })
        .then((res: string) => {
          setSignature(res);
          if (savedCallback.current) {
            savedCallback.current(res);
          }
        })
        .catch((err: any) => {
          savedCallback.current(null, err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [account, personalSignText]);

  return { loading, signature };
}
