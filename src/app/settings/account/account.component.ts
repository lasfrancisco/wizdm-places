import { Component, OnInit } from '@angular/core';
import { AuthService, User, DatabaseService, DatabaseDocument, StorageService, dbTimestamp } from '../../connect';
import { dbUser } from '../../app.component';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'wm-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent extends DatabaseDocument<dbUser> {

  readonly created$: Observable<Date>;

  get user() { return this.auth.user || {} as User };

  constructor(private auth: AuthService, db: DatabaseService) { 
    super(db, 'users', auth.userId);

    this.created$ = this.stream().pipe( map( profile => !!profile ? profile.created.toDate() : null ));
  }
}