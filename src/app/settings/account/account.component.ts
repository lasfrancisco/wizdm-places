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
  private get auth(): AuthService { return this.guard.auth; }
  // Returns the curernt User object
  private get user(): User { return this.auth.user; }
  // Return the user's creation time
  public get created(): Date { return new Date(!!this.user ? this.user.metadata.creationTime : null); }
  // Returns true whenever the user email has been verified
  public get emailVerified(): boolean { return !!this.user && this.user.emailVerified }

  // Sends the user email verification
  public sendEmailVerification() {

    return this.user.sendEmailVerification()
      .catch( e => console.log(e) );
  }

  // Prompts for user re-authentication to change the account email
  public changeEmail() {

    this.guard.prompt('changeEmail')
      .then( user => { });
  }

  // Prompts for user re-authentication to change the account password
  public changePassword() {

    this.guard.prompt('changePassword')
      .then( user => { });
  }

  // Prompts for user re-authentication to delete the account
  public deleteAccount() {

    this.guard.prompt('delete')
      .then( user => { });
  }
}