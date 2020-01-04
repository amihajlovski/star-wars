import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { StarWarsService } from '../../services/star-wars.service';
import { IStarWarsCharacter } from '../../services/models/character';
import { IStarWarsResponse } from '../../services/models/serviceResponse';
import { merge, of, ReplaySubject, combineLatest, Observable } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  takeUntil,
  startWith,
  delayWhen,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  private destroyed$ = new ReplaySubject<boolean>(1);
  private filter$ = new ReplaySubject<string>(1);
  filter: Observable<string> = this.filter$.asObservable().pipe(
    debounceTime(1000),
    distinctUntilChanged()
  );
  searchText = '';
  activeSearch = '';

  isLoadingResults = true;
  resultsLength: number = null;

  people: IStarWarsCharacter[] = [];
  pageIndex = 0;
  pageSize = 10;
  displayedColumns: string[] = ['name', 'gender', 'birthYear', 'planetName'];

  // { static: true } because will be used inside ngOnInit
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    private readonly router: Router,
    private readonly starWarsService: StarWarsService
  ) { }

  ngOnInit() {
    merge(
      this.sort.sortChange,
      this.paginator.page,
      this.filter,
    ).pipe(
      startWith({}),
      delayWhen(() =>
        combineLatest(this.paginator.initialized, this.sort.initialized)
      ),
      switchMap(
        (event: Sort | PageEvent | string) => {
          this.isLoadingResults = true;

          // search event
          if (typeof event === 'string') {
            this.activeSearch = event;
          }

          return this.starWarsService.getPeople(this.paginator.pageIndex + 1, this.activeSearch);
        }
      ),
      map((res: IStarWarsResponse) => res),
      catchError(err => {
        console.error(err);
        this.isLoadingResults = false;
        return of([]);
      }),
      takeUntil(this.destroyed$)
    ).subscribe((data: IStarWarsResponse) => {
      this.people = data.results;
      this.resultsLength = data.count;
      this.isLoadingResults = false;
    });
  }

  applySearchFilter(filterValue: string) {
    this.paginator.pageIndex = 0;
    this.filter$.next(filterValue ? filterValue : '');
  }

  openDetails(character: IStarWarsCharacter) {
    const characterId = character.url.split('/')[5];
    this.router.navigate([`/people/${characterId}`]);
  }

}
