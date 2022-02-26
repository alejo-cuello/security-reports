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


@Injectable({
  providedIn: 'root'
})
export class PageService {
  
  loading: any;
  moduleName = '';
  hideMenu: Boolean = false;

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
    public iab: InAppBrowser
  ) {
  }


  // (+) Navigation

  navigate(endPoint = '') {
    this.navigateRoute('/' + this.getModuleName() + endPoint);
  }

  navigateRoute(route,extra = {}) {
    this.router.navigate([route],extra);
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

  httpGetAll( endPoint ) {
    return this.httpService.getAll( endPoint );
  }

  httpGetAllWithFilters( endPoint, offset, query) {
    return this.httpService.getAllWithFilters(endPoint, offset, query);
  }

  httpUpdate( endPoint, item, id ) {
    endPoint += ( '/' + id );
    return this.httpService.update( endPoint, item );
  }

  httpCreate( endPoint, item, bodyType = 'json' ) {
    return this.httpService.post( endPoint, item, bodyType );
  }

  httpGetById( endPoint, id ) {
    endPoint += ('/' + id);
    return this.httpService.getById( endPoint );
  }

  httpPut( endPoint, values ) {
    return this.httpService.put( endPoint, values );
  }

  httpPost( endPoint, values, bodyType = 'json' ) {
    return this.httpService.post( endPoint, values, bodyType );
  }

  httpDelete( endPoint ) {
    return this.httpService.delete( endPoint );
  }

  httpGet( endPoint, showLoading = true ) {
    return this.httpService.get( endPoint, showLoading );
  }

  // httpPostFileBase64( file, resolve, reject) {
  //   return this.httpService.postFileBase64( file, resolve, reject );
  // }

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

  showMessage(message, color: string) {
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
        // allowEdit: true
      };
      this.camera.getPicture(cameraOptions).then((file) => {
        resolve(file);
      }, (error) => {
        reject(error);
      });
    }
  }

  // (-) Image


  // (+) Loading
  async showLoading(content = 'Procesando...'){
    this.global.showLoading();
  }

  async hideLoading(){
    this.global.hideLoading();
  }
  // (-) Loading
}
