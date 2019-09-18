import { Component, OnInit } from '@angular/core';
import { AuthService, User, DatabaseService, DatabaseDocument, StorageService } from '../../connect';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthGuard } from '../../utils/auth-guard.service';
import { dbUser } from '../../app.component';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
    this.photo$ = this.stream().pipe( map( profile => profile.photo ) );

    this.storage.ref(this.id).listAll()
      .subscribe( list => console.log(list) );    
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
    .then( () => this.get().toPromise() );
  }

  // Updates the profile
  public save(): Promise<void> { 

    return this.update(this.form.value)
      .then( () => this.form.markAsPristine() );
  }

  public upload(file: File) {

    if(!file) { return; }

    this.storage.upload(`${this.id}/${file.name}`, file)
      .then( snap => {

        console.log(snap);

        return snap.ref.getDownloadURL();

      }) 
      .then( photo => {

        console.log(photo);

        return this.update({ photo });
      } );
  }
}
