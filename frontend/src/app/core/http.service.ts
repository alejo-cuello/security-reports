import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(
    public http: HttpClient,
    public global: GlobalService
  ) {
  }

  // (+) Items

  getAll( endPoint, ids ) {
    return this.get(endPoint);
  }

  getById( endPoint ) {
    return this.get(endPoint);
  }
  
  update( endPoint, value) {
    return this.put(endPoint, value);
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

  get(endPoint, showLoading = true) {
    const url = environment.serverUrl + endPoint;
    return this.http.get(url, this.getHeaders())
      .toPromise()
      .then( (response:any) => {
        return response;
      })
      .catch( (error) => {
        return this.handleError(error);
      });
  }

  // (-) Basic

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
          'Authorization':  this.global.getUser().token
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
