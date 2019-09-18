import { Component, OnDestroy,  Input, HostBinding } from '@angular/core';
import { AuthService, User, DatabaseService, DatabaseDocument, DatabaseCollection, DistributedCounter, dbCommon, dbTimestamp } from '../../connect';
import { AuthGuard } from '../../utils/auth-guard.service';
import { filter, map, tap, take, switchMap, takeUntil, startWith, distinctUntilChanged  } from 'rxjs/operators';
import { Observable, BehaviorSubject, Subscription, merge, of } from 'rxjs';
import { $animations } from './place.animations';

export interface dbPlace extends dbCommon {
  name:  string;
  photo?: string;
};

@Component({
  selector: 'wm-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss'],
  animations: $animations
})
export class PlaceComponent extends DatabaseDocument<dbPlace> implements OnDestroy {

  private _favorite$ = new BehaviorSubject<boolean>(false);
  private favorite$: Observable<boolean>;

  private likers: DatabaseCollection<dbCommon>;
  private likes: DistributedCounter;
  private sub: Subscription;
  private data: dbPlace;

  
  get me() { return this.guard.userId || 'unknown'; }
  get name() { return !!this.data && this.data.name || ''; }
  get photo() { return !!this.data && this.data.photo || ''; }
  get favorite() { return this._favorite$.value; }
  get authenticated() { return this.guard.authenticated; }

  constructor(private guard: AuthGuard, db: DatabaseService) { 
    super(db, 'places', '');
  }

  @HostBinding('style.background-image') 
  private get photoUrl() {

    return !!this.photo ? `url(${this.photo}?q=75&fm=jpg&w=400&fit=max)` : '';
  }

  @Input() set place(data: dbPlace) { 

    console.log('Place:', data.name);

    this.initPlace(data);    
 }

  ngOnDestroy() { !!this.sub && this.sub.unsubscribe(); }

  private initPlace(data: dbPlace) {

    // Unsubscribes previous subscriptions, eventually
    if(!!this.sub) { this.sub.unsubscribe(); }
    // Subscribes to keeps the data in sync
    this.sub = this.syncData(data)
    // Gets the likes distributed counter
    this.likes = this.counter('likes');
     // Gets the collection of likers
    this.likers = this.collection('likers');
    // Builds the favorite flag
    this.favorite$ = this.initFavorite();
  }

  private syncData(data: dbPlace) {

    // Updates the document id
    this.id = data.id;
    // Streams the data content starting from the known set
    return this.stream().pipe( startWith(data) )
      .subscribe( data => this.data = data );    
  }

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
}