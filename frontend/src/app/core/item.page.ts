import { Directive, ChangeDetectorRef } from '@angular/core';
import { PageService } from './page.service';
import { FormPage } from './form.page';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Directive({selector: '[itemPage]'})
export abstract class ItemPage extends FormPage {

  item: any;
  creating = true;
  processing = true;
  params: any;
  queryParam: string;

  constructor(
    public formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    public pageService: PageService,
    public changeDetectorRef: ChangeDetectorRef,
    public router:Router

  ) {
    super(formBuilder,pageService);
  }

  ngOnInit() {
    this.initialize();
    this.form = this.getFormNew();
  }

  getFormEdit( item ) {
    return this.formBuilder.group( {} );
  }

  getFieldId() {
    return 'id';
  }

  getEndPoint() {
    return '';
  }

  getEndPointCreate() {
    return this.getEndPoint();
  }

  getEndPointUpdate() {
    return this.getEndPoint();
  }

  getEndPointLoad() {
    return this.getEndPoint();
  }

  onSubmitPerform( item ) {
    this.savePre( item );

    if( !this.savePreCheck( item )) return;

    this.savePostPre();

    if ( !item[this.getFieldId()] ) {

      delete ( item[this.getFieldId()] );
      this.pageService.showMessage('Procesando...', 'medium');
      this.pageService.httpCreate( this.getEndPointCreate(), item, item.bodyType || 'json' )
        .then( (response) => {
          this.createdItemMessage();
          this.savePost( response );
        })
        .catch( (reason) => {
          this.pageService.showError( reason );
          this.savePostError( reason );
        });
    } else {
      if (!item.photo) {
        delete item.photo;
      }
      if (item.newPhoto) {
        const blob = this.pageService.base64toBlob(item.photo);
        item.photo = blob;
        delete item.newPhoto;
      }

      let id = item[this.getFieldId()];
      delete ( item[this.getFieldId()] );

      this.pageService.httpUpdate( this.getEndPointUpdate(), item, id, item.bodyType || 'json' )
        .then((response) =>{
          this.updatedItemMessage();
          this.savePost( response );
        })
        .catch((reason) => {
          this.pageService.showError( reason );
          this.savePostError( reason );
        });
    }
  }

  createdItemMessage() {
    this.pageService.showSuccess('Creado exitosamente!');
  }

  updatedItemMessage() {
    this.pageService.showSuccess('Actualizado exitosamente!');
  }

  savePostPre() {
  }

  // Override returning 'new' or id
  getParamId() {
    let paramId: any;
    return paramId;
  }

  savePre( item ) {
  }

  savePreCheck( item ) {
    return true;
  }

  savePost( item ) {
  }

  savePostError( item ) {
  }

  initializePre(item?) {
    return new Promise( (resolve, reject) => {
      resolve(true);
    });
  }

  async initialize() {
    await this.initializePre().catch((err) => this.pageService.showError(err));
    this.processing = true;
    const paramId = this.getParamId();
    if(!paramId) {
      this.activatedRoute.queryParams.subscribe( (params: Params) => {
        if (params) {
          this.params = params;
          if (params.id !== 'new')
            this.checkLoadingsAndloadItem(params.id);
        } else {
          this.processing = false;
        }
      });
    } else {
      if (paramId !== 'new') {
        this.loadItem(paramId);
      } else {
        this.processing = false;
      }
    }
  }

  getPopulates() {
    return [];
  }

  checkLoadings() {
    return true;
  }

  checkLoadingsAndloadItem(id: string) {
    setTimeout(() => {
      if(this.checkLoadings())
        this.loadItem(id);
      else
        this.checkLoadingsAndloadItem(id);
    }, 100);
  }

  loadItem(id: string) {
    this.loadItemPre();
    this.pageService.httpGetById( this.getEndPointLoad(), id )
    .then( ( results: any ) => {
      let item = Array.isArray(results) ? results[0] : results;
      this.form = this.getFormEdit(item);
      this.item = item;
      this.creating = false;
      this.processing = false;
      this.loadItemPost();
    })
    .catch((reason) => {
      this.pageService.showError(reason);
    });
  }

  loadItemPre() {
  }

  loadItemPost() {
  }

}
