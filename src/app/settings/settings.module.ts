import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SettingsComponent } from './settings.component';
import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './account/account.component';
import { AuthGuard } from '../utils/auth-guard.service';

const routes: Routes = [
  
  { path: 'profile', redirectTo: 'settings/profile', pathMatch: 'full' },
  { path: 'account', redirectTo: 'settings/account', pathMatch: 'full' },
  
  { path: 'settings', component: SettingsComponent, canActivate: [ AuthGuard ],
    
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
      { path: 'account', component: AccountComponent }
    ]
  } 
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    SettingsComponent,
    ProfileComponent, 
    AccountComponent
  ],
  exports: [ RouterModule ]
})
export class SettingsModule { }