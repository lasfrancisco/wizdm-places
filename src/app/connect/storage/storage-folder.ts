
import { AngularFireUploadTask } from '@angular/fire/storage';
import { StorageService } from './storage.service';
import { dbCommon } from '../database/database-document';
import { DatabaseCollection } from '../database/database-collection';
import { Observable, merge, of } from 'rxjs';
import { switchMap, takeWhile, map, filter, take, expand } from 'rxjs/operators';

export interface dbFile extends dbCommon {
  full?: string,
  name?: string,
  path?: string,
  size?: number,
  url?:  string,
  xfer?: number // bytes transferred during the upload
}

export class StorageFolder extends DatabaseCollection<dbFile> {

  /** Returns the instance of the AngularFire Store */
  get store() { return this.up.st; }

  constructor(readonly up: StorageService, path: string, public bucket: string) { 
    super(up.db, path);
  }

  // Computes a unique name based on current date and time
  private unique(name: string): string {
    return `${new Date().getTime()}_${name}`;
  }

  /**
   * Uploads a file storing the content into the given folder and traking the wmFile in the given database collection
   * @param file the file object to be uploaded and tracked
   * @returns the TaskSnapshot observable streaming the upload progress till completion
   */
  public upload(file: File, medatada?: any): Observable<dbFile> {

    // Computes the storage path
    const storePath = `${this.path}/${this.unique(file.name)}`;

    // Creates the upload task
    const task = this.store.upload(storePath, file, medatada);

    return new Observable<dbFile>(subscriber => {

      let file: dbFile = {};

      const sub = task.snapshotChanges().subscribe( 
        
        snap => subscriber.next(file = { 
          full: snap.ref.name,
          name: file.name,
          path: storePath,
          size: snap.totalBytes,
          xfer: snap.bytesTransferred
        }), 
        
        error => subscriber.error(error), 
      
        () => task.then( snap => snap.getDownloadURL() ).then( url => subscriber.next({...file, url }) )
      );

      return () => sub.unsubscribe();
    });  
  }

  /**
   * Simplified version of upload() executing the upload once
   * @param file file object to be uploaded
   * @returns a promise resolving to the wmFile
   */
  public uploadOnce(file: File): Promise<dbFile> {
    return this.upload(file).toPromise();
  }

  /**
   * Searches for the single file coming with the specified url
   * @param url the url of the file to be searched for
   * @returns a Promise of the requeste wmFile
   */
  public getFileByUrl(url: string): Promise<dbFile> {
    return this.get(ref => ref.where('url', '==', url) )
      .toPromise()
      .then( files => files[0] );
  }

   /**
   * Deletes a user uploaded file clearing up both the storage and the database document
   * @param id the file id
   */
  public deleteFile(name: string): Promise<void> {

    const doc = this.document(name);
    return doc.get().toPromise()
      .then( file => this.store.ref(file.path).delete() )
      .then( () => doc.delete() );
  }

  /** Deletes all the file in the storage */
  public deleteAll(): Promise<void> {

    // Starts a deletion process recursively
    return of(true).pipe(
      expand(() => this.deleteNext() ),
      takeWhile( next => next )
    ).toPromise().then( () => {} );
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
}