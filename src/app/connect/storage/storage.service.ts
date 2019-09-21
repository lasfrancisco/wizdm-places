import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { StorageReference } from './storage-reference';
import { UploadTask } from './upload-task';
import { storage } from 'firebase/app';
//--
export type stReference          = storage.Reference;
export type stListOptions        = storage.ListOptions;
export type stListResult         = storage.ListResult;
export type stUploadMetadata     = storage.UploadMetadata;
export type stSettableMetadata   = storage.SettableMetadata;
export type stFormat             = storage.StringFormat;
export type stUploadTask         = storage.UploadTask;
export type stUploadTaskSnapshot = storage.UploadTaskSnapshot;

@Injectable()
/** Wraps the AngularFireStorage service adding refFromURL() support */
export class StorageService {

  get storage() { return this.st.storage; }

  constructor(readonly st: AngularFireStorage) {}

  /** Returns a reference to the storage object identified by its path */
  public ref(path: string|stReference): StorageReference {
    const ref = typeof path === 'string' ? this.storage.ref(path) : path;
    return new StorageReference(ref, this);
  }

  /** Returns a reference to the storage object identified by its download URL */
  public refFromURL(url: string): StorageReference {
    return new StorageReference( this.storage.refFromURL(url), this);
  }

  /** Shortcut to start an upload task of binary data */
  public upload(path: string, data: Blob|Uint8Array|ArrayBuffer, metadata?: stUploadMetadata): UploadTask { 
    return this.ref(path).put(data, metadata);
  }
}