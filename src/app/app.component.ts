import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material';
import { AuthGuard } from './utils/auth-guard.service';
import { UserProfile } from './utils/user-profile.service';
import { Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: { 'class': 'mat-typography' }
})
export class AppComponent implements OnInit, OnDestroy { 

  readonly userName$: Observable<string>;
  private sub: Subscription;

  readonly footerItems = [ 
    { icon: "fab:fa-angular", link: "https://angular.io" },
    { icon: "fab:fa-github", link: "https://github.com" },
    { icon: "fab:fa-medium", link: "https://medium.com/wizdm-genesys" }
  ];

  get auth() { return this.profile.auth; } 

  get authenticated() { return this.guard.authenticated; }

  constructor(readonly guard: AuthGuard, private profile: UserProfile, readonly router: Router, private icon: MatIconRegistry) {

    // Streams the user name from the profile
    this.userName$ = this.profile.stream().pipe( 
      map( data => !!data ? data.name : '')
    );
  }

  ngOnInit() {

    // Registers font awesome among the available sets of icons for mat-icon component
    this.icon.registerFontClassAlias('fontawesome', 'fa');

    // Monitors the authState making sure to navigate home whenever the user signs out
    // including when the account has been deleted
    this.sub = this.auth.authState$.pipe( filter( user => !user ) )
      .subscribe( () => this.router.navigate(['/']) );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }
}