import { alephzeroTestnet, SubstrateDeployment } from '@scio-labs/use-inkathon';
const CONTRACT_ADDRESS = '5CJ9acajsPWrzWhMh2heU3eHaHSKpCkrp7J3TZDbSNVaZY1W';

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
