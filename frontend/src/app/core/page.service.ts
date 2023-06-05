import { Injectable, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, ToastController, ActionSheetController, LoadingController, AlertController, PopoverController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { HttpService } from './http.service';
import { GlobalService } from './global.service';
import { SMS } from '@awesome-cordova-plugins/sms/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { MenuController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  
  loading: any;
  moduleName = '';
  hideMenu: Boolean = false;
  params: URLSearchParams;

  constructor(
    public activatedRoute: ActivatedRoute,
    public modalCtrl: ModalController,
    public geolocation: Geolocation,
    public camera: Camera,
    public loadingController: LoadingController,
    public actionSheetController: ActionSheetController,
    public platform: Platform,
    public global: GlobalService,
    public httpService: HttpService,
    public location: Location,
    public router: Router,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public popoverController: PopoverController,
    public zone: NgZone,
    public sms: SMS,
    public iab: InAppBrowser,
    public sanitizer: DomSanitizer,
    public callNumber: CallNumber,
    public socialSharing: SocialSharing,
    public file: File,
    public menuController: MenuController
  ) {
  }


  // (+) Navigation

  navigate(endPoint = '') {
    this.navigateRoute('/' + this.getModuleName() + endPoint);
  }

  navigateRoute(route, extra = {}) {
    this.router.navigate([route], extra);
  }

  navigateBack() {
    this.location.back();
  }

  getModuleName() {
    return this.location.path().split('/')[1];
  }

  // (-) Navigation


  // (+) Http

  getHttpEndPoint() {
    return '/' + this.getModuleName();
  }

  httpGetAll( endPoint, showLoading = true ) {
    return this.httpService.getAll( endPoint, showLoading );
  }

  httpGetAllWithFilters( endPoint, offset, query, limit = 6, showLoading = true) {
    return this.httpService.getAllWithFilters(endPoint, offset, query, limit, showLoading);
  }

  httpUpdate( endPoint, item, id, bodyType = 'json', showLoading = true ) {
    endPoint += ( '/' + id );
    return this.httpService.update( endPoint, item, bodyType, showLoading );
  }

  httpCreate( endPoint, item, bodyType = 'json', showLoading = true ) {
    return this.httpService.post( endPoint, item, bodyType, showLoading );
  }

  httpGetById( endPoint, id, showLoading = true ) {
    endPoint += ('/' + id);
    return this.httpService.getById( endPoint, showLoading );
  }

  httpPut( endPoint, values, bodyType = 'json', showLoading = true ) {
    return this.httpService.put( endPoint, values, bodyType, showLoading );
  }

  httpPost( endPoint, values, bodyType = 'json', showLoading = true ) {
    return this.httpService.post( endPoint, values, bodyType, showLoading );
  }

  httpDelete( endPoint, showLoading = true ) {
    return this.httpService.delete( endPoint, showLoading );
  }

  httpGet( endPoint, showLoading = true, fileOptions = null ) {
    return this.httpService.get( endPoint, showLoading, fileOptions );
  }

  // (-) Http

  // (+) Show messages

  showSuccess(message) {
    this.showMessage(message, "success");
  }

  showError(message) {
    this.showMessage(message, "danger");
  }

  showWarning(message) {
    this.showMessage(message, "warning");
  }

  showMessage(message, color: string = 'medium') {
    let msg = message.message || message;
    let toast = this.toastCtrl.create({
      message: msg,
      color: color,
      duration: 2000,
      position: 'top'
    }).then((toastData)=>{
      toastData.present();
    });

  }

  // (-) Show messages

  // (+) Map

  getCurrentLocation() {
    return new Promise( (resolve, reject) => {
      this.geolocation.getCurrentPosition().then((position) => { 
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        resolve(pos);
      }).catch((error) => {
        reject(error);
      });

    });
  }

  // (-) Map

  // (+) Image

  showImageUpload(params?: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let actionSheet = await this.actionSheetController.create({
        header: "¿Como desea cargar su imagen?'",
        buttons: [{
          text:   "Galería",
          handler: () => {
            this.showImageUploadTake('gallery', resolve, reject);
          }
        }, {
          text: "Cámara",
          handler: () => {
            this.showImageUploadTake('camera', resolve, reject);
          }
        }, {
          text: "Cancelar",
          role: 'cancel',
          handler: () => {
            resolve(null);
          }
        }]
      });
      await actionSheet.present();
    });
  }

  showImageUploadTake(source, resolve, reject) {
    if (!this.platform.is('cordova')) {
      let element = document.createElement('input');
      element.type = 'file';
      element.accept = 'image/*';
      element.onchange = () => {
        resolve(element.files[0]);
      };
      element.click();
    } else {
      let cameraOptions: CameraOptions = {
        quality: 85,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: source == 'gallery' ? this.camera.PictureSourceType.PHOTOLIBRARY : this.camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        targetHeight: 750,
        targetWidth: 750
      };
      this.camera.getPicture(cameraOptions).then((file) => {
        resolve(file);
      }, (error) => {
        reject(error);
      });
    }
  }

  trustResourceUrl(file) {
    if(this.platform.is('cordova')) {
      if(file.name) return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file.name[0]));
      else return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + file);
    }
    else {
      return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + file);
    }
  }

  base64toBlob(data, contentType: string = 'image/jpg', sliceSize: number = 512) {
    const byteCharacters = atob(data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  // (-) Image


  // (+) Loading

  async showLoading(){
    this.global.showLoading();
  }

  async hideLoading(){
    this.global.hideLoading();
  }

  // (-) Loading


  // (+) Query Params

  getQueryString() {
    const queryString = window.location.search;
    this.params = new URLSearchParams(queryString);
    return this.params;
  }

  // (-) Query Params

  // (+) Login y logout

  continueLogin(res: any, role: string = 'neighbor') {
    this.global.saveUser(res.user); // Guarda el usuario en el localStorage
    this.global.save(this.global.settings.storage.role, role); // Guarda el rol del usuario en el localStorage
    this.global.save(this.global.settings.storage.token, res.token ); // Guarda el token del usuario en el localStorage
    this.global.save(this.global.settings.storage.contacts, res.neighborContacts );
    this.showSuccess('Bienvenido!');
    this.enableMenu(true);
    this.navigateRoute('tabs/claims');
  }

  enableMenu(enable: boolean) {
    this.menuController.swipeGesture(enable)
      .then((res) => {
        // console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  logout() {
    const user = this.global.getUser();

    if(user.facebookId) {
      FacebookLogin.logout()
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
    else if(user.googleId) {
      GoogleAuth.signOut()
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
    
    this.global.removeUser(); // Elimina el usuario del localStorage
    
    for(let storage in this.global.settings.storage) {
      this.global.remove(this.global.settings.storage[storage]);
    }

    this.navigateRoute('login');
  }
  
  // (-) Login y logout

  getDate(date: string) {
    let onlyDate = date.split('T')[0].split('-');
    return (onlyDate[2] + '/' + onlyDate[1] + '/' + onlyDate[0]);
  }

  validateNumber(event:any) {
    event.target.value = event.target.value.replaceAll(',','').replaceAll('.','').replaceAll('-','').replaceAll('e','');
  }
}
