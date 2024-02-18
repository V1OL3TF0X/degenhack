import React from 'react';
import { Dialog, DialogContent, DialogTitle, List, ListItem, IconButton, Typography, ListItemAvatar, Avatar, Box } from '@mui/material';
import PolkadotJSLogo from '/polkadotjs.svg';
import subwallet from '/subwallet.png';
import talisman from '/talisman.png';
import alephzerologo from '/alephzero.jpeg';
import nightlylogo from '/nightly.jpg';

import {
    SubstrateChain,
    SubstrateWalletPlatform,
    alephzero,
    allSubstrateWallets,
    getSubstrateChain,
    isWalletInstalled,
    useBalance,
    useInkathon,
} from '@scio-labs/use-inkathon';
import CloseIcon from '@mui/icons-material/Close';
import loginback from '../../assets/login_back.svg'

const walletLogos = {
    'Polkadot{.js}': PolkadotJSLogo,
    'SubWallet': subwallet,
    'Aleph Zero Signer': alephzerologo,
    'Talisman': talisman,
    'Nightly Wallet': nightlylogo,
    'Nightly Connect': nightlylogo
};

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
    } = useInkathon();

    const handleWalletConnect = (wallet) => {
        if (isWalletInstalled(wallet)) {
            connect?.(undefined, wallet).then(() => {
                console.log(accounts);

                onClose();
            });
        } else {
            window.open(wallet.urls.website, '_blank'); // Open wallet installation URL
        }
    };


    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                }
            }}
        >            <DialogTitle sx={{ padding: 0, position: 'relative', width: '100%', }}>
                <img src={loginback} alt="Robot" style={{ display: 'block', width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'grey.500',
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h3" component="div" sx={{ position: 'absolute', bottom: 0, left: 16, color: 'common.white', padding: "20px" }}>
                    Connect to our app
                </Typography>


            </DialogTitle>
            <DialogContent>

                <List>
                    {allSubstrateWallets
                        .filter((wallet) => wallet.platforms.includes('browser'))
                        .map((wallet) => (
                            <ListItem button onClick={() => handleWalletConnect(wallet)} key={wallet.id}>
                                <ListItemAvatar>
                                    <Avatar src={walletLogos[wallet.name]} alt={wallet.name} sx={{ width: "24px", height: "24px" }} />
                                </ListItemAvatar>
                                <Typography variant='h6'>{wallet.name}</Typography>
                            </ListItem>
                        ))}
                </List>

            </DialogContent>
        </Dialog>
    );
};

export default WalletConnectDialog;
