import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, of, forkJoin, Subject } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import { LoginComponent, loginAction } from '../login/login.component';
import { AuthService, User } from '../connect';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(readonly auth: AuthService, private router: Router, private dialog: MatDialog) {}

  get authenticated() { return this.auth.authenticated; }

  get userId() { return this.auth.userId; }

  public authenticate(data: loginAction = 'signIn'): Promise<User> {

    return this.auth.user$.pipe(
      
      take(1),

      switchMap( user => {

        if(!!user) { return of(user); }

        return this.dialog.open<LoginComponent,loginAction, User>(LoginComponent, { data })
          .afterClosed();
      })

    ).toPromise();
  }

  public disconnect(jumpTo = '/'): Promise<boolean> {

    return this.auth.signOut()
      .then( () => this.router.navigateByUrl(jumpTo) );
  }

  // Implements single route user authentication guarding
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    // Gets the authorization mode when specified
    const mode = route.queryParamMap.get('authMode') || 'signIn';
    // Prompts the user for authentication 
    return this.authenticate(mode as loginAction)
      .then( user => !!user );
  }
}