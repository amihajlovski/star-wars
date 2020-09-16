import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, from, Observable } from "rxjs";
import { map, mergeMap, toArray } from "rxjs/operators";
import { IStarWarsCharacter } from "./models/character";
import { IStarWarsPlanet } from "./models/planet";
import { IStarWarsResponse } from "./models/serviceResponse";

@Injectable({
  providedIn: "root",
})
export class StarWarsService {
  url = "https://swapi.dev/api";

  constructor(private readonly http: HttpClient) {}

  public getPeople(
    page: number = 1,
    search: string
  ): Observable<IStarWarsResponse> {
    return this.http
      .get<IStarWarsResponse>(`${this.url}/people`, {
        params: {
          page: page.toString(),
          search,
        },
      })
      .pipe(
        mergeMap((people: IStarWarsResponse) =>
          from(people.results).pipe(
            mergeMap(
              (character: IStarWarsCharacter) =>
                this.http.get(character.homeworld),
              (character: IStarWarsCharacter, planet: IStarWarsPlanet) => ({
                ...character,
                planet,
              })
            ),
            toArray(),
            map((results) => ({ ...people, results }))
          )
        )
      );
  }

  public getCharacter(id: string): Observable<IStarWarsCharacter> {
    return this.http.get<IStarWarsCharacter>(`${this.url}/people/${id}`).pipe(
      mergeMap((result: IStarWarsCharacter) =>
        from([result]).pipe(
          mergeMap(
            (character: IStarWarsCharacter) =>
              this.http.get(character.homeworld),
            (character: IStarWarsCharacter, planet: IStarWarsPlanet) => ({
              ...character,
              planet,
            })
          ),
          mergeMap((character) => {
            let allResidents = character.planet.residents.map((url: string) =>
              this.http.get(url)
            );
            return forkJoin(...allResidents).pipe(
              map((idDataArray) => {
                character.planet.residents.forEach((eachResident, index) => {
                  character.planet.residents[index] = idDataArray[index];
                });
                return character;
              })
            );
          })
        )
      )
    );
  }
}
