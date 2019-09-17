
import { UploaderService } from './uploader.service';
import { DatabaseCollection } from '../database/database-collection';
import { StorageFile, dbFile } from './storage-file';
import { Observable, merge, of } from 'rxjs';
import { switchMap, takeWhile, map, filter, take, expand } from 'rxjs/operators';

export class StorageFolder extends DatabaseCollection<dbFile> {

  get store() { return this.up.st; }

  constructor(readonly up: UploaderService, path: string, public bucket: string) { 
    super(up.db, path);
  }

  public file(name: string): StorageFile {
    return new StorageFile(this, name);
  }

   // Helper to delete stored files once at a time
  private deleteNext(): Observable<boolean> {
    // Gets a snapshot of 1 document in the collection
    return this.col(ref => ref.limit(1)).get()
      .pipe( switchMap( snap => {
        // Once there are no more documents in the snapshow we're done
        const docs = snap.docs;
        if(docs.length === 0) { return of(false); }
        // Gets the document data
        const file = docs[0].data();
        // Deletes the file from the storage than delete the docment from the collection
        return this.store.ref(file.path).delete()
          .pipe( 
            switchMap( () => docs[0].ref.delete() ),
            map( () => true ) 
          );
      }));
  }

  /** Deletes all the file in the storage */
  public deleteAll(): Promise<void> {

    // Starts a deletion process recursively
    return of(true).pipe(
      expand(() => this.deleteNext() ),
      takeWhile( next => next )
    ).toPromise().then( () => {} );
  }
}