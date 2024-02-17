import { Box } from '@mui/material';
import UserDashboard from '../../containers/UserDashboard/UserDashboard';
import GameView from '../../containers/GameView/GameView';
import styles from './MainView.module.scss';

function MainView() {
  return (
    <Box className={styles.mainViewContainer}>
      <UserDashboard />
      <GameView />
    </Box>
  );
}

export default MainView;
