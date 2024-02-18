import { Button } from '@mui/material';
import { Game } from '../../api/types';

type LobbyProps = {
  game: Game;
  children?: React.ReactNode;
  onClose: () => void;
};

function Lobby({ children, onClose }: LobbyProps) {
  return (
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
        <Button variant='contained' color='success'>
          Join game
        </Button>
      </div>
      {children}
    </>
  );
}

export default Lobby;
