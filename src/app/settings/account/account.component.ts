import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthGuard } from '../../utils/auth-guard.service';

@Component({
  selector: 'wm-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  readonly form: FormGroup;

  constructor(private guard: AuthGuard, private builder: FormBuilder) { 

    this.form = builder.group({
      'name': ['', Validators.required],
      'email': ['', [ Validators.required, Validators.email ]],
      'message': ['', Validators.required]
    });

  }

  ngOnInit() {
  }

}