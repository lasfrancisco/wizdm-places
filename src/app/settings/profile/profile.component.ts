import { Component, OnInit } from '@angular/core';
import { AuthService, User, StorageService, UploadTask } from '../../connect';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserProfile } from '../../utils/user-profile.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'wm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  readonly photo$: Observable<string>;
  readonly form: FormGroup;

  // Returns the AuthService
  private get auth(): AuthService { return this.profile.auth; }

  constructor(private profile: UserProfile, private storage: StorageService, private builder: FormBuilder) {

    // Builds the form controls group
    this.form = builder.group({
      'name' : ['', Validators.required ],
      'email': ['', Validators.email ],
      'photo': [''],
      'bio'  : ['']
    });

    // Loads the profile into the form once 
    this.profile.get().then( data => this.form.patchValue(data) ); 

    // Streams the profile photo
    this.photo$ = this.profile.stream().pipe( map( profile => !!profile ? profile.photo : '') );
  }

  // Updates the profile
  public save(): Promise<void> { 

    return this.profile.update(this.form.value)
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
      .then( photo => this.profile.update({ photo }) )
      // Deletes the task object removing the progress bar from the view
      .then( () => (delete this.uploadTask, null) );
  }

  public deletePhoto(): Promise<void> {

    // Deletes the file in the storage first
    return this.deleteFile()
      // Resets the photo url into the profile
      .then( () => this.profile.update({ photo: '' }) );
  }

  private deleteFile(): Promise<void> {
    // Reads the profile to get the photo url
    return this.profile.get().then( profile => {
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
