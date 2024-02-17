import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Box } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import WalletIcon from '@mui/icons-material/Wallet';
import styles from './header.module.scss';

const Header = ({ onLoginClick, walletAddress, formatWalletAddress }) => {
    return (
        <AppBar position="static" color="transparent" sx={{ boxShadow: "none" }}>
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Your App Name
                </Typography>
                <Box>
                    <Button
                        color="primary"
                        className={styles.loginButton}
                        startIcon={<WalletIcon />}
                        onClick={onLoginClick}
                        sx={{
                            padding: "0.5rem 1rem",
                            borderRadius: 2,
                            boxShadow: 0,
                            bgcolor: "#ffffff40",
                            textTransform: 'none',
                            marginRight: 2,
                            color: "white",
                            '&:hover': {
                                bgcolor: "#ffffff60"
                            }
                        }}
                    >
                        {walletAddress ? formatWalletAddress(walletAddress) : 'Login'}
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
