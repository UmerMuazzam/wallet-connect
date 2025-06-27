import { Web3Modal } from '@web3modal/react';
import { EthereumClient, modalConnectors } from '@web3modal/ethereum';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const projectId = '9347ff578aef584177e3f430201a9c9d'; // Replace with your WalletConnect project ID

// 1. Set up chains and providers
const chains = [mainnet];
const { provider } = configureChains(chains, [publicProvider()]);

// 2. Create wagmi client
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'My App', chains, projectId }),
  provider,
});

// 3. Create Ethereum client for Web3Modal
export const ethereumClient = new EthereumClient(wagmiClient, chains);

// 4. Export Web3Modal wrapper
export const Web3ModalWrapper = () => (
  <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
);
