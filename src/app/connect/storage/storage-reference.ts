import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask, createStorageRef } from '@angular/fire/storage';
import { runInZone } from '@angular/fire';
import { StorageService, stReference, stUploadTask, stSettableMetadata, stUploadMetadata, stListResult, stListOptions } from './storage.service';
import { from } from 'rxjs';

/** Wraps the AngularFireStorageReference including list() and listAll() functionalities recently added to firebase API */
export class StorageReference {

  readonly inner: AngularFireStorageReference;

  constructor(readonly ref: stReference, readonly st: StorageService) { 

    this.inner = createStorageRef(ref, st.scheduler);
  }

  public getDownloadURL(): Promise<string> { 

    return this.inner.getDownloadURL().toPromise(); 
  }

  public getMetadata(): Promise<stUploadMetadata>{ 

    return this.inner.getMetadata().toPromise(); 
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

    return this.st.scheduler.keepUnstableUntilFirst(
      this.st.scheduler.runOutsideAngular(
        from(this.st.zone.runOutsideAngular(() => 
          this.ref.list(options)
        ))
      )
    ).toPromise();

    //return this.ref.list(options);
    return from(this.ref.list(options)).pipe(
      runInZone(this.st.zone)
    ).toPromise();
  }

  public listAll(): Promise<stListResult> {

    //return this.ref.listAll();
    return from(this.ref.listAll()).pipe(
      runInZone(this.st.zone)
    ).toPromise();
  }  
} 