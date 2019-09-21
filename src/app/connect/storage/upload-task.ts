import { stUploadTask, stUploadTaskSnapshot } from './storage.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class UploadTask {

  readonly inner$: Observable<stUploadTaskSnapshot>;

  constructor(readonly task: stUploadTask) {

    // Build the uploading progress observable
    this.inner$ = new Observable(subscriber => {
      // Connects the task.on() callbacks
      task.on('state_changed',
        snap => subscriber.next(snap), 
        error => subscriber.error(error),
        () => subscriber.complete() 
      );
      // Returns the unsubscription handler
      return () => task.cancel();
    });
  }

  /** Pauses the task */
  public pause(): boolean { return this.task.pause(); }
  /** Resumes the task */
  public resume(): boolean { return this.task.resume(); }
  /** Cancels the task */
  public cancel(): boolean { return this.task.cancel(); }  

  /** Promise-like then */
  public then(fulfilled?: ((s: stUploadTaskSnapshot) => any) | null, rejected?: ((e: Error) => any) | null): Promise<any> {
    return this.task.then(fulfilled, rejected);
  }
  /** Promise-like catch */
  public catch(rejected: (e: Error) => any): Promise<any> {
    return this.task.catch(rejected);
  }
  /** Returns the observable streaming the task progress */
  public stream(): Observable<stUploadTaskSnapshot> { 
    return this.inner$; 
  }
  /** Returns an observable streaming the task progress as percentage */
  public progress(): Observable<number> {
    return this.inner$.pipe(
      map(s => s.bytesTransferred / s.totalBytes * 100)
    )
  }
}