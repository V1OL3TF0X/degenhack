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

  const games = allGames?.map((game) => (
    <Card key={game._id} className={styles.gameCard}>
      <Typography variant='h5'>{game.name}</Typography>
      <Box className={styles.gameDetails}>
        <div >
          <GroupsIcon />
          <Typography>{game.minParticipants} - {game.maxParticipants}</Typography>
        </div>
        <div>
        <TokenIcon/>
        <Typography>{game.prize}</Typography>
        </div>
      </Box>
      <CardActions>
        <Button variant="outlined" onClick={() => handleClickOpen(game._id)}>Join Game</Button>
      </CardActions>
    </Card>
  ));

  return (
    <>
      {isPending && <CircularProgress />}
      {!isPending && allGames && (
        <Box className={styles.gamesBox}>
          {games}
          {isDialogOpen && <AlertDialog open={isDialogOpen} close={handleClose} />}
        </Box>
      )}
    </>
  );
};

export default GameView;
