import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  getAll( endPoint ) {
    return this.get(endPoint);
  }

  getAllWithFilters( endPoint, offset, query ) {
    return this.getWithFilters(endPoint, offset, query);
  }

  getById( endPoint ) {
    return this.get(endPoint);
  }
  
  update( endPoint, value, bodyType) {
    return this.put(endPoint, value, bodyType);
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

  put( endPoint, value, bodyType ) {
    let body: any;
    let enctype = 'json';

    if(bodyType == 'form-data') {
      delete value.bodyType;
      enctype = 'multipart/form-data';
      body = new FormData();
      for(let field in value) {
        body.append(field, value[field]);
      }
    } else {
      body = value;
    }

    const url = environment.serverUrl + endPoint;
    return this.http.put(url, body, this.getHeaders())
      .toPromise()
      .then( (response:any) =>
        response
      )
      .catch(this.handleError.bind(this));
  }

  post( endPoint, value, bodyType ) {

    let body: any;
    let enctype = 'json';

    if(bodyType == 'form-data') {
      delete value.bodyType;
      enctype = 'multipart/form-data';
      body = new FormData();
      for(let field in value) {
        body.append(field, value[field]);
      }
    } else {
      body = value;
    }

    const url = environment.serverUrl + endPoint;
    return this.http.post(url, body, this.getHeaders(enctype))
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


  getWithFilters(endPoint, offset, query, showLoading = true) {
    const url = environment.serverUrl + endPoint;
    return this.http.get(url, this.getOptions(offset, query))
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


  getOptions(offset, query) {
    return {...this.getHeaders(), ...this.getParams(offset, query)};
  }


  getParams(offset, query) {
    return {
      params: new HttpParams({
        fromString: `offset=${offset}&query=${query}`
      })
    }
  }


  getHeaders( enctype = 'json' ) {
    if(this.global.getUser() && this.global.get('securityReports.token')) {
      return {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.global.get('securityReports.token')}`,
          'enctype': enctype
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
