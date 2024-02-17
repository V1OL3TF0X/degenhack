import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import UserDashboard from '../../containers/UserDashboard/UserDashboard';
import GameView from '../../containers/GameView/GameView';
import styles from './MainView.module.scss';
import Header from '../../components/Header/header';
import WalletConnectDialog from '../../components/WalletConnectDialog/walletConnectDialog';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

function MainView() {
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);

  useEffect(() => {
    const savedAccount = localStorage.getItem('selectedWalletAddress');
    if (savedAccount) {
      setSelectedAccount({ address: savedAccount } as InjectedAccountWithMeta);
    }
  }, []);

  async function connectWallet() {
    const extensions = await web3Enable("Polki");
    if (!extensions.length) {
      console.error("No Extension Found");
      return;
    }

    const allAccounts = await web3Accounts();
    if (allAccounts.length) {
      setAccounts(allAccounts); // Store all fetched accounts
      const selected = allAccounts[0]; // Automatically select the first account for simplicity
      setSelectedAccount(selected); // Update state with selected account
      localStorage.setItem('selectedWalletAddress', selected.address); // Persist selected account address
      setWalletDialogOpen(false); // Close the dialog
    } else {
      console.log('No accounts found');
    }
  }

  function disconnectWallet() {
    localStorage.removeItem('selectedWalletAddress');
    setSelectedAccount(null); // Clear the selected account
  }

  // Function to handle login click, which either opens the dialog or disconnects the wallet
  const handleLoginClick = () => {
    if (!selectedAccount) {
      setWalletDialogOpen(true);
    } else {
      disconnectWallet();
    }
  };

  // Function to format the displayed account address
  const formatWalletAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Header
        onLoginClick={handleLoginClick}
        walletAddress={selectedAccount ? selectedAccount.address : ''}
        formatWalletAddress={formatWalletAddress}
      />
      <Box className={styles.mainViewContainer}>
        <UserDashboard />
        <GameView />
      </Box>
      <WalletConnectDialog
        open={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        onConnect={connectWallet}
      />
    </>
  );
}

export default MainView;
