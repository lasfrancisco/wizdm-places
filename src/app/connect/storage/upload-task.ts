import { AngularFireUploadTask } from '@angular/fire/storage';
import { StorageFolder } from './storage-folder';
import { Observable, merge, of } from 'rxjs';
import { switchMap, takeWhile, map, filter, take, expand } from 'rxjs/operators';

export class UploadTask {

  constructor(private task: AngularFireUploadTask) {}
}