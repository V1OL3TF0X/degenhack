import { alephzeroTestnet, SubstrateDeployment } from '@scio-labs/use-inkathon';
const CONTRACT_ADDRESS = '5DaPX8kea6wthEc3b4jjNXVejABM3GRcURM6zSgB8XHArzfx';

export const CONTRACT_ID = 'prize manager';

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  return [
    {
      contractId: CONTRACT_ID,
      networkId: alephzeroTestnet.network,
      abi: await import(`../../../contracts/target/ink/prize_manager/prize_manager.json`),
      address: CONTRACT_ADDRESS,
    },
  ];
};
