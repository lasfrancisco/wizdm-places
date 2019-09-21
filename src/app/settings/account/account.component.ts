import { Component, OnInit } from '@angular/core';
import { AuthService, User, DatabaseService, DatabaseDocument } from '../../connect';
import { AuthGuard } from '../../utils/auth-guard.service';
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

  get auth() { return this.guard.auth; }
  get user() { return this.auth.user || {} as User };

  constructor(readonly guard: AuthGuard, db: DatabaseService) { 
    super(db, 'users', guard.userId);

    this.created$ = this.stream().pipe( map( profile => !!profile ? profile.created.toDate() : null ));
  }


}