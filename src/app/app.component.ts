import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
//import { AuthService, User, DatabaseService, DatabaseDocument, dbCommon } from './connect';
import { AuthGuard } from './utils/auth-guard.service';
import { UserProfile } from './utils/user-profile.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

/*export interface dbUser extends dbCommon {
  name?    : string,
  email?   : string,
  photo?   : string,
  bio?     : string
};*/

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: { 'class': 'mat-typography' }
})
export class AppComponent implements OnInit { 

  readonly userName$: Observable<string>;

  readonly footerItems = [ 
    { icon: "fab:fa-angular", link: "https://angular.io" },
    { icon: "fab:fa-github", link: "https://github.com" },
    { icon: "fab:fa-medium", link: "https://medium.com/wizdm-genesys" }
  ];

  get authenticated() { return this.guard.authenticated; }
/*
  get auth(): AuthService { return this.guard.auth; }

  get user(): User { return this.auth.user || {} as User }; 
*/
  constructor(readonly guard: AuthGuard, private profile: UserProfile, private icon: MatIconRegistry) {

    this.userName$ = this.profile.stream().pipe( 
      map( data => !!data ? data.name : '')
    );
  }

  ngOnInit() {

    // Registers font awesome among the available sets of icons for mat-icon component
    this.icon.registerFontClassAlias('fontawesome', 'fa');
  }
}