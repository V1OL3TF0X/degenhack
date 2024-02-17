import { Card, Box, Typography, Tooltip } from '@mui/material';
import styles from './UserDashboard.module.scss';
import { BalanceFormatterOptions, useBalance, useInkathon } from '@scio-labs/use-inkathon';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import TokenIcon from '../../assets/A0_icon.svg?react';

const balanceConfig = {
  forceUnit: false,
  withUnit: false,
  fixedDecimals: 2,
  removeTrailingZeros: true,
} satisfies BalanceFormatterOptions;

const UserDashboard = () => {
  const { activeAccount } = useInkathon();
  const { reducibleBalance, reducibleBalanceFormatted } = useBalance(activeAccount?.address, true, balanceConfig);
  const hasBalance = !!reducibleBalance && !reducibleBalance.isZero();
  return (
    <Box className={styles.userDashboardBox}>
      <Card className={styles.userNameDashboardCard}>
        <Typography component='div'>User Name</Typography>
      </Card>
      <Box className={styles.userBox}>
        <Card className={styles.userCard}>
          <Typography component='div'>
            {reducibleBalanceFormatted !== undefined ? (
              <Box display='flex' gap={2} alignItems='center' justifyContent={hasBalance ? 'space-between' : 'center'}>
                {hasBalance ? (
                  <>
                    <TokenIcon />
                    {reducibleBalanceFormatted}
                  </>
                ) : (
                  <Tooltip title='No balance to pay fees'>
                    <ReportGmailerrorredIcon sx={{ width: '1rem', height: '1rem' }} />
                  </Tooltip>
                )}
              </Box>
            ) : (
              'Tokens'
            )}
          </Typography>
        </Card>
        <Card className={styles.userCard}>
          <Typography component='div'>NFTs</Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default UserDashboard;
