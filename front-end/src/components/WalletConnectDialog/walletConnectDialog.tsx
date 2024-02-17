import React from 'react';
import { Dialog, DialogContent, DialogTitle, List, ListItem, ListItemAvatar, Avatar, Typography } from '@mui/material';
import PolkadotJSLogo from '/polkadotjs.svg'; // Update the path to your image

const WalletConnectDialog = ({ open, onClose, onConnect }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Connect to our app</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" align="center" sx={{ my: 2 }}>
                    By continuing you agree to our Terms & Privacy Policy and Privy's Terms.
                </Typography>
                <List>
                    <ListItem button onClick={onConnect}>
                        <ListItemAvatar>
                            <Avatar
                                src={PolkadotJSLogo}
                                alt="Substrate Wallet"
                                sx={{ width: 24, height: 24 }}
                            />
                        </ListItemAvatar>
                        <Typography variant="body2">Substrate Wallet</Typography>
                    </ListItem>
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default WalletConnectDialog;
