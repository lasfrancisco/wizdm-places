import { Injectable } from '@angular/core';
import { AuthService, DatabaseService, DatabaseDocument } from '../connect';

@Injectable({
  providedIn: 'root'
})
export class UserProfile {

  

  constructor(readonly auth: AuthService, readonly db: DatabaseService) { }

}