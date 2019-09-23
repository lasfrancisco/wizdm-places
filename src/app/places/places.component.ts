import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatabaseService } from '../connect';
import { dbPlace } from './place/place.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'wm-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent {

  readonly places$: Observable<dbPlace[]>;

  constructor(private database: DatabaseService) { 

    this.places$ = this.database.pagedCollection<dbPlace>('places')
      .paging({ 
        field: 'name',
        limit: 10
      });*
  }
}