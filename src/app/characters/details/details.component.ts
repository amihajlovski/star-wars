import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { StarWarsService } from 'src/app/services/star-wars.service';
import { IStarWarsCharacter } from 'src/app/services/models/character';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  character: IStarWarsCharacter = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly starWarsService: StarWarsService
  ) { }

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => this.starWarsService.getCharacter(params.id))
    ).subscribe(
      (res: IStarWarsCharacter) => this.character = res,
      err => console.error(err)
    );
  }

  openDetails(resident: IStarWarsCharacter) {
    this.character = null;
    this.router.navigate(['/people', resident.url.split('/')[5]]);
  }

}
