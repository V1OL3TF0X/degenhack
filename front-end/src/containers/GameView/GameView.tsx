import { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import game from '../../assets/ticTacToe.jpg'

import styles from './GameView.module.scss';
import { useGetAllGames } from '../../api/hooks/games/useGetAllGames';
import { AlertDialog } from '../../components/Dialog/alertDialog';
import GroupsIcon from '@mui/icons-material/Groups';

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
      {allGames.map(({name, minParticipants: min, maxParticipants: max, _id: id }) => (
        <Box key={id} onClick={() => handleClickOpen(id)}>
          <Box
           sx={{
            overflow: 'hidden',
            position: 'relative',
            '&:hover img': {
              transform: 'scale(1.1)',  
              transition: 'transform 0.3s ease',
              borderRadius: "12px",
              cursor: "pointer"
            },
          }}
          >
          <div style={{ position: "relative", width: '100%', height: '100%' }}>
            <img
              src={game}
              alt="Game"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: "12px"}}
            />
          </div>
          <div style={{ cursor: "pointer", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "12px",  background: "linear-gradient(0deg, black, transparent 40%)" }}>
            <Typography>{name}</Typography>
            <div className={styles.participantsNumber}>
              <GroupsIcon />
              <Typography>{min === max ? min : `${min} - ${max}`}</Typography>
            </div>
          </div>
          </Box>
       </Box>
      ))}
      {isDialogOpen && <AlertDialog open={isDialogOpen} onClose={handleClose} />}
    </Box>
  );
};

export default GameView;
