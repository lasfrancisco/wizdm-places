import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatabaseService } from '../database/database.service';
import { StorageFolder } from './storage-folder';
import { Observable, merge, of } from 'rxjs';
import { switchMap, takeWhile, map, filter, take, expand } from 'rxjs/operators';

@Injectable()
export class StorageService {

  constructor(readonly db: DatabaseService, readonly st: AngularFireStorage) {}

  public folder(path: string, bucket: string): StorageFolder {
    return new StorageFolder(this, path, bucket);
  }

  /**
   * Searches for the single file coming with the specified url
   * @param url the url of the file to be searched for
   * @returns a Promise of the requeste wmFile
   *
  public getByUrl(url: string): Promise<wmFile> {
    return this.get(ref => ref.where('url', '==', url) )
      .toPromise()
      .then( files => files[0] );
  }*/

  /**
   * Searches for the single file coming with the specified url
   * and stream it (aka realtime support) into an observable.
   * @param url the url of the file to be searched for
   * @returns an Observable of the requeste wmFile
   *
  public streamByUrl(url: string): Observable<wmFile> {
    return this.stream(ref => ref.where('url', '==', url) )
      .pipe( map( files => files[0] ) )
  }*/



  /**
   * Uploads a file storing the content into the given folder and traking the wmFile in the given database collection
   * @param file the file object to be uploaded and tracked
   * @returns the TaskSnapshot observable streaming the upload progress till completion
   *
  public upload(file: File): Observable<wmFile> {

    // Computes the storage path
    const storePath = `${this.folder}/${this.unique(file.name)}`;

    // Creates the upload task
    const task = this.st.upload(storePath, file);

    // Merges two snapshotChanges observables
    return merge(
      // During the transfer, maps the snapshot to a wmFile tracking the progress in xfer
      // with a simple map, this allow for minimized latency and better progress preview
      task.snapshotChanges().pipe( 
        map( snap => { 
          return { 
            name: file.name,
            fullName: snap.ref.name,
            path: storePath,
            size: snap.totalBytes,
            xfer: snap.bytesTransferred
          };
       })
      ),
      // At completion, gets the download url, saves the file info into user's uploads area...
      task.snapshotChanges().pipe( 
        filter( snap => snap.bytesTransferred === snap.totalBytes ),
        switchMap( snap => {
          // Compile the file content
          const result: wmFile = {
            name: file.name,
            fullName: snap.ref.name,
            path: storePath,
            size: snap.totalBytes,
          };
          // Gets the download url
          return snap.ref.getDownloadURL()
            // Saves the uploaded file information into the user uploads area
            .then( url => {
              return this.add({ ...result, url })
                // Returns a copy of the saved data including the id
                .then( doc => { 
                  const id = doc.id;
                  return { ...result, url, id }; 
                });
            });
        }),

        // This implementation do not reload the data from the database
        // to improve performances relying on the returned copy with id instead
        // switchMap( id => this.get(id) ),

        // Makes sure it completes
        take(1)
      )
    );
  }*/

  /**
   * Simplified version of upload() executing the upload once
   * @param file file object to be uploaded
   * @returns a promise resolving to the wmFile
   *
  public uploadOnce(file: File): Promise<wmFile> {
    return this.upload(file).toPromise();
  }*/
}