import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../connect';
import { AuthGuard } from '../../utils/auth-guard.service';
import { UserProfile } from '../../utils/user-profile.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'wm-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent { 

  readonly created$: Observable<Date>;

  get auth() { return this.guard.auth; }
  
  get user() { return this.auth.user || {} as User };

  constructor(private guard: AuthGuard, private profile: UserProfile) { 

    this.created$ = this.profile.stream().pipe( map( profile => !!profile ? profile.created.toDate() : null ));
  }

  public sendEmailVerification() {

    //console.log(this.router.location);

    return this.auth.sendEmailVerification()//this.router.url)
      .catch( e => console.log(e) );
  }

  public changeEmail() {

    this.guard.prompt('changeEmail')
      .then( user => { });
  }

  public changePassword() {

    this.guard.prompt('changePassword')
      .then( user => { });
  }

  public deleteAccount() {

    this.guard.prompt('delete')
      .then( user => { });
  }

}