import React, {
  ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { NetworkName, SignatureProps } from './types';
import { ethers } from 'ethers';
import type { Signer } from 'ethers';
import { networkMapper } from './types';

declare global {
  interface Window {
    ethereum: any;
  }
}

export enum ConnectionEnum {
  NotConnected,
  Connected,
}

type ContextType = {
  connect?: () => void;
  disabled?: boolean;
  connection: ConnectionEnum;
  account: string;
  balance?: string;
  networkName?: NetworkName;
  provider?: any;
  signer?: Signer;
  getContract?: (address: string, abi: Array<any>) => any;
  connectAndGetSignature?: (
    personalSignText: string,
    callback: (params: SignatureProps | null, error?: any) => void
  ) => void;
};

const Context = createContext<ContextType>({
  connection: ConnectionEnum.NotConnected,
  account: '',
});

export const MetamaskProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<ConnectionEnum>(
    ConnectionEnum.NotConnected
  );
  const [isDisabled, setDisabled] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState('');
  const [networkName, setNetworkName] = useState<NetworkName>();

  const onboarding = useRef<MetaMaskOnboarding>();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setConnection(ConnectionEnum.Connected);
        setDisabled(true);
        onboarding.current?.stopOnboarding();
      } else {
        setConnection(ConnectionEnum.NotConnected);
        setDisabled(false);
      }
    }
  }, [accounts]);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled() && !!accounts.length) {
      window.ethereum
        .request({ method: 'eth_getBalance', params: [accounts[0], 'latest'] })
        .then((balance: string) => {
          setBalance(balance);
        });
    }
  }, [accounts]);

  useEffect(() => {
    function handleNewAccounts(newAccounts: string[]) {
      setAccounts(newAccounts);
    }
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (window.innerWidth <= 768) {
        window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then(handleNewAccounts);
      }
      window.ethereum.on('accountsChanged', handleNewAccounts);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleNewAccounts);
      };
    }
  }, []);

  useEffect(() => {
    function handleChain() {
      window.location.reload();
    }
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum.on('chainChanged', handleChain);
      return () => {
        window.ethereum.removeListener('chainChanged', handleChain);
      };
    }
  }, []);

  const connectCb = useCallback(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((newAccounts: string[]) => setAccounts(newAccounts));
    } else {
      onboarding.current?.startOnboarding();
    }
  }, []);

  const connectAndGetSignature = useCallback(
    (
      personalSignText: string,
      callback: (params: SignatureProps | null, error?: any) => void
    ) => {
      if (MetaMaskOnboarding.isMetaMaskInstalled()) {
        window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((newAccounts: string[]) => {
            const msg = `0x${Buffer.from(personalSignText, 'utf8').toString(
              'hex'
            )}`;
            window.ethereum
              .request({
                method: 'personal_sign',
                params: [newAccounts?.[0], msg],
              })
              .then((res: string) => {
                setAccounts(newAccounts);
                callback?.({ signature: res, account: newAccounts?.[0] });
              })
              .catch((err: any) => {
                callback?.(null, err);
              });
          });
      } else {
        onboarding.current?.startOnboarding();
      }
    },
    []
  );

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      signer
        .getChainId()
        .then((chainId: number) => {
          setNetworkName(networkMapper[chainId]);
        })
        .catch((e: any) => {
          console.log(e?.message);
        });
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
    }
  }, [accounts]);

  // function getContract(contractAddress: string, abi: Array<any>) {
  //   if (
  //     !contractRef.current &&
  //     MetaMaskOnboarding.isMetaMaskInstalled() &&
  //     !!providerRef.current
  //   ) {
  //     const signer = providerRef.current?.getSigner();
  //     contractRef.current = new ethers.Contract(contractAddress, abi, signer);
  //   }
  //   return contractRef.current;
  // }

  return (
    <Context.Provider
      value={{
        connect: connectCb,
        disabled: isDisabled,
        connection,
        account: accounts?.[0] || '',
        balance,
        networkName,
        connectAndGetSignature,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useMetamask = () => useContext(Context);
