import { AppBar, Toolbar, Typography, Button, Box, Avatar, CircularProgress } from "@mui/material";
import WalletIcon from '@mui/icons-material/Wallet';

const Header = ({ onLoginClick, walletAddress, balance, avatarUrl, loadingAvatar, loadingBalance }) => {
    return (
        <AppBar position="static" color="transparent" sx={{ boxShadow: "none", marginBottom: "1rem" }}>
            <Toolbar>
            <Typography variant="h6" component="div" sx={{
                flexGrow: 1,
                fontWeight: 'bold', 
                fontSize: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '20px 0',
                cursor: 'default'
                }}>
                    GameIN
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        color="primary"
                        startIcon={<WalletIcon />}
                        onClick={onLoginClick}
                        sx={{
                            padding: "6px 16px", // Adjust padding if necessary
                            minWidth: '140px', // Ensure a minimum width for consistency
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
                        {loadingBalance ? (
                            <CircularProgress size={24} color="secondary" />
                        ) : walletAddress ? (
                            `${balance} | ${walletAddress}`
                        ) : (
                            'Login'
                        )}
                    </Button>

                    <Button
                        color="primary"
                        sx={{
                            padding: "6px 16px",
                            minWidth: '60px',
                            borderRadius: 2,
                            boxShadow: 0,
                            bgcolor: "#ffffff40",
                            textTransform: 'none',
                            marginRight: 2,
                            color: "white",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                                bgcolor: "#ffffff60"
                            }
                        }}
                    >
                        {loadingAvatar ? (
                            <CircularProgress size={24} color="secondary" />
                        ) : avatarUrl ? (
                            <Avatar
                                src={`/avatars/${avatarUrl}`}
                                alt="Custom Avatar"
                                sx={{
                                    width: 24,
                                    height: 24,
                                }}
                            />
                        ) :
                            <Avatar
                                sx={{
                                    width: 24, // Ensure Avatar has a default size when no image is present
                                    height: 24,
                                }}
                            />
                        }
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
