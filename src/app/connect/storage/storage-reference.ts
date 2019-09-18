import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { StorageService, stReference, stUploadTask, stSettableMetadata, stUploadMetadata, stListResult, stListOptions } from './storage.service';
import { createStorageRef } from '@angular/fire/storage';
import { expand, takeWhile, switchMap } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';

/** Wraps the AngularFireStorageReference adding list() and listAll() functionalities */
export class StorageReference {

  readonly inner: AngularFireStorageReference;

  constructor(readonly ref: stReference, readonly st: StorageService) { 

    this.inner = createStorageRef(ref, st.scheduler);
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

    return this.st.scheduler.keepUnstableUntilFirst(
      this.st.scheduler.runOutsideAngular(
        from(this.st.scheduler.zone.runOutsideAngular(
          () => this.ref.list(options)
        ))
      )
    );
  }

  public listAll(): Observable<stListResult> {

    return this.st.scheduler.keepUnstableUntilFirst(
      this.st.scheduler.runOutsideAngular(
        from(this.st.scheduler.zone.runOutsideAngular(
          () => this.ref.listAll()
        ))
      )
    );
  }

  public wipe(): Promise<void> {

    // Starts a deletion process recursively
    return of(true).pipe(
      expand(() => this.deleteNext() ),
      takeWhile( next => next )
    ).toPromise().then( () => {} );
  }

 // Helper to delete stored files once at a time
  private deleteNext(): Observable<boolean> {

    return this.list({ maxResults: 1 })
      .pipe( switchMap( res => { 

        if

        res.prefixes.forEach( ref => this.st.ref(ref).wipe);


    // Gets a snapshot of 1 document in the collection
    return this.col(ref => ref.limit(1)).get()
      .pipe( switchMap( snap => {
        // Once there are no more documents in the snapshow we're done
        const docs = snap.docs;
        if(docs.length === 0) { return of(false); }
        // Gets the document data
        const file = docs[0].data();
        // Deletes the file from the storage than delete the docment from the collection
        return this.st.ref(file.path).delete()
          .pipe( 
            switchMap( () => docs[0].ref.delete() ),
            map( () => true ) 
          );
      }));
  }*/
} 