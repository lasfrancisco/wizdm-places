import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatabaseService, DatabaseCollection } from '../connect';
import { dbPlace } from './place/place.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'wm-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent extends DatabaseCollection<dbPlace> {

  readonly places$: Observable<dbPlace[]>;

  constructor(db: DatabaseService) { 
    // Constructs the DatabseColleciton referring to 'places'
    super(db, db.col('places'));
    // Streams the array of places ordering them by ascending names 
    this.places$ = this.stream( ref => ref.orderBy('name', 'asc') );
  }
}