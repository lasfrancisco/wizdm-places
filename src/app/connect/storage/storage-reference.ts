import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { stReference, stUploadTask, stSettableMetadata, stUploadMetadata, stListResult, stListOptions } from './storage.service';
import { createStorageRef } from '@angular/fire/storage';
import { FirebaseZoneScheduler } from '@angular/fire';
import { Observable, from } from 'rxjs';

/** Wraps the AngularFireStorageReference adding list() and listAll() functionalities */
export class StorageReference {

  readonly inner: AngularFireStorageReference;

  constructor(readonly ref: stReference, private scheduler: FirebaseZoneScheduler) { 

    this.inner = createStorageRef(ref, scheduler);
  }

  public getDownloadURL(): Observable<string> { return this.inner.getDownloadURL(); }

  public getMetadata(): Observable<stUploadMetadata>{ return this.inner.getMetadata(); }
  
  public delete(): Observable<any>{ return this.inner.delete(); }

  public child(path: string): any { return this.inner.child(path); }

  public updateMetadata(meta: stSettableMetadata): Observable<any> 
    { return this.inner.updateMetadata(meta); }

  public put(data: any, metadata?: stUploadMetadata): stUploadTask {
    return this.inner.put(data, metadata);
  }

  public putString(data: string, format?: string, metadata?: stUploadMetadata): stUploadTask {
    return this.inner.putString(data, format, metadata);
  }

  public list(options?: stListOptions): Observable<stListResult> {

    return this.scheduler.keepUnstableUntilFirst(
      this.scheduler.runOutsideAngular(
        from(this.scheduler.zone.runOutsideAngular(
          () => this.ref.list(options)
        ))
      )
    );
  }

  public listAll(): Observable<stListResult> {

    return this.scheduler.keepUnstableUntilFirst(
      this.scheduler.runOutsideAngular(
        from(this.scheduler.zone.runOutsideAngular(
          () => this.ref.listAll()
        ))
      )
    );
  }
} 