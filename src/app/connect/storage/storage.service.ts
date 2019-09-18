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
/** Wraps the AngularFireStorage adding refFromURL() support */
export class StorageService {

  get storage() { return this.st.storage; }
  get scheduler() { return this.st.scheduler; }

  constructor(readonly st: AngularFireStorage) {}

  public ref(path: string|stReference): StorageReference {

    const ref = typeof path === 'string' ? this.storage.ref(path) : path;

    return new StorageReference(ref, this.scheduler);
  }

  public refFromURL(url: string): StorageReference {

    const ref = this.storage.refFromURL(url);

    return new StorageReference(ref, this.scheduler);
  }

  public upload(path: string, data: any, metadata?: stUploadMetadata): stUploadTask { 
    return this.st.upload(path, data, metadata);
  }
}