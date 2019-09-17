import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { DatabaseModule } from '../database/database.module';
import { StorageService } from './storage.service';

@NgModule({
  imports: [
    CommonModule,
    DatabaseModule,
    AngularFireStorageModule
  ],
  providers: [ StorageService ]
})
export class UploaderModule { }