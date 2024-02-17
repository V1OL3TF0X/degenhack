import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import GameView from '../../containers/GameView/GameView';
import styles from './MainView.module.scss';
import Header from '../../components/Header/header';
import WalletConnectDialog from '../../components/WalletConnectDialog/walletConnectDialog';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  alephzero,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { encodeAddress } from '@polkadot/util-crypto'



function MainView() {
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const [_, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);



  const truncateHash = (hash: string | undefined, paddingLength = 6): string | undefined => {
    if (!hash?.length) return undefined
    if (hash.length <= paddingLength * 2 + 1) return hash
    return hash.replace(hash.substring(paddingLength, hash.length - paddingLength), '…')
  }

  const {
    activeAccount,
    activeChain,
    api,
    accounts
  } = useInkathon()

  useEffect(() => {
    if (activeAccount && activeAccount.address) {
      const publicKey = encodeAddress(activeAccount.address, activeChain?.ss58Prefix || 42);
      fetchAvatarUrl(publicKey);
    }
  }, [activeAccount, activeChain]);

  const fetchAvatarUrl = async (publicKey) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/publickey/${publicKey}`);
      const data = await response.json();
      if (data && data.avatarLink) {
        setAvatarUrl(data.avatarLink);
        console.log(data.avatarLink)
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Failed to fetch avatar:', error);
      setAvatarUrl(null);
    }
  };

  const [chainInfo, setChainInfo] = useState<{ [_: string]: any }>()

  // Fetch Chain Info
  const fetchChainInfo = async () => {
    if (!api) {
      setChainInfo(undefined)
      return
    }

    const chain = (await api.rpc.system.chain())?.toString() || ''
    const version = (await api.rpc.system.version())?.toString() || ''
    const properties = ((await api.rpc.system.properties())?.toHuman() as any) || {}
    const tokenSymbol = properties?.tokenSymbol?.[0] || 'UNIT'
    const tokenDecimals = properties?.tokenDecimals?.[0] || 12
    const chainInfo = {
      Chain: chain,
      Version: version,
      Token: `${tokenSymbol} (${tokenDecimals} Decimals)`,
    }
    setChainInfo(chainInfo)

  }
  useEffect(() => {
    fetchChainInfo()
    console.log(chainInfo)
    console.log(activeAccount)
  }, [api])



  const { reducibleBalanceFormatted } = useBalance(activeAccount?.address, true, {
    forceUnit: false,
    fixedDecimals: 2,
    removeTrailingZeros: true,
  })

  function disconnectWallet() {
    localStorage.removeItem('selectedWalletAddress');
    setSelectedAccount(null); // Clear the selected account
  }

  const handleLoginClick = () => {
    if (!selectedAccount) {
      setWalletDialogOpen(true);
    } else {
      disconnectWallet();
    }
  };



  return (
    <>
      <Header
        onLoginClick={handleLoginClick}
        walletAddress={activeAccount ?
          truncateHash(
            encodeAddress(activeAccount.address, activeChain?.ss58Prefix || 42),
            8,
          ) : ''}
        balance={reducibleBalanceFormatted}
        avatarUrl={avatarUrl}
        loadingBalance={!api}
      />
      <Box className={styles.mainViewContainer}>
        <GameView />
      </Box>
      <WalletConnectDialog
        open={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}

      />
    </>
  );
}

export default MainView;
