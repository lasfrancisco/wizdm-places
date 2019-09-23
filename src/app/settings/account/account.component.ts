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
export class AccountComponent {

  private document: DatabaseDocument<dbUser>;

  readonly created$: Observable<Date>;

  get auth() { return this.guard.auth; }
  get user() { return this.auth.user || {} as User };

  constructor(readonly guard: AuthGuard, private db: DatabaseService) { 
    
     this.document = db.document(`users/${guard.userId}`);

    this.created$ = this.document.stream().pipe( map( profile => !!profile ? profile.created.toDate() : null ));
  }
}