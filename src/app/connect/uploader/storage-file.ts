import { StorageFolder, dbFile } from './storage-folder';
import { DatabaseDocument } from '../database/database-document';
import { Observable, merge, of } from 'rxjs';
import { switchMap, takeWhile, map, filter, take, expand } from 'rxjs/operators';

export class StorageFile extends DatabaseDocument<dbFile> {

  constructor(readonly folder: StorageFolder, id: string) { 
    super(folder.db, folder.path, id);
  }
}