import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { from } from 'rxjs';
import { AuthService, User } from '../connect';
import { $animations } from './login-animations';
import { $providers } from './login-providers';
import { $pages } from './login-pages';

export type loginAction = 'register'|'signIn'|'forgotPassword'|'resetPassword'|'changePassword'|'changeEmail'|'promptEmail'|'verifyEmail'|'recoverEmail'|'delete'|'signOut';

@Component({
  selector : 'wm-login',
  templateUrl : './login.component.html',
  styleUrls : ['./login.component.scss'],
  animations: $animations
})
export class LoginComponent implements OnInit {

  readonly providers = $providers;
  private pages = $pages;
  
  private page: loginAction;
  private code: string;

  readonly form: FormGroup;
  private name: FormControl;
  private email: FormControl;
  private password: FormControl;
  private newEmail: FormControl;
  private newPassword: FormControl;

  private hide = true;
  public error = null;
  public progress = false;
  
  constructor(private auth: AuthService, private ref: MatDialogRef<LoginComponent>, @Inject(MAT_DIALOG_DATA) private action: loginAction) {

    this.name = new FormControl(null, Validators.required);
    this.email = new FormControl(null, [Validators.required, Validators.email]);
    this.password = new FormControl(null, Validators.required);
    this.newEmail = new FormControl(null, [Validators.required, Validators.email]);
    this.newPassword = new FormControl(null, Validators.required);

    this.form = new FormGroup({});

    this.switchPage(this.page = action);
  }
/*
  public show(action: loginAction = 'signIn') {

    switch(this.page = action) {

        case 'signOut':
        return from( this.auth.signOut() );

    }

    return this.dialog.open(this.template)
      .afterClosed();
  }
*/
  ngOnInit() {

/*
    // Discrimnate among the login option using the queryParameters
    this.route.queryParamMap.subscribe( (params: ParamMap) => {

      const mode  = params.get('mode') || 'signIn';
      this.code = params.get('oobCode');

      console.log('login mode: ', mode);

      switch(mode) {

        case 'signOut':
        this.signOut();
        break;

        case 'promptEmail':
        this.verifyEmail( this.code );
        break;

        // Apply the action code in case of email revert or verification
        case 'verifyEmail':
        case 'recoverEmail':

        if(this.code) {
          this.auth.applyActionCode( this.code )
            .catch( error => this.showError(error.code) );
        }
        break;        
      }

      this.switchPage(mode as loginAction);
    });
    */
  }

  get currentPage() { return this.pages[this.page || 'signIn']; }

  private switchPage(page: loginAction) {

    // Removes all the controls from the form group
    Object.keys(this.form.controls).forEach( control => {
      this.form.removeControl(control);
    });
    
    // Add the relevant controls to the form according to selected page
    switch(this.page = page) {

      case 'register':
      this.form.addControl('name', this.name);
      this.form.addControl('email', this.email);
      this.form.addControl('password', this.password);
      break;

      default:
      case 'signIn':
      this.form.addControl('email', this.email);
      this.form.addControl('password', this.password);      
      break;

      case 'forgotPassword':
      this.form.addControl('email', this.email);
      break;

      case 'resetPassword':
      this.form.addControl('newPassword', this.newPassword);
      break;

      case 'changePassword':
      this.form.addControl('password', this.password);
      this.form.addControl('newPassword', this.newPassword);
      break;

      case 'changeEmail':
      this.form.addControl('password', this.password);
      this.form.addControl('newEmail', this.newEmail);
      break;

      case 'delete':
      this.form.addControl('password', this.password);      
      break;

      // Formless page
      case 'promptEmail':
      case 'verifyEmail':
      case 'recoverEmail':
      break;
    }
  }

  private showError(error: string) {

    this.error = error;
    this.progress = false;
    setTimeout(() => this.error = null, 5000);
  }

  private reportSuccess(message: string, jumpTo?: string) {
    
    this.progress = false;
    
    console.log(message);
/*
    if(jumpTo) {
      
      this.router.navigate(['.'], { 
        relativeTo: this.route,
        queryParams: {
          mode: jumpTo
        } 
      });
    }*/
  }

  public activate(action: loginAction) {
    
    switch(action) {

      default:
      case 'signIn':
      this.signIn( this.email.value, this.password.value );
      break;

      case 'register':
      this.registerNew( this.email.value, this.password.value, this.name.value );
      break;

      case 'forgotPassword':
      this.forgotPassword( this.email.value );
      break;

      case 'resetPassword':
      this.resetPassword(this.code, this.newPassword.value );
      break;

      case 'changePassword':
      this.updatePassword( this.password.value, this.newPassword.value );
      break;

      case 'changeEmail':
      this.updateEmail( this.password.value, this.newEmail.value );
      break;

      case 'delete':
      this.deleteAccount( this.password.value );
      break;
    }
  }

  private signInWith(provider: string) { 

    this.progress = true;;

    // Signing-in with a provider    
    this.auth.signInWith( provider )
      .then( user => this.reportSuccess('Signed in using ' + provider) )
      .catch( error => {
        // Keep the rror code on failure
        this.showError(error.code);
      })
  }

  private signIn(email: string, password: string) {
    
    this.progress = true;

    // Sign-in using email/password
    this.auth.signIn(email, password)
      // Closes the dialog returning the user
      .then( user => this.ref.close(user) )
      // Keep the rror code on failure
      .catch( error => this.showError(error.code) );
  }

  private registerNew(email: string, password: string,name: string) {

    this.progress = true;

    // Registering a new user with a email/password
    this.auth.registerNew(email, password, name )
      .then( () => this.reportSuccess('Registered as ' + email) )
      .catch( error => {
        // Keep the rror code on failure
        this.showError(error.code);
      });
  }

  private verifyEmail(code?: string) {
    
    this.progress = true;

    // When a verification code is specified, we treat the request as a confirmation
    if(code) {

      this.auth.applyActionCode(code)
        .then( () => this.reportSuccess('Email verified') )
        .catch( error => {
          // Keep the error code on failure
          this.showError(error.code);
        });
    }
    else { // Otherwise, we treat the request to send a verification email

      this.auth.sendEmailVerification()
      .then( () => this.reportSuccess('Email verification sent') )
      .catch( error => {
        // Keep the error code on failure
        this.showError(error.code);
      });
    }
  }

  private forgotPassword(email: string) {
    
    this.progress = true;

    this.auth.forgotPassword(email)
      .then( () => this.reportSuccess('Request a password reset for' + email) )
      .catch( error => {
        // Keep the rror code on failure
        this.showError(error.code);
      })
  }

  private resetPassword(code: string, newPassword: string) {

    this.progress = true;

    this.auth.resetPassword(code, newPassword)
      .then( () => this.reportSuccess('Reset to a new password', 'signIn') )
      .catch( error => {
        // Keep the rror code on failure
        this.showError(error.code);
      })
  }

  private updateEmail(password: string, newEmail: string) {

    this.progress = true;
   /*
    this.auth.updateEmail(password, newEmail)
      .then( () => this.reportSuccess('Email updated to ' + newEmail) )
      .catch( error => {
        // Keep the rror code on failure
        this.showError(error.code);
      })*/
  }

  private updatePassword(password: string, newPassword: string) {

    this.progress = true;
/*
    this.auth.updatePassword(password, newPassword)
      .then( () => this.reportSuccess('Password updated') )
      .catch( error => {
        // Keep the rror code on failure
        this.showError(error.code);
      })*/
  }

  private deleteAccount(password: string) {

    this.progress = true;
  /*
    this.auth.deleteUser(password)
      .then( () => {
        this.reportSuccess('Account deleted', 'signIn');
      })
      .catch( error => {
        // Keep the rror code on failure
        this.showError(error.code);
      })*/
  }
}  
