import { Injectable, OnDestroy } from '@angular/core';
import { AuthService, User, DatabaseService, DatabaseDocument, dbCommon } from '../connect';
import { Observable, Subscription, of, from } from 'rxjs';
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

  /** Returns the current authenticated user id */
  public get uid(): string { return this.auth.userId; } 

  constructor(readonly auth: AuthService, db: DatabaseService) {
    // Extends the DatabaseDocument with a null reference
    super(db, null);

    // Persists the user profile snapshot making sure the document reference is always up to date
    this.sub = this.stream().subscribe( profile => this.data = profile );
  }

  // Disposes of the subscription
  ngOnDestroy() { this.sub.unsubscribe(); }

  // Creates the firestore document reference from the User object 
  private fromUser(user: User): this {
    this.ref = !!user ? this.db.doc(`users/${user.uid}`) : null;
    return this;
  }

  // Extends the streaming function to resolve the authenticated user first
  public stream(): Observable<dbUser> {

     return this.auth.user$.pipe(
      // Resolves the authenticated user attaching the corresponding document reference    
      tap( user => this.fromUser(user) ),
      // Strams the document with the authenticated user profile
      switchMap( user => !!user ? super.stream() : of(null) )
    );
  }

  /** Creates the user profile from a User object */
  public register(user: User): Promise<void> {

    if(!user) { return Promise.reject( new Error("Can't create a profile from a null user object") ); }

    console.log("Creating user profile for: ", user.email);

    // Checks for document existance first
    return this.fromUser(user).exists()
      // Sets the document content whenever missing
      .then( exists => !exists ? this.set({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          bio: ''
        }) : null
      );
  }
}