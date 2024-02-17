import { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import game from '../../assets/ticTacToe.jpg'

import GroupsIcon from '@mui/icons-material/Groups';
import styles from './GameView.module.scss';
import { useGetAllGames } from '../../api/hooks/games/useGetAllGames';
import toast from 'react-hot-toast';
import { useRegisteredContract, useInkathon, contractQuery, decodeOutput } from '@scio-labs/use-inkathon';
import { CONTRACT_ID } from '../../web3/getDeployments';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllKeysString = (obj: any) => Object.entries(obj).reduce((acc, [k, v]) => `${acc}\n  - ${k}: ${v}`, '');

const GameView = () => {
  const { api, activeAccount } = useInkathon();
  const { isPending, isError, data: allGames, error } = useGetAllGames();
  const [isChecking, setIsChecking] = useState(false);
  const { contract } = useRegisteredContract(CONTRACT_ID);

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const handleJoin = async (id: string) => {
    if (!contract || !api || !activeAccount) {
      return;
    }
    setIsChecking(true);
    try {
      let result;
      const { gasRequired, storageDeposit } = (result = await contractQuery(
        api,
        activeAccount.address,
        contract,
        'joinGame',
        { value: 100, gasLimit: -1 },
        [id]
      ));
      const { isError, decodedOutput } = decodeOutput(result, contract, 'joinGame');
      const costs = `\ngas required: ${getAllKeysString(gasRequired.toHuman())}\nstorage deposit ${getAllKeysString(storageDeposit.toHuman())}`;
      if (!isError) {
        // TODO API join
        toast.success(`game joined successfully ${decodedOutput}` + costs);
      } else {
        toast.error(decodedOutput + costs);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsChecking(false);
    }
  };

  if (isPending) {
    return <CircularProgress />;
  }

  if (isError) {
    return null;
  }

  const isLoading = !contract || isChecking;

  return (
    <Box className={styles.gamesBox} >
      {allGames.map(({name, minParticipants: min, maxParticipants: max, _id: id }) => (
        <Box key={id} component="button" onClick={() => handleJoin(id)}  disabled={!api || !contract || !activeAccount || isLoading}>
      
          <Box
           sx={{
            overflow: 'hidden',
            position: 'relative',
            '&:hover img': {
              transform: 'scale(1.1)',  
              transition: 'transform 0.3s ease',
              borderRadius: "12px",
              cursor: "pointer",
            },
            ...(isLoading && {
              filter: 'grayscale(1)',
            }),
          }}
          >
          {isLoading ? (
            <Box display='flex' justifyContent='center' alignItems='center' width='100%' height='100%'>
              <CircularProgress />
            </Box>
          ) : (<div style={{ position: "relative", width: '100%', height: '100%' }}>
            <img
              src={game}
              alt="Game"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: "12px"}}
            />
          </div>
          )}
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
    </Box>
  );
};

export default GameView;
