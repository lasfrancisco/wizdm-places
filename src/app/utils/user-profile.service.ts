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
export class UserProfile extends DatabaseDocument<dbUser> implements OnDestroy{

  /** Profile observable updating according to authentication  */
  readonly profile$: Observable<dbUser>;

  /** Current user profile snapshot */
  public profile: dbUser = null;
  private sub: Subscription;

  constructor(readonly auth: AuthService, db: DatabaseService) {
    // Extends the DatabaseDocument with a null reference
    super(db, null);

    // Builds the profile observable
    this.profile$ = this.auth.user$.pipe(
      // Resolves the authenticated user attaching the corresponding document reference    
      tap( user => this.ref = !!user ? this.db.doc(`users/${user.uid}`) : null ),
      // Strams the document with the authenticated user profile
      switchMap( user => !!user ? this.stream() : of(null) )
    );

    // Persists the user profile snapshot making sure the document reference is up to date
    this.sub = this.profile$.subscribe( profile => this.profile );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

}