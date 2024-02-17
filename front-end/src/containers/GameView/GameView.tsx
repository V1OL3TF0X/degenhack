import { useState } from 'react';
import { Card, Box, Typography, CircularProgress } from '@mui/material';
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
    <Card key={game._id} className={styles.gameCard} onClick={() => handleClickOpen(game._id)}>
      <Typography variant='h5'>Game Name:</Typography>
      <Typography variant='h6'>{game.name}</Typography>
      <div>
        <Typography>Min Participants: {game.minParticipants}</Typography>
        <Typography>Max Participants: {game.maxParticipants}</Typography>
      </div>
      <Typography>Prize: {game.prize}</Typography>
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
