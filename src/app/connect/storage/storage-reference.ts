import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { stUploadTask, stSettableMetadata, stUploadMetadata, stListResult, stListOptions } from './storage.service';
import { Observable, from } from 'rxjs';

/** Wraps the AngularFireStorageReference adding list() and listAll() functionalities */
export class StorageReference {

  readonly ref: AngularFireStorageReference;

  constructor(readonly st: AngularFireStorage, readonly path: string) { 

    this.ref = st.ref(path);
  }

  public getDownloadURL(): Observable<string> { return this.ref.getDownloadURL(); }

  public getMetadata(): Observable<stUploadMetadata>{ return this.ref.getMetadata(); }
  
  public delete(): Observable<any>{ return this.ref.delete(); }

  public child(path: string): any { return this.ref.child(path); }

  public updateMetadata(meta: stSettableMetadata): Observable<any> 
    { return this.ref.updateMetadata(meta); }

  public put(data: any, metadata?: stUploadMetadata): stUploadTask {
    return this.ref.put(data, metadata);
  }

  public putString(data: string, format?: string, metadata?: stUploadMetadata): stUploadTask {
    return this.ref.putString(data, format, metadata);
  }

  public list(options?: stListOptions): Observable<stListResult> {

    const ref = this.st.storage.ref(this.path);

    return this.st.scheduler.keepUnstableUntilFirst(
      this.st.scheduler.runOutsideAngular(
        from(this.st.scheduler.zone.runOutsideAngular(
          () => ref.list(options)
        ))
      )
    );
  }

  public listAll(): Observable<stListResult> {

    const ref = this.st.storage.ref(this.path);

    return this.st.scheduler.keepUnstableUntilFirst(
      this.st.scheduler.runOutsideAngular(
        from(this.st.scheduler.zone.runOutsideAngular(
          () => ref.listAll()
        ))
      )
    );
  }
} 