import { Component } from '@angular/core';
import { BasePage } from 'src/app/core/base.page';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.page.scss'],
})
export class ClaimsPage extends BasePage {

  menu: string = 'claim';
  claims: any[] = [1,2,3,4,5];
  insecurityFacts: any[] = [1,2,3,4,5];

  goToClaim( action: string ) {
    this.pageService.navigateRoute( 'claim', { queryParams: { action } } );
  }

  async openOptions( id: string ) {
    const alert = await this.pageService.alertCtrl.create({
      header: 'Opciones',
      inputs: [
        { 
          type: 'radio',
          label: 'Ver detalle',
          value: 'watch'
        },
        { 
          type: 'radio',
          label: 'Editar',
          value: 'edit'
        },
        { 
          type: 'radio',
          label: 'Eliminar',
          value: 'delete'
        },
      ],
      buttons: [
        {
          text: 'CANCELAR',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'OK',
          handler: (action) => {
            this.goToClaim(action);
          }
        }
      ]
    });

    await alert.present();
  }
}
