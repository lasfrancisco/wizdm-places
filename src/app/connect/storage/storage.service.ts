import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { storage } from 'firebase/app';

export type stUploadMetadata = storage.UploadMetadata;
export type stSettableMetadata = storage.SettableMetadata;
export type stListResult =  storage.ListResult;

@Injectable()
export class StorageService {

  constructor(readonly st: AngularFireStorage) {}

  public upload(path: string, data: any, metadata?: stUploadMetadata) { 

    return this.st.upload(path, data, metadata);

  }

  public list(path)
}