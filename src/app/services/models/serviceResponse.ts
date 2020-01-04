import { IStarWarsCharacter } from './character';

export interface IStarWarsResponse {
  count: number;
  next: string;
  previous: string;
  results: IStarWarsCharacter[];
}
