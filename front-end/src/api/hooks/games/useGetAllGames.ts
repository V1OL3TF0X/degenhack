import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { GET_ALL_GAMES } from '../../queryKeys';
import { getAllGames } from '../../games';
import { Game } from '../../types';

export const useGetAllGames: () => UseQueryResult<Game[], Error> = () =>
  useQuery({ queryKey: [GET_ALL_GAMES], queryFn: getAllGames });
