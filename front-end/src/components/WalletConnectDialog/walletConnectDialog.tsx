import React from 'react';
import { Dialog, DialogContent, DialogTitle, List, ListItem, ListItemAvatar, Avatar, Typography } from '@mui/material';
import PolkadotJSLogo from '/polkadotjs.svg'; // Update the path to your image
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


const WalletConnectDialog = ({ open, onClose }) => {

    const {
        activeChain,
        switchActiveChain,
        connect,
        disconnect,
        isConnecting,
        activeAccount,
        accounts,
        setActiveAccount,
    } = useInkathon()

    const handleWalletConnect = (wallet) => {

        if (isWalletInstalled(wallet)) {
            connect?.(undefined, wallet).then(() => {
                console.log(accounts)

                onClose();
            });
        } else {
            window.open(wallet.urls.website, '_blank'); // Open wallet installation URL
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Connect to our app</DialogTitle>
            <DialogContent>
                <List>
                    {allSubstrateWallets.filter(wallet => wallet.platforms.includes('browser')).map((wallet) => (
                        <ListItem button onClick={() => handleWalletConnect(wallet)} key={wallet.id}>

                            <Typography variant="body2">{wallet.name}</Typography>
                        </ListItem>
                    )
                    )}
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default WalletConnectDialog;
