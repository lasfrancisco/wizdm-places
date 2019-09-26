import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatabaseService, PagedCollection } from '../connect';
import { dbPlace } from './place/place.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'wm-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent extends PagedCollection<dbPlace> {

  readonly places$: Observable<dbPlace[]>;

  constructor(db: DatabaseService) { 

    super(db, db.col('places'));

    this.places$ = this.paging({ 
      field: 'name',
      limit: 10
    });
  }
}