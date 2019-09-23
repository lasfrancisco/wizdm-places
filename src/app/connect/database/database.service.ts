import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { DatabaseDocument } from './database-document'
import { DatabaseCollection } from './database-collection';
import { PagedCollection, PageConfig } from './database-paged';
import { DistributedCounter } from './database-counter';
import { firestore } from 'firebase/app';
//--
export type dbCollectionRef = firestore.CollectionReference;
export type dbDocumentRef = firestore.DocumentReference;
export type dbWriteBatch = firestore.WriteBatch;
export type dbTransaction = firestore.Transaction;
export type dbTimestamp = firestore.Timestamp;
export type dbPath = firestore.FieldPath;
export type dbValue = firestore.FieldValue;
export type dbGeopoint = firestore.GeoPoint;
export type dbQuery = firestore.Query;
export type dbStreamFn = (ref: dbCollectionRef | dbQuery) => dbQuery;

@Injectable()
/** Wraps the AngularFirestore service to support several enhancements */
export class DatabaseService {

  get firestore() { return this.afs.firestore; }

  constructor(readonly afs: AngularFirestore) { }

  /** Return a server timestamp palceholder (it'll turn into a timestamp serverside) */
  public get timestamp(): dbValue {
    return firestore.FieldValue.serverTimestamp();
  }

  /** Return an ID sentinel to be used in queries */
  public get sentinelId(): dbPath {
    return firestore.FieldPath.documentId();
  }

  /** Creates a geopoint at the given lat and lng */
  public geopoint(lat: number, lng: number): dbGeopoint {
    return new firestore.GeoPoint(lat, lng);
  }

  /** Returns a firestore.WriteBatch re-typed into a dbWriteBatch to support batch operations */
  public batch(): dbWriteBatch {
    return this.firestore.batch();
  }

  /** Runs a firestore.Transaction to support atomic operations */
  public transaction<T>( updateFn: (t: dbTransaction) => Promise<T> ): Promise<T> {
    return this.firestore.runTransaction<T>(updateFn);
  }

  public doc(ref: string|dbDocumentRef): dbDocumentRef {
    return typeof ref === 'string' ? this.firestore.doc(ref) : ref;
  }

  public col(ref: string|dbCollectionRef): dbCollectionRef {
    return typeof ref === 'string' ? this.firestore.collection(ref) : ref;
  }

  /**
   * Creates and returns a DatabaseDocument object
   * @param path the path to the collection containing the document
   * @param id the id of the document to be retrived
   */
  public document<T>(path: string|dbDocumentRef): DatabaseDocument<T> {
    return new DatabaseDocument<T>(this, this.doc(path) );
  }

  /**
   * Creates and returns a DatamaseCOllection object
   * @param path the path to the collection
   */
  public collection<T>(path: string|dbCollectionRef): DatabaseCollection<T> {
    return new DatabaseCollection<T>(this, this.col(path));
  }

  /**
   * Creates and returns a collection paginating the stream of documents.
   * @param path the path to the collection
   */
  public pagedCollection<T>(path: string|dbCollectionRef): PagedCollection<T> {
    return new PagedCollection<T>(this, this.col(path) );
  }

  /**
   * Creates a new, or retrives and existing, distributed counter
   * @param path the path to the distributed counter location in the database
   * @param shards number of shards to share the counting with
   */
  public counter(path: string|dbCollectionRef, shards: number = 3): DistributedCounter {
    return new DistributedCounter(this, this.col(path), shards);
  }
}