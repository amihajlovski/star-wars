import { IStarWarsCharacter } from './character';

export interface IStarWarsPlanet {
  climate: string;
  diameter: string;
  gravity: string;
  name: string;
  orbital_period: number;
  population: number;
  residents: [string | IStarWarsCharacter];
  rotation_period: number;
  surface_water: number;
  terrain: string;
  url: string;
}
