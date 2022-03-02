import { Injectable } from '@angular/core';
import { Settings } from '../app.settings';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public settings = Settings;

  public loadingBehaviorSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loading = false;

  public userBehaviorSubject: BehaviorSubject<boolean>;
  public user: any;

  public objects = {};
  public objectsBehaviorSubject = {};

  public actionsBehaviorSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public actions: any = {};

  constructor() {
    this.loadUser();
    this.userBehaviorSubject = new BehaviorSubject(false);
  }

  // (+) User
  saveUser(user: any, stop = false) {
    localStorage.setItem( this.settings.storage.user, JSON.stringify( user ) );
    this.user = user;
    if (stop) return;
    this.userBehaviorSubject.next( true );
  }

  isUser() {
    if(this.user && this.user.roles.includes('user')) {
      return true
    } else {
      return false
    }
  }

  getUser() {
    return this.user;
  }

  isUserLogged() {
    return this.user ? true : false;
  }

  removeUser() {
    localStorage.removeItem( this.settings.storage.user );
    this.user = null;
    this.userBehaviorSubject.next(false);
    this.removeActions();
  }

  getUserAsObservable(): Observable<any> {
    return this.userBehaviorSubject.asObservable();
  }

  checkUser() {
    const u = this.loadUser();
    if( u )
      this.userBehaviorSubject.next( true );
    else
      this.userBehaviorSubject.next(false);
    return this.user;
  }

  loadUser() {
    const u = localStorage.getItem( this.settings.storage.user );
    if( u )
      this.user = JSON.parse(u);
    else
      this.user = null;
    return this.user;
  }
  // (-) User


  // (+) Generic objects

  save( key, object ) {
    localStorage.setItem( key, JSON.stringify( object ) );
    this.objects[key] = object;
    if(!this.objectsBehaviorSubject[key])
      this.objectsBehaviorSubject[key] = new BehaviorSubject(true);
    else
      this.objectsBehaviorSubject[key].next( true );
  }

  get( key ) {
    return this.objects[key];
  }

  exists( key ) {
    return this.objects[key] ? true : false;
  }

  remove( key ) {
    localStorage.removeItem( key );
    delete this.objects[key];
    if(this.objectsBehaviorSubject[key]) this.objectsBehaviorSubject[key].next(false);
  }
  
  load( key ) {
    const o = localStorage.getItem( key );
    if( o )
      this.objects[key] = JSON.parse( o );
    else
      delete this.objects[key];
    return this.objects[key];
  }

  pop( key ) {
    const v = this.load( key );
    this.remove( key );
    return v;
  }

  // Get object as observable
  getAsObservable( key ): Observable<any> {
    if(!this.objectsBehaviorSubject[key])
      this.objectsBehaviorSubject[key] = new BehaviorSubject(true);
    return this.objectsBehaviorSubject[key].asObservable();
  }

  // Check objects
  check( key ) {
    const v = this.load( key );
    let exists = false;
    if( v ) exists = true;

    if(!this.objectsBehaviorSubject[key])
      this.objectsBehaviorSubject[key] = new BehaviorSubject(exists);
    else
      this.objectsBehaviorSubject[key].next(exists);

    return this.objects[key];
  }

  // (-) Generic objects


  // (+) Loading

  showLoading() {
    this.loading = true;
    this.loadingBehaviorSubject.next( true );
  }

  hideLoading() {
    this.loading = false;
    this.loadingBehaviorSubject.next( false );
  }

  isLoading() {
    return this.loading;
  }

  // Get loading observable  
  getLoadingAsObservable(): Observable<any> {
    return this.loadingBehaviorSubject.asObservable();
  }

  // (-) Loading

  // (+) Action

  removeActions() {
    this.actions = {};
    this.actionsBehaviorSubject.next(false);
  }
  // (-) Action
}
