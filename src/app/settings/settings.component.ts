import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../utils/auth-guard.service';

@Component({
  selector: 'wm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  constructor(readonly auth: AuthGuard) {}
  
}