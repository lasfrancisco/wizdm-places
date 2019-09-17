import { Component, OnInit } from '@angular/core';
import { AuthService, User, DatabaseService, DatabaseDocument } from '../../connect';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthGuard } from '../../utils/auth-guard.service';
import { dbUser } from '../../app.component';

@Component({
  selector: 'wm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends DatabaseDocument<dbUser> {

  readonly form: FormGroup;

  get user() { return this.auth.user || {} as User };

  constructor(private auth: AuthService, db: DatabaseService, private builder: FormBuilder) { 
    super(db, 'users', auth.userId);

    // Builds the form controls group
    this.form = builder.group({
      'name' : ['', Validators.required ],
      'email': ['', Validators.email ],
      'photo': [''],
      'bio'  : ['']
    });

    // Checks for a profile document
    this.exists().then( exists => {
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
    .then( () => this.get().toPromise() )
    // Updates the form accordingly
    .then( data => this.form.patchValue(data) ); 
  }

  // Updates the profile
  public save() { 

    this.update(this.form.value)
      .then( () => this.form.markAsPristine() );
  }
}
