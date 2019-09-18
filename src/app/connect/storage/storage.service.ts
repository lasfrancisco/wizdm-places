import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { StorageReference } from './storage-reference';
import { storage } from 'firebase/app';
//--
export type stReference        = storage.Reference;
export type stListOptions      = storage.ListOptions;
export type stListResult       = storage.ListResult;
export type stUploadMetadata   = storage.UploadMetadata;
export type stSettableMetadata = storage.SettableMetadata;
export type stUploadTask       = AngularFireUploadTask;

@Injectable()
export class StorageService {

  constructor(readonly st: AngularFireStorage) {}

  public ref(path: string): StorageReference {
    return new StorageReference(this.st, path);
  }

  public upload(path: string, data: any, metadata?: stUploadMetadata): stUploadTask { 
    return this.st.upload(path, data, metadata);
  }
}