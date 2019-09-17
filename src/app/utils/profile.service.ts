import { Injectable, OnDestroy } from '@angular/core';
import { AuthService, User, DatabaseService, DatabaseDocument, dbCommon } from '../connect';
import { Observable, Subscription, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

export interface dbUser extends dbCommon {
  name?    : string,
  email?   : string,
  photo?   : string,
  bio?     : string
};

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends DatabaseDocument<dbUser> {

  readonly profile$: Observable<dbUser>;
/*
  get user(): User { return this.auth.user || {} as User; }
  get name(): string { return this.snapshot.name || this.user.displayName; }
  get email(): string { return this.snapshot.email || ''; }
  get photo(): string { return this.snapshot.name || ''; }
  get bio(): string { return this.snapshot.name || ''; }
  */
  constructor(readonly auth: AuthService, db: DatabaseService) { 
    super(db, 'users', auth.userId);

    this.profile$ = auth.user$.pipe( 

      tap( user => this.id = !!user ? user.uid : ''),
      
      switchMap( user => !!user ? this.stream() : of(null) )
    );
  }
}