import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { MensajesToastService } from '../../../../shared/mensajes-toast.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RegistrarLocalComponent } from './registrar-local/registrar-local.component';

@Component({
  selector: 'app-locales',
  imports: [DropdownModule, InputTextModule, ButtonModule, CommonModule, 
    FormsModule, TableModule, ConfirmDialogModule, RegistrarLocalComponent],
  providers: [ConfirmationService, MensajesToastService],
  templateUrl: './locales.component.html',
  styleUrl: './locales.component.scss'
})
export class LocalesComponent {
  nombre!: string
  estado!: number
  loading: boolean = false
  locales: any[] = []
  @ViewChild(RegistrarLocalComponent) registrarLocal!: RegistrarLocalComponent;

  constructor(private confirmationService: ConfirmationService,
    private mensajeService: MensajesToastService,) {

  }
  limpiar() {

  }

  buscar() {

  }
  
  registrar(){
    this.registrarLocal.visible = true
  }
 

  eliminar(empresa: any) {
    console.log(empresa);
    this.confirmationService.confirm({

      message: '¿Está seguro que desea desactivar la empresa <b>' + empresa.razonSocial + '</b> ? <br /><br />Podrá reactivar en cualquier momento.',
      header: 'Eliminar empresa',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirmar',
        severity: 'danger',
      },

      accept: () => {
        //this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' });
      },
      reject: () => {
        //this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      },
    });
  }
}
