import { StorageFolder } from './storage-folder';
import { DatabaseDocument, dbCommon } from '../database/database-document';
import { Observable, merge, of } from 'rxjs';
import { switchMap, takeWhile, map, filter, take, expand } from 'rxjs/operators';

export interface dbFile extends dbCommon {
  name?:     string,
  fullName?: string,
  path?:     string,
  size?:     number,
  url?:      string,
  xfer?:     number // bytes transferred during the upload
}

export class StorageFile extends DatabaseDocument<dbFile> {

  get store() { return this.uploader.st; }
  get uploader() { return this.folder.up; }

  constructor(readonly folder: StorageFolder, id: string) { 
    super(folder.db, folder.path, id);
  }

   /**
   * Deletes a user uploaded file clearing up both the storage and the database document
   * @param id the file id
   */
  public delete(): Promise<void> {
    
    return this.get().toPromise()
      .then( file => this.store.ref(file.path).delete() )
      .then( () => super.delete() );
  }
}