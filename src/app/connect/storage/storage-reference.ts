import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { StorageService, stReference, stUploadTask, stSettableMetadata, stUploadMetadata, stListResult, stListOptions } from './storage.service';
import { createStorageRef } from '@angular/fire/storage';
import { map, expand, takeWhile, switchMap } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';

/** Wraps the AngularFireStorageReference including list() and listAll() functionalities recently added to firebase API */
export class StorageReference {

  readonly inner: AngularFireStorageReference;

  constructor(readonly ref: stReference, readonly st: StorageService) { 

    this.inner = createStorageRef(ref, st.scheduler);
  }

  public getDownloadURL(): Promise<string> { 
    return this.ref.getDownloadURL(); 
  }

  public getMetadata(): Promise<stUploadMetadata>{ 
    return this.ref.getMetadata(); 
  }
  
  public delete(): Promise<void> { 
    return this.ref.delete(); 
  }

  public child(path: string): StorageReference { 
    return this.st.ref( this.ref.child(path) ); 
  }

  public updateMetadata(meta: stSettableMetadata): Promise<any> { 
    return this.ref.updateMetadata(meta); 
  }

  public put(data: any, metadata?: stUploadMetadata): stUploadTask {
    return this.inner.put(data, metadata);
  }

  public putString(data: string, format?: string, metadata?: stUploadMetadata): stUploadTask {
    return this.inner.putString(data, format, metadata);
  }

  public list(options?: stListOptions): Promise<stListResult> {

    return this.ref.list(options);
  }

  public listAll(): Promise<stListResult> {

    return this.ref.listAll();
  }  
} 