import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GlobalService } from './global.service';
// import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(
    public http: HttpClient,
    public global: GlobalService,
    // private transfer: FileTransfer,
  ) {
    this.initialize();
  }

  initialize() {
  }

  // (+) Items

  getAll( endPoint, filters, showLoading, sort , populates, page) {
    const action = '/?_filters=' + encodeURI(JSON.stringify(filters))
                 + '&_sort=' + encodeURI(JSON.stringify(sort))
                 + '&_populates=' + encodeURI(JSON.stringify(populates))
                 + '&_page=' + encodeURI(page);
    return this.get(endPoint + action, showLoading);
  }

  getById(endPoint, id, showLoading = true, populates:any = [] ) {
    const action = '?_populates=' + encodeURI(JSON.stringify(populates));
    return this.get(endPoint + '/' + id + action, showLoading);
  }
  
  update( endPoint, value) {
    return this.put(endPoint + '/' + value.id,  value );
  }

  // (-) Items

  // (+) Basic

  delete( endPoint ) {
    const url = environment.serverUrl + endPoint;
    return this.http.delete(url, this.getHeaders())
      .toPromise()
      .then( (response:any) =>
        response
      )
      .catch(this.handleError.bind(this));
  }

  put( endPoint, value ) {
    const url = environment.serverUrl + endPoint;
    return this.http.put(url, value, this.getHeaders())
      .toPromise()
      .then( (response:any) =>
        response
      )
      .catch(this.handleError.bind(this));
  }

  post( endPoint, value, showLoading = true ) {
    const url = environment.serverUrl + endPoint;
    return this.http.post(url, value, this.getHeaders())
      .toPromise()
      .then( (response:any) =>
        response
      )
      .catch(this.handleError.bind(this));
  }

  patch( endPoint, value ) {
    const url = environment.serverUrl + endPoint;
    return this.http.patch(url, value, this.getHeaders())
      .toPromise()
      .then( (response:any) =>
        response
      )
      .catch(this.handleError.bind(this));
  }

  get(endPoint, showLoading = true) {
    const url = environment.serverUrl + endPoint;
    if(showLoading) this.global.showLoading();
    return this.http.get(url, this.getHeaders())
      .toPromise()
      .then( (response:any) => {
        if(showLoading) this.global.hideLoading();
        return response;
      })
      .catch( (error) => {
        if(showLoading) this.global.hideLoading();
        return this.handleError(error);
      });
  }

  create( endPoint, value, showLoading ) {
    return this.post( endPoint, value, showLoading );
  }

  // (-) Basic

  postFile(file) {
    // const url = environment.serverUrl + this.global.settings.endPoints.files + '/upload'

    // const fd = new FormData();
    // fd.append('file', file);

    // return this.http.post(url, fd)
    //   .toPromise()
    //   .then( (response:any) => {
    //     return response;
    //   })
    //   .catch(this.handleError);
  }

  // postFileBase64(file, resolve, reject) {
  //   const url = environment.serverUrl + this.global.settings.endPoints.files + '/upload';

  //   let fileUploadOptions: FileUploadOptions = {
  //     fileKey: 'file',
  //     fileName: 'file',
  //     chunkedMode: false,
  //     mimeType: 'image/jpeg',
  //     headers: {
  //       'x-content-type': 'on',
  //       'x-access-token': this.global.getUser()?this.global.getUser().token:''
  //     }
  //   };
  //   let fileTransferObject: FileTransferObject = this.transfer.create();
  //   return fileTransferObject.upload(
  //     'data:image/jpeg;base64,' + file.replace('data:image/jpeg;base64,', ''),
  //     url,
  //     fileUploadOptions
  //   ).then((result: any) => {
  //     if (result && result.response) {
  //       let data = JSON.parse(result.response) || null;
  //       resolve(data);
  //     }
  //   }, (error) => {
  //     reject(error);
  //   });
  // }

  getHeaders() {
    if(this.global.getUser() && this.global.getUser().token) {
      return {
        headers: new HttpHeaders({
          'x-access-token':  this.global.getUser().token
        })
      };
    } else {
      return {};
    }
  }

  handleError(error: any) {

    let message = 'Ha ocurrido un error';
    if(error.error) {
      if(error.error.message) message = error.error.message;
      else if(error.name) message = error.name;
      else if(error.message) message = error.message;
    }

    let status = 500;
    if(error.status) status = error.status;

    const httpError = {status:status,message:message};

    return Promise.reject(httpError);
  }

}
