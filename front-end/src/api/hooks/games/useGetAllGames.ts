import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { GET_ALL_GAMES } from '../../queryKeys';
import { getAllGames } from '../../games';
import { Games } from '../../types';

export const useGetAllGames: () => UseQueryResult<Games, Error> = () =>
  useQuery({ queryKey: [GET_ALL_GAMES], queryFn: getAllGames });
