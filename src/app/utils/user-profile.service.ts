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

  /** Current user profile snapshot */
  public data: dbUser = null;
  private sub: Subscription;

  constructor(readonly auth: AuthService, db: DatabaseService) {
    // Extends the DatabaseDocument with a null reference
    super(db, null);

    // Persists the user profile snapshot making sure the document reference is up to date
    this.sub = this.stream().subscribe( profile => this.data = profile );
  }

  // Disposes of the subscription
  ngOnDestroy() { this.sub.unsubscribe(); }

  // Extends the streaming function to resolve the authenticated user first
  public stream(): Observable<dbUser> {

     return this.auth.user$.pipe(
      // Resolves the authenticated user attaching the corresponding document reference    
      tap( user => this.ref = !!user ? this.db.doc(`users/${user.uid}`) : null ),
      // Strams the document with the authenticated user profile
      switchMap( user => !!user ? super.stream() : of(null) )
    );
  }
}