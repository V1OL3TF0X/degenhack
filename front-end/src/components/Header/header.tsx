import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import WalletIcon from '@mui/icons-material/Wallet';
import styles from './header.module.scss';

const Header = ({ onLoginClick, walletAddress, formatWalletAddress }) => {
    return (
        <AppBar position="static" color="transparent" sx={{ boxShadow: "none" }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: "default" }}>
                    GameIn
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
