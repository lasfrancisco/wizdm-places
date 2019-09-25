import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../connect';
import { AuthGuard } from '../../utils/auth-guard.service';

@Component({
  selector: 'wm-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent { 

  constructor(private guard: AuthGuard) { }

  // Returns the AuthService 
  get auth(): AuthService { return this.guard.auth; }
  // Returns the curernt User object
  get user(): User { return this.auth.user; }
  // Return the user's creation time
  get created(): Date { return new Date(!!this.user ? this.user.metadata.creationTime : null); }

  // Sends the user email verification
  public sendEmailVerification() {

    return this.user.sendEmailVerification()
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