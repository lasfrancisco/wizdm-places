import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, User } from 'firebase';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
//--
export { User } from 'firebase';

@Injectable()
/** Wraps the AngularFireAuth service for extended functionalities */
export class AuthService implements OnDestroy {

  // Wraps AngularFireAuth basic functionalities

  /** Firebase Auth instance */
  get auth() { return this.fire.auth; }
  /** Observable of authentication state; as of Firebase 4.0 this is only triggered via sign-in/out */
  get authState$() { return this.fire.authState; }
  /** Observable of the currently signed-in user's JWT token used to identify the user to a Firebase service (or null) */
  get idToken$() {return this.fire.idToken; }
  /** Observable of the currently signed-in user (or null) */
  get user$() { return this.fire.user; }

  // Persists a User object snapshot

  /** User object snapshot */
  public user: User = null;
  private sub: Subscription;
  
  constructor(readonly fire: AngularFireAuth) {
    // Keeps a snapshot of the current user object
    this.sub = this.user$.subscribe( user => {
      this.user = user;
    });
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  // Extends the Auth service features

  /** Returns true if user is logged in */
  get authenticated(): boolean {
    return !!this.user;
  }

  /** Returns the current user id, when authenticated */
  get userId(): string {
    return this.authenticated ? this.user.uid : '';
  }

   /** Returns true whenever the current user email has been verified */
  get emailVerified(): boolean {
    return this.authenticated ? this.user.emailVerified : false;
  }

  /** Sets/Gets the code for the language to be used during the authentication */
  set language(code: string) { this.auth.languageCode = code; }
  get language(): string { return this.auth.languageCode; }

  /**
   * Registers a new user by email and confirmPasswordReset
   * @param email the email to register with
   * @param password the secret password
   * @param name (optional) the user name
   */
  public registerNew(email: string, password: string, name: string = ""): Promise<void> {
    
    console.log("Registering a new user: " + email);
    // Create a new user with email and password
    return this.auth.createUserWithEmailAndPassword(email, password)
      // Update the user info with the given name
      .then( credential => credential.user.updateProfile({ displayName: name } as User));
  }

  /**
   * Signs in with the given user email and password
   * @param email the email to register with
   * @param password the secret password 
   * @returns the authenticated User object
   */
  public signIn(email: string, password: string): Promise<User>  {
    
    console.log("Signing in as: " + email);

    return this.auth.signInWithEmailAndPassword(email, password)
      .then( credential => credential.user );
  }

  /** 
   * Refreshes the current authentication repeating the secret password 
   * @param password the secret password 
   * @returns the authenticated User object
   */
  public refresh(password: string): Promise<User> {

    console.log("Refreshing authentication: ", this.user.email);
    // Gets fresh credentials for the current user
    const credential = auth.EmailAuthProvider.credential(this.user.email, password);
    // Re-authenticate the user with the fresh credentials
    return this.user.reauthenticateAndRetrieveDataWithCredential(credential)
      .then( credential => credential.user );
  }

  /** 
   * Signs in using the given provider 
   * @param provider the name of the provider to sign in with
   * @returns the authenticated User object
   */
  public signInWith(provider: string): Promise<User> {

    console.log("Signing-in using: " + provider);

    let authProvider = null;

    switch(provider) {

      case 'google':
      authProvider = new auth.GoogleAuthProvider();
      break;

      case 'facebook':
      authProvider = new auth.FacebookAuthProvider();
      break;
 
      case 'twitter':
      authProvider = new auth.TwitterAuthProvider();
      break;
      
      case 'github':
      authProvider = new auth.GithubAuthProvider();
      break;
      
      case 'linkedin':// TODO
      break;
    }

   if(authProvider === null) {
      return Promise.reject({
        code: 'auth/unsupported-provider',
        message: 'Unsupported provider'
      });
    }

    return this.auth.signInWithPopup(authProvider)
      .then( credential => credential.user );
  }

  /** Signs out */
  public signOut(): Promise<void> {
    console.log("Signing-out");
    return this.auth.signOut();
  }

  /**
   * Sends an email to the user to verify the account email
   * @param url (optional) the link to be passed as the continueUrl query parameter
   */
  public sendEmailVerification(url?: string): Promise<void> {

    console.log("Send email veriication");
    
    return this.authenticated ? 
      this.user.sendEmailVerification( url ? { url } : undefined ) 
        : Promise.resolve();
  }

  
  /** Applies the received action code to complete the requested action */
  public applyActionCode(code: string): Promise<void> {

    console.log("Applying action with code: " + code);
    return this.auth.applyActionCode(code);
  }

  /**
   * Sends an email to the user to resets the account password
   * @param url (optional) the link to be passed as the continueUrl query parameter
   */
  public sendPasswordResetEmail(email: string, url?: string): Promise<void> {
    
    console.log("Resetting the password for: " + email);
    // Send a password reset email
    return this.authenticated ? 
      this.auth.sendPasswordResetEmail(email, url ? { url } : undefined ) 
        : Promise.resolve();
  }

  /** Confirms the new password completing a reset */
  public confirmPasswordReset(code: string, newPassword: string): Promise<void> {

    console.log("Confirming the password with code: " + code);
    // Resets to a new password applying the received activation code
    return this.auth.confirmPasswordReset(code, newPassword);
  }

/*
  public updateEmail(password: string, newEmail: string): Promise<void> {
    
    const email = this.user.email;
    console.log("Updating user email for: ", email);
    // Gets fresh credentials for the current user
    const credential = auth.EmailAuthProvider.credential(email, password);
    // Re-authenticate the user with the fresh credentials
    return this.user.reauthenticateAndRetrieveDataWithCredential(credential)
      // Update the email
      .then( credential => credential.user.updateEmail(newEmail) );
  }

  public updatePassword(password: string, newPassword: string): Promise<void> {
    
    const email = this.user.email;
    console.log("Updating user password for: ", email);
    // Gets fresh credentials for the current user
    const credential = auth.EmailAuthProvider.credential(email, password);
    // Re-authenticate the user with the fresh credentials
    return this.user.reauthenticateAndRetrieveDataWithCredential(credential)
      // Update the password
      .then( credential => credential.user.updatePassword(newPassword) );
  }
*/

  /**
   * Deletes the user account
   * @param password the user password to confirm deletion
   * @param dispone an optionl function invoked during the process to dispose for other user related resources
   */
  /*
  public deleteUser(password: string): Promise<void> {

    console.log("Deleting the user ", this.user.email);
    // Gets fresh credentials for the current user
    const credential = auth.EmailAuthProvider.credential(this.user.email, password);
    // Re-authenticate the user with the fresh credentials
    return this.user.reauthenticateAndRetrieveDataWithCredential(credential)
      // Deletes the account and sign-out
      .then( credential => credential.user.delete() );
  }*/
}