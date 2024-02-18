import { API_GAMES_URL } from './base';
import { Game } from './types';

export const getAllGames: () => Promise<Game[]> = async () => {
  try {
    const response = await fetch(`${API_GAMES_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.games;
  } catch (error) {
    console.error(error);
    return [];
  }
};
