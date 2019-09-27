import { Component, OnDestroy,  Input, HostBinding } from '@angular/core';
import { DatabaseService, DatabaseDocument, DatabaseCollection, DistributedCounter } from '../../connect';
import { AuthGuard } from '../../utils/auth-guard.service';
import { filter, map, tap, take, switchMap, takeUntil, startWith, distinctUntilChanged  } from 'rxjs/operators';
import { Observable, BehaviorSubject, Subscription, merge, of } from 'rxjs';
import { dbPlace } from '../places.component';
import { $animations } from './place.animations';

@Component({
  selector: 'wm-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss'],
  animations: $animations
})
export class PlaceComponent extends DatabaseDocument<dbPlace> implements OnDestroy {

  private _favorite$ = new BehaviorSubject<boolean>(false);
  private favorite$: Observable<boolean>;

  private likers: DatabaseCollection<any>;
  private likes: DistributedCounter;
  private sub: Subscription;
  private data: dbPlace;
  
  /** Returns the current authenticated userId or 'unknown' */
  get me(): string { return this.guard.userId || 'unknown'; }
  /** Returns the place name */
  get name(): string { return !!this.data && this.data.name || ''; }
  /** Returns the place photo url */
  get photo(): string { return !!this.data && this.data.photo || ''; }
  /** Returns true thenever the place is favorite */
  get favorite(): boolean { return this._favorite$.value; }
  /** Returns true whenever the current user is authenticated */
  get authenticated(): boolean { return this.guard.authenticated; }

  constructor(private guard: AuthGuard, db: DatabaseService) { 
    super(db, null)//Constructs the document with a null reference
  }

  @HostBinding('style.background-image') 
  private get photoUrl() { return `url(${this.photo})`; }

  @Input() set place(data: dbPlace) { 

    console.log('Place:', data.name);

    // Assosiates the document DB reference with this DatabaseDocument instance 
    this.ref = this.db.doc(`places/${data.id}`);
    
    // Unsubscribes previous subscriptions, eventually
    if(!!this.sub) { this.sub.unsubscribe(); }
    
    // Streams the data content starting from the known set
    this.sub = this.stream().pipe( startWith(data) )
      .subscribe( data => this.data = data );  

    // Gets the likes distributed counter
    this.likes = this.counter('likes');
    
     // Gets the collection of likers
    this.likers = this.collection('likers');
    
    // Builds the favorite flag
    this.favorite$ = this.initFavorite();   
 }

  // Disposes of the observable subscriptions
  ngOnDestroy() { !!this.sub && this.sub.unsubscribe(); }

  /** Builds the favorite flag Observable */
  private initFavorite(): Observable<boolean> {
    
    return merge(
      // Here the local copy 
      this._favorite$,
      // Resolves the user
      this.guard.auth.user$.pipe( 
        // Gets the current user id
        map(user => !!user ? user.uid : 'unknown'),
        // Seeks for the user id within the collection of likers
        switchMap( me => this.isLikedBy(me) ),
        // Syncs the local copy
        tap( favorite => this._favorite$.next(favorite) ) 
      )
      // Distinct changes to avoid unwanted flickering
    ).pipe( distinctUntilChanged() );
  }

  /** Checks if the specified userId is among the likers */
  private isLikedBy(userId: string): Observable<boolean> {

    // Searches among the collection of likers 
    return this.likers
      // Matches for the document named upon the userId
      .stream( ref => ref.where(this.db.sentinelId, "==", userId ) )
      // Returns true if such document exists
      .pipe( map( docs => docs.length > 0 ) );
  }
  
  /** Toggles the favorite status */
  public toggleFavorite() {

    // Acts immediately whenever the user is already logged-in
    if(this.authenticated) { this.updateFavorite( !this.favorite, this.me ); }
    
    // Proceed to authenticate the user otherwise
    else { this.guard.authenticate().then( user => {

      // Stops on authentication failed/aborted
      if(!user) { return false; }
      // Checks the user against the likers
      return this.isLikedBy(user.uid).pipe( 
        // Gets the first results and completes
        take(1),
        // Updates the favorite once the authentication succeeded
        tap( favorite => this.updateFavorite( !favorite, user.uid ) )

      ).toPromise();
    });}
  }

  /** Updates the favorite status */
  private updateFavorite(favorite: boolean, user: string) {

    // Updates the local favorite flag copy for improved reactivity
    this._favorite$.next(favorite);

    // Adds the user to the collection of likers....
    if(favorite) { this.likers.document(user).set({}); }
    // ...or removes it according to the request
    else { this.likers.document(user).delete(); }

    // Updates the likes counter accordingly
    this.likes.update( favorite ? 1 : -1 );
  }
}