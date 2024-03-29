import { useState } from 'react';
import { Box, CircularProgress, Typography, ButtonBase, Dialog, DialogContent } from '@mui/material';
import defaultGameImage from '../../assets/defaultGame.jpg';
import chessImg from '../../assets/chess.jpg';
import goImg from '../../assets/go.jpg';
import ticTacToe from '../../assets/ticTacToe.jpg';
import GroupsIcon from '@mui/icons-material/Groups';
import TokenIcon from '../../assets/A0_icon.svg?react';
import styles from './GameView.module.scss';
import { useGetAllGames } from '../../api/hooks/games/useGetAllGames';
import toast from 'react-hot-toast';
import { useRegisteredContract, useInkathon, contractQuery, decodeOutput } from '@scio-labs/use-inkathon';
import { CONTRACT_ID } from '../../web3/getDeployments';
import { BN } from '@polkadot/util';
import Lobby from '../../components/Lobby/Lobbyout';
import { Game } from '../../api/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllKeysString = (obj: any) => Object.entries(obj).reduce((acc, [k, v]) => `${acc}\n  - ${k}: ${v}`, '');

const gameImages: { [key: string]: string } = {
  'tic tac toe': ticTacToe,
  chess: chessImg,
  go: goImg,
};

const GameView = () => {
  const { api, activeAccount } = useInkathon();
  const { isPending, isError, data: allGames, error } = useGetAllGames();
  const [isChecking, setIsChecking] = useState(false);
  const { contract } = useRegisteredContract(CONTRACT_ID);
  const [inLobby, setInLobby] = useState<Game>();

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const handleJoin = async (game: Game) => {
    if (!contract || !api || !activeAccount) {
      return;
    }
    setIsChecking(true);
    try {
      let result;
      let bn = new BN(10);
      bn = bn.pow(new BN(api.registry.chainDecimals[0] || 12));
      bn.imuln(game.betAmount);
      const { gasRequired, storageDeposit } = (result = await contractQuery(
        api,
        activeAccount.address,
        contract,
        'joinGame',
        { value: bn, gasLimit: -1 },
        [game._id]
      ));
      const { isError, decodedOutput } = decodeOutput(result, contract, 'joinGame');
      const costs = `\ngas required: ${getAllKeysString(gasRequired.toHuman())}\nstorage deposit ${getAllKeysString(storageDeposit.toHuman())}`;
      if (!isError) {
        setInLobby(game);
        toast.success('Check completed - game can be joined' + costs);
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
    <Box className={styles.gamesBox}>
      {allGames.map((game) => {
        const { name, minParticipants: min, maxParticipants: max, _id: id, betAmount } = game;
        return (
          <Box
            maxWidth='300px'
            key={id}
            component={ButtonBase}
            onClick={() => handleJoin(game)}
            disabled={!api || !contract || !activeAccount || isLoading}
          >
            <Box
              sx={{
                overflow: 'hidden',
                position: 'relative',
                '&:hover img': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.3s ease',
                  borderRadius: '12px',
                  cursor: 'pointer',
                },
                ...(isLoading && {
                  filter: 'grayscale(1)',
                }),
              }}
            >
              {isLoading ? (
                <Box display='flex' justifyContent='center' alignItems='center' width='300px' height='300px'>
                  <CircularProgress />
                </Box>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img
                    src={gameImages[name] || defaultGameImage}
                    alt='Game'
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                  />
                </div>
              )}
              <div
                style={{
                  cursor: 'pointer',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-start',
                  padding: '12px',
                  background: 'linear-gradient(0deg, black, transparent 60%)',
                }}
              >
                <Typography style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{name}</Typography>
                <div className={styles.participantsNumber}>
                  <GroupsIcon />
                  <Typography>{min === max ? min : `${min} - ${max}`}</Typography>
                </div>
                <div className={styles.participantsNumber}>
                  <TokenIcon />
                  <Typography>{betAmount}</Typography>
                </div>
              </div>
            </Box>
          </Box>
        );
      })}
      {!!inLobby && (
        <Dialog open onClose={() => setInLobby(undefined)}>
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <Lobby game={inLobby} onClose={() => setInLobby(undefined)}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={gameImages[inLobby?.name ?? ''] || defaultGameImage}
                  alt='Game'
                  style={{
                    width: '100%',
                    filter: 'blur(6px) brightness(0.8)',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
              </div>
            </Lobby>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default GameView;
