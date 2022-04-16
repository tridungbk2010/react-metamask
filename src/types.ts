export type NetworkName = 'mainnet' | 'ropsten' | 'rinkeby';

export type Network = {
  hex: string;
  decimal: number;
  name: string;
};

export const networkMapper: Record<number, NetworkName> = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
};

export const NETWORKS: Record<NetworkName, Network> = {
  mainnet: {
    hex: '0x1',
    decimal: 1,
    name: 'Ethereum Main Network (Mainnet)',
  },
  ropsten: {
    hex: '0x3',
    decimal: 3,
    name: 'Ropsten Test Network',
  },
  rinkeby: {
    hex: '0x4',
    decimal: 4,
    name: 'Rinkeby Test Network',
  },
};
