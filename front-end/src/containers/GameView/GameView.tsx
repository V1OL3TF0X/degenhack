import { useState } from 'react';
import { Card, Box, Typography, CircularProgress, CardActions, Button } from '@mui/material';

import GroupsIcon from '@mui/icons-material/Groups';
import TokenIcon from '@mui/icons-material/Token';
import styles from './GameView.module.scss';
import { useGetAllGames } from '../../api/hooks/games/useGetAllGames';
import { AlertDialog } from '../../components/Dialog/alertDialog';

const GameView = () => {
  const { isPending, isError, data: allGames, error } = useGetAllGames();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const handleClickOpen = (id: string) => {
    setIsDialogOpen(true);
    console.log(id);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  if (isPending) {
    return <CircularProgress />;
  }

  if (isError) {
    return null;
  }

  return (
    <Box className={styles.gamesBox}>
      {allGames.map(({ name, minParticipants: min, maxParticipants: max, prize, _id: id }) => (
        <Card key={id} className={styles.gameCard}>
          <Typography variant='h5'>{name}</Typography>
          <Box className={styles.gameDetails}>
            <div>
              <GroupsIcon />
              <Typography>{min === max ? min : `${min} - ${max}`}</Typography>
            </div>
            <div>
              <TokenIcon />
              <Typography>{prize}</Typography>
            </div>
          </Box>
          <CardActions>
            <Button variant='outlined' onClick={() => handleClickOpen(id)}>
              Join Game
            </Button>
          </CardActions>
        </Card>
      ))}
      {isDialogOpen && <AlertDialog open={isDialogOpen} onClose={handleClose} />}
    </Box>
  );
};

export default GameView;
