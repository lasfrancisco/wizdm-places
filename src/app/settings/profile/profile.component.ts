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
export class ProfileComponent {

  private document: DatabaseDocument<dbUser>;

  readonly photo$: Observable<string>;
  readonly form: FormGroup;

  get user() { return this.auth.user || {} as User };

  constructor(private auth: AuthService,private db: DatabaseService, private storage: StorageService, private builder: FormBuilder) {

    this.document = db.document(`users/${auth.userId}`);

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
    this.photo$ = this.document.stream().pipe( map( profile => !!profile ? profile.photo : '') );
  }

  // Loads the profile creating a default one when missing
  public load(): Promise<dbUser> {

    // Checks for a profile document
    return this.document.exists().then( exists => {
      // Whenever the profile doesn't exist...
      if(!exists) { 
        // Creates a profile from the user account object
        return this.document.set({

          name: this.user.displayName,
          email: this.user.email,
          photo: this.user.photoURL,
          bio: ''

        });
      }
    })
    // Loads the profile content
    .then( () => this.document.get() );
  }

  // Updates the profile
  public save(): Promise<void> { 

    return this.document.update(this.form.value)
      .then( () => this.form.markAsPristine() );
  }

  public uploadTask: UploadTask;

  public uploadPhoto(file: File): Promise<void> {

    if(!file) { return Promise.resolve(null); }

    // Creates the uploading task, this will display the progress bar in the view
    return ( this.uploadTask = this.storage.upload(`${this.auth.userId}/${file.name}`, file) )
      // Returns the url
      .then( snap => snap.ref.getDownloadURL() )
      // Updates the profile with the new url
      .then( photo => this.document.update({ photo }) )
      // Deletes the task object removing the progress bar from the view
      .then( () => (delete this.uploadTask, null) );
  }

  public deletePhoto(): Promise<void> {

    // Deletes the file in the storage first
    return this.deleteFile()
      // Resets the photo url into the profile
      .then( () => this.document.update({ photo: '' }) );
  }

  private deleteFile(): Promise<void> {
    // Reads the profile to get the photo url
    return this.document.get().then( profile => {
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
