import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { MensajesToastService } from '../../../../shared/mensajes-toast.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RegistrarLocalComponent } from './registrar-local/registrar-local.component';
import { ListadoLocalesEmpresaResponse, LocalResponse } from '../../../../models/local/local.interface';
import { LocalService } from '../../../../service/local.service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { EmpresaTO } from '../../../../models/empresa/empresa.interface';
import { ClienteResponse } from '../../../../models/cliente/cliente.interface';

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
  estado: any = '1'
  loading: boolean = false
  locales: LocalResponse[] = []
  @ViewChild(RegistrarLocalComponent) registrarLocal!: RegistrarLocalComponent;
  @Input() cliente!: ClienteResponse;
  constructor(private confirmationService: ConfirmationService,
    private mensajeService: MensajesToastService,
    private localService: LocalService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buscar();

  }
  limpiar() {
    this.nombre = '';
    this.estado = '1';
    this.buscar()
  }

  buscar() {
    this.loading = true;
    this.localService.listado(this.cliente?.cliente, this.nombre, this.estado).pipe(
      catchError((errorResponse: any) => {
        this.mensajeService.errorServicioConsulta(errorResponse);

        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe((response: ListadoLocalesEmpresaResponse) => {
      const { respuesta, codigo } = response;
      if (codigo === 0) this.locales = respuesta
      else this.locales = []
    });
  }

  registrar() {
    this.registrarLocal.nuevo()
  }
  editar(local: LocalResponse) {
    this.registrarLocal.titulo = 'Editar local';
    this.registrarLocal.cliente = this.cliente;
    this.registrarLocal.form.patchValue(local);
    
    this.registrarLocal.visible = true;
  }

  eliminar(local: any) {
    this.confirmationService.confirm({

      message: '¿Está seguro que desea desactivar el local <b>' + local.nombre + '</b> ? <br /><br />Podrá reactivar en cualquier momento.',
      header: 'Eliminar local',
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

  guardar(event: string) {
    this.mensajeService.exito('Éxito', event); 
    this.buscar();
  }
}
