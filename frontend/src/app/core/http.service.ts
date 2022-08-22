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

  getAll( endPoint, showLoading ) {
    return this.get(endPoint, showLoading);
  }

  getAllWithFilters( endPoint, offset, query, limit, showLoading ) {
    return this.getWithFilters(endPoint, offset, query, limit, showLoading);
  }

  getById( endPoint, showLoading ) {
    return this.get(endPoint, showLoading);
  }
  
  update( endPoint, value, bodyType, showLoading) {
    return this.put(endPoint, value, bodyType, showLoading);
  }

  // (-) Items

  // (+) Basic

  delete( endPoint, showLoading ) {

    if(showLoading) this.global.showLoading();

    const url = environment.serverUrl + endPoint;
    return this.http.delete(url, this.getHeaders())
      .toPromise()
      .then( (response:any) =>
        response
      )
      .catch(this.handleError.bind(this))
      .finally(() => { if(showLoading) this.global.hideLoading() });
  }

  put( endPoint, value, bodyType, showLoading ) {

    if(showLoading) this.global.showLoading();

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
      .catch(this.handleError.bind(this))
      .finally(() => { if(showLoading) this.global.hideLoading() });
  }

  post( endPoint, value, bodyType, showLoading ) {

    if(showLoading) this.global.showLoading();

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
    if (endPoint === 'user/loginWithSocialMedia') {
      return this.http.post(url, body, this.getHeadersForSocialMedia())
        .toPromise()
        .then((response:any) => response)
        .catch(this.handleError.bind(this))
        .finally(() => { if(showLoading) this.global.hideLoading() });
    } else {
      return this.http.post(url, body, this.getHeaders(enctype))
        .toPromise()
        .then((response:any) => response)
        .catch(this.handleError.bind(this))
        .finally(() => { if(showLoading) this.global.hideLoading() });
    }
  }

  get(endPoint, showLoading, fileOptions = null) {

    if(showLoading) this.global.showLoading();

    let headers: any = this.getHeaders('json', fileOptions);

    if(fileOptions) {
      headers.responseType = 'blob';
    }

    const url = environment.serverUrl + endPoint;

    return this.http.get(url, headers)
      .toPromise()
      .then( (response:any) => {
        if(fileOptions) return this.getFile(response, fileOptions.fileExtension)
        else return response;
      })
      .catch( (error) => {
        return this.handleError(error);
      })
      .finally(() => { if(showLoading) this.global.hideLoading() });
  }


  getWithFilters(endPoint, offset, query, limit, showLoading) {
    
    if(showLoading) this.global.showLoading();

    const url = environment.serverUrl + endPoint;
    return this.http.get(url, this.getOptions(offset, query, limit))
      .toPromise()
      .then( (response:any) => {
        return response;
      })
      .catch( (error) => {
        return this.handleError(error);
      })
      .finally(() => { if(showLoading) this.global.hideLoading() });
  }

  // (-) Basic


  getFile(blob: any, fileExtension: string) {
    return new File([blob], 'filename.' + fileExtension)
  }


  getOptions(offset, query, limit) {
    return {...this.getHeaders(), ...this.getParams(offset, query, limit)};
  }


  getParams(offset, query, limit) {
    return {
      params: new HttpParams({
        fromString: `offset=${offset}&query=${query}&limit=${limit}`
      })
    }
  }


  getHeaders( enctype = 'json', fileOptions = null ) {
    if(this.global.getUser() && this.global.get('securityReports.token')) {
      let headers: any = {
        'Authorization': `Bearer ${this.global.get('securityReports.token')}`,
        'enctype': enctype
      };

      if(fileOptions) headers.Accept = 'application/octet-stream';

      return {
        headers: new HttpHeaders(headers)
      };

    } else {
      return {};
    }
  }


  getHeadersForSocialMedia() {
    if(this.global.get('securityReports.token')) {
      let headers: any = {
        'Authorization': `Bearer ${this.global.get('securityReports.token')}`
      };
      return {
        headers: new HttpHeaders(headers)
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

    const httpError = {status:status, message:message};

    return Promise.reject(httpError);
  }

}
