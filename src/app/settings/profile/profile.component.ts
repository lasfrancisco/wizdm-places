import { Component, OnInit } from '@angular/core';
import { AuthService, User, DatabaseService, DatabaseDocument, StorageService, UploadTask } from '../../connect';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthGuard } from '../../utils/auth-guard.service';
import { dbUser } from '../../app.component';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'wm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends DatabaseDocument<dbUser> {

  readonly photo$: Observable<string>;
  readonly form: FormGroup;

  get user() { return this.auth.user || {} as User };

  constructor(private auth: AuthService, db: DatabaseService, private storage: StorageService, private builder: FormBuilder) { 
    super(db, 'users', auth.userId);

    // Builds the form controls group
    this.form = builder.group({
      'name' : ['', Validators.required ],
      'email': ['', Validators.email ],
      'photo': [''],
      'bio'  : ['']
    });

    // Loads the profile into the form once 
    this.load().then( data => this.form.patchValue(data) ); 

    // Streams the profile photo
    this.photo$ = this.stream().pipe( map( profile => !!profile ? profile.photo : '') );
  }

  // Loads the profile creating a default one when missing
  public load(): Promise<dbUser> {

    // Checks for a profile document
    return this.exists().then( exists => {
      // Whenever the profile doesn't exist...
      if(!exists) { 
        // Creates a profile from the user account object
        return this.set({

          name: this.user.displayName,
          email: this.user.email,
          photo: this.user.photoURL,
          bio: ''

        });
      }
    })
    // Loads the profile content
    .then( () => this.get() );
  }

  // Updates the profile
  public save(): Promise<void> { 

    return this.update(this.form.value)
      .then( () => this.form.markAsPristine() );
  }

  public uploadTask: UploadTask;

  public uploadPhoto(file: File) {

    if(!file) { return Promise.resolve(null); }

    ( this.uploadTask = this.storage.upload(`${this.id}/${file.name}`, file) )
      .then( snap => snap.ref.getDownloadURL() )
      .then( photo => this.update({ photo }) )
      .then( () => delete this.uploadTask );

    // Uploads the file
    /*return this.uploadFile(file)
      // Updates the profile with the new url
      .then( photo => this.update({ photo }) );*/
  }

  public deletePhoto(): Promise<void> {

    // Deletes the file in the storage first
    return this.deleteFile()
      // Resets the photo url into the profile
      .then( () => this.update({ photo: '' }) );
  }

  private uploadFile(file: File): Promise<string> {
    // Uploads the file
    return this.storage.upload(`${this.id}/${file.name}`, file)
      // Returns the url
      .then( snap => snap.ref.getDownloadURL() );
  }

  private deleteFile(): Promise<void> {
    // Reads the profile to get the photo url
    return this.get().then( profile => {
      // Skips then no file
      if(!profile || !profile.photo) { return null; }
      // Gets the storage ref from the url...
      const ref = this.storage.refFromURL(profile.photo);
      //... and deletes the file
      return ref.delete();
    })
    // Ensure to proceed whatever error has been encountered
    .catch( e => null );
  }
}
