import { API_GAMES_URL } from './base';

export const winGame = async ({ gameId, winner }: { gameId: string; winner: string }) => {
  const res = await fetch(`${API_GAMES_URL}/${gameId}/end`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: `{
      "winner": "${winner}"
    }`,
  });
  if (!res.ok) {
    throw new Error(`Error: ${res.status}`);
  }
};

export const startGame = async (gameId: string) => {
  const res = await fetch(`${API_GAMES_URL}/${gameId}/start`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Error: ${res.status}`);
  }
};

export const mockJoinGame = async ({ gameId, userId, times }: { gameId: string; userId: string; times: number }) => {
  const res = await fetch(`${API_GAMES_URL}/${gameId}/assign`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      users: Array.from({ length: times }, () => ({
        operation: 'ADD',
        id: userId,
      })),
    }),
  });
  if (!res.ok) {
    throw new Error(`Error: ${res.status}`);
  }
};
