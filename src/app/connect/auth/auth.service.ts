import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, User } from 'firebase';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
//--
export { User } from 'firebase';

@Injectable()
export class AuthService implements OnDestroy {

  public user: User = null;
  private sub: Subscription;
  
  get user$(): Observable<User|null> {
    return this.fire.user;
  }
  
  constructor(readonly fire: AngularFireAuth) {
    // Keeps a snapshot of the current user object
    this.sub = this.user$.subscribe( user => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Returns true if user is logged in
  get authenticated(): boolean {
    return !!this.user;
  }

  // User id helper
  get userId(): string {
    return this.authenticated ? this.user.uid : '';
  }

   // Email verified helper
  get emailVerified(): boolean {
    return this.authenticated ? this.user.emailVerified : false;
  }

  set language(code: string) {
    this.fire.auth.languageCode = code;
  }

  get language(): string {
    return this.fire.auth.languageCode;
  }

  /**
   * Registers a new user
   */
  public registerNew(email: string, password: string, name: string = ""): Promise<void> {
    
    console.log("Registering a new user: " + email);
    // Create a new user with email and password
    return this.fire.auth.createUserWithEmailAndPassword(email, password)
      // Update the user info with the given name
      .then( credential => credential.user.updateProfile({ displayName: name } as User));
  }

  /**
   * Sends an email verification
   */
  public sendEmailVerification(url?: string): Promise<void> {

    console.log("Send email veriication");
    
    return this.authenticated ? 
      this.user.sendEmailVerification( url ? { url } : undefined ) 
        : Promise.resolve();
  }

  public applyActionCode(code: string): Promise<void> {

    console.log("Applying action with code: " + code);
    // Applies the received action code
    return this.fire.auth.applyActionCode(code);
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
  public signIn(email: string, password: string): Promise<User>  {
    
    console.log("Signing in as: " + email);

    return this.fire.auth.signInWithEmailAndPassword(email, password)
      .then( credential => credential.user );
  }

  public refresh(password: string): Promise<User> {

    //if(!this.authenticated) { return Promise.resolve(null); }
    
    console.log("Refreshing authentication: ", this.user.email);
    // Gets fresh credentials for the current user
    const credential = auth.EmailAuthProvider.credential(this.user.email, password);
    // Re-authenticate the user with the fresh credentials
    return this.user.reauthenticateAndRetrieveDataWithCredential(credential)
      .then( credential => credential.user );
  }

   public forgotPassword(email: string, lang?: string, url?: string): Promise<void> {
    
    console.log("Resetting the password for: " + email);
    // Send a password reset email
    return this.authenticated ? 
      this.fire.auth.sendPasswordResetEmail(email, url ? { url } : undefined ) 
        : Promise.resolve();
  }

   public resetPassword(code: string, newPassword: string): Promise<void> {

    console.log("Confirming the password with code: " + code);
    // Resets to a new password applying the received activation code
    return this.fire.auth.confirmPasswordReset(code, newPassword);
  }

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

    return this.fire.auth.signInWithPopup(authProvider)
      .then( credential => credential.user );
  }

  public signOut(): Promise<void> {
    console.log("Signing-out");
    return this.fire.auth.signOut();
  }

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