import { ethers } from 'ethers';
import type { Contract } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding';

let initialContract: Contract | null = null;

export function getContract(
  contractAddress: string,
  contractABI: Array<any>
): Contract | null {
  if (!initialContract && MetaMaskOnboarding.isMetaMaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    initialContract = new ethers.Contract(contractAddress, contractABI, signer);
  }

  return initialContract;
}
