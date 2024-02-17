import { Card, Box, Typography } from '@mui/material';
import styles from './UserDashboard.module.scss';

const UserDashboard = () => {
  return (
    <Box className={styles.userDashboardBox}>
      <Card className={styles.userNameDashboardCard}>
        <Typography component='div'>User Name</Typography>
      </Card>
      <Box className={styles.userBox}>
        <Card className={styles.userCard}>
          <Typography component='div'>Tokens</Typography>
        </Card>
        <Card className={styles.userCard}>
          <Typography component='div'>NFTs</Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default UserDashboard;
