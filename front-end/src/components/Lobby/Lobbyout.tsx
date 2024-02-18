import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Game } from '../../api/types';
import { BN } from '@polkadot/util';
import { useInkathon, useRegisteredContract, contractTx } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CONTRACT_ID } from '../../web3/getDeployments';

type LobbyProps = {
  game: Game;
  children?: React.ReactNode;
  onClose: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const getAllKeysString = (obj: any) => Object.entries(obj).reduce((acc, [k, v]) => `${acc}\n  - ${k}: ${v}`, '');

function Lobby({ game, children, onClose }: LobbyProps) {
  const { api, activeAccount } = useInkathon();
  const [isChecking, setIsChecking] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [inGame, setInGame] = useState(false);
  const { contract } = useRegisteredContract(CONTRACT_ID);

  useEffect(() => {
    setTimeout(() => setCanJoin(true), 10_000);
  }, []);

  const joinGame = async () => {
    if (!contract || !api || !activeAccount) {
      return;
    }
    setIsChecking(true);
    try {
      let bn = new BN(10);
      bn = bn.pow(new BN(api.registry.chainDecimals[0] || 12));
      bn.imuln(game.betAmount);
      const { result } = await contractTx(
        api,
        activeAccount.address,
        contract,
        'joinGame',
        { value: bn, gasLimit: -1 },
        [game._id]
      );
      // const { isError, decodedOutput } = decodeOutput(result, contract, 'joinGame');
      // if (!isError) {
      //   // ROUTE TO GAME SCREEN
      //   toast.success(`game joined successfully ${decodedOutput}`);
      // } else {
      //   toast.error(decodedOutput);
      // }
      if (result?.isInBlock) {
        toast.success('Game joined successfully');
        setInGame(true);
        // TODO - set Timeout, after Xs win game
      } else if (result?.status.isInvalid) {
        toast.error('transaction invalid');
      }
      console.log(result);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsChecking(false);
    }
  };

  return !inGame ? (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          background: 'linear-gradient(0deg, black, transparent 60%)',
          zIndex: 2,
        }}
      >
        <Button onClick={onClose} variant='contained' color='warning'>
          Leave lobby
        </Button>
        <LoadingButton loading={isChecking} disabled={!canJoin} variant='contained' color='success' onClick={joinGame}>
          Join game
        </LoadingButton>
      </div>
      {children}
    </>
  ) : (
    <div style={{ width: '100%', height: '100%', background: 'black' }}> Game in progress... </div>
  );
}

export default Lobby;
