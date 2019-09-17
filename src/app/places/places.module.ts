import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PlacesComponent } from './places.component';
import { PlaceComponent } from './place/place.component';

// Define navigation routes
const routes: Routes = [

  { path: 'places', component: PlacesComponent }
  
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    PlacesComponent,
    PlaceComponent
  ],
  exports: [ RouterModule ]
})
export class PlacesModule { }