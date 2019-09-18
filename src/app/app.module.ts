import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatDialogModule } from '@angular/material/dialog';
import { ConnectModule, ConnectConfig, AuthModule, DatabaseModule, StorageModule } from './connect';
import { LoginModule } from './login/login.module';
import { PlacesModule } from './places/places.module';
import { SettingsModule } from './settings/settings.module';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';

// Firebase configuration for wizdm experiments
const config: ConnectConfig = {
  appname: 'wizdm-experiments',
  firebase: {
    apiKey: "AIzaSyDhq3U__FKV4IUCvl02s5jVgChisX2jcmY",
    authDomain: "wizdm-experiments.firebaseapp.com",
    databaseURL: "https://wizdm-experiments.firebaseio.com",
    projectId: "wizdm-experiments",
    storageBucket: "wizdm-experiments.appspot.com",
    messagingSenderId: "479013715916"
  }
};

// Define navigation routes
const routes: Routes = [

  { path: 'not-found', component: NotFoundComponent },  

  { path: '', redirectTo: 'places', pathMatch: 'full' },

  { path: '**', redirectTo: 'not-found', pathMatch: 'full' }

];

@NgModule({
  imports:      [   
    BrowserModule, 
    BrowserAnimationsModule,
    FlexLayoutModule, 
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,

    // Initialize the connect module
    ConnectModule.init(config),
    AuthModule, 
    DatabaseModule,
    StorageModule,
    LoginModule,
    PlacesModule,
    SettingsModule,
    RouterModule.forRoot(routes)
  ],
  
  declarations: [ 
    AppComponent,  
    NotFoundComponent
  ],
  
  bootstrap: [ AppComponent ]
})
export class AppModule { }
