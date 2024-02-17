import { useState } from 'react';
import { Card, Box, Typography, CircularProgress, CardActions } from '@mui/material';

import GroupsIcon from '@mui/icons-material/Groups';
import TokenIcon from '../../assets/A0_icon.svg?react';
import styles from './GameView.module.scss';
import { useGetAllGames } from '../../api/hooks/games/useGetAllGames';
import toast from 'react-hot-toast';
import { useRegisteredContract, useInkathon, contractQuery, decodeOutput } from '@scio-labs/use-inkathon';
import { LoadingButton } from '@mui/lab';
import { CONTRACT_ID } from '../../web3/getDeployments';
import { BN } from '@polkadot/util';

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
      let bn = new BN(10);
      bn = bn.pow(new BN(api.registry.chainDecimals[0] || 12));
      bn.imuln(5); // TODO - bet amount from API
      const { gasRequired, storageDeposit } = (result = await contractQuery(
        api,
        activeAccount.address,
        contract,
        'joinGame',
        { value: bn, gasLimit: -1 },
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
          <CardActions sx={{ justifyContent: 'center' }}>
            <LoadingButton
              variant='outlined'
              disabled={!api || !contract || !activeAccount}
              onClick={() => handleJoin(id)}
              loading={!contract || isChecking}
            >
              Join Game
            </LoadingButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default GameView;
