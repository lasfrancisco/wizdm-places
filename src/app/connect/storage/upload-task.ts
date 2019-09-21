import { stUploadTask, stUploadTaskSnapshot } from './storage.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class UploadTask {

  readonly inner$: Observable<stUploadTaskSnapshot>;

  constructor(readonly task: stUploadTask) {

    this.inner$ = new Observable(subscriber => {

      task.on('state_changed', 
      
        snap => subscriber.next(snap), 
        
        error => subscriber.error(error), 
        
        () => subscriber.complete() 
      );
      
      return () => task.cancel();
    });
  }

  public then(onFulfilled?: ((s: stUploadTaskSnapshot) => any) | null, onRejected?: ((e: Error) => any) | null): Promise<any> {
    return this.task.then(onFulfilled, onRejected);
  }

  public catch(onRejected: (e: Error) => any): Promise<any> {
    return this.task.catch(onRejected);
  }

  public pause(): boolean { return this.task.pause(); }

  public cancel(): boolean { return this.task.cancel(); }

  public resume(): boolean { return this.task.resume(); }
  
  public stream(): Observable<stUploadTaskSnapshot> { 
    return this.inner$; 
  }

  public progress(): Observable<number> {
    return this.inner$.pipe(
      map(s => s.bytesTransferred / s.totalBytes * 100)
    )
  }
}