import { useEffect, useRef, useState } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { ethers } from 'ethers';

export default function useSignature(
  signText: string,
  account: string,
  callback?: (signature: string | null, error?: any) => void
) {
  const [loading, setLoading] = useState(false);

  const savedCallback = useRef<any>(null);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled() && !!account) {
      const msg = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signText));
      setLoading(true);
      window.ethereum
        .request({
          method: 'eth_sign',
          params: [account, msg],
        })
        .then((res: string) => {
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
  }, [account]);

  return { loading };
}
