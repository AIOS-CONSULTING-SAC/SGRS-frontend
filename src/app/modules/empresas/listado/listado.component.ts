import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { EmpresaTO, ListadoEmpresasResponse } from '../../../models/empresa/empresa.interface';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmpresaService } from '../../../service/empresa.service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { MensajesToastService } from '../../../shared/mensajes-toast.service';
import { ActivatedRoute, Data } from '@angular/router';
import { ClienteService } from '../../../service/cliente.service';
import { AutenticacionService } from '../../../auth/autenticacion.service';
import { ClienteResponse, ListadoClientesResponse } from '../../../models/cliente/cliente.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listado',
  imports: [FormsModule, TableModule, DropdownModule, ButtonModule, InputTextModule, CommonModule, ConfirmDialogModule],
  providers: [ConfirmationService, MensajesToastService],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  empresas: ClienteResponse[] = [];
  loading = false;
  razonSocial = '';
  ruc = '';
estado: any = '1'
  tituloComponente!: string;
  @Output() registrar = new EventEmitter();
  @Output() editar = new EventEmitter<ClienteResponse>();
  @Output() configuracion = new EventEmitter<ClienteResponse>(); 
  constructor(private confirmationService: ConfirmationService, 
    private mensajeService: MensajesToastService,
    private readonly route: ActivatedRoute,
    private clienteService: ClienteService,
  private autenticacionService: AutenticacionService) {
    this.buscar();
  }

  ngOnInit(){
    this.route.data.subscribe((data: Data) => {
      this.tituloComponente = data['breadcrumb']
    })
  }

  buscar() { 
    this.loading = true;
    this.clienteService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa, this.ruc, this.razonSocial, this.estado).pipe(
      catchError((errorResponse: any) => {
        this.mensajeService.errorServicioConsulta(errorResponse);

        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe((response: ListadoClientesResponse) => {
      const { respuesta, codigo } = response;
      if (codigo === 0) this.empresas = respuesta
      else this.empresas = []

    });

  }

  limpiar() {
    this.razonSocial = '';
    this.ruc = '';
    this.estado = '1';
    this.buscar();
  }

  eliminar(cliente: ClienteResponse) {
    console.log(cliente);
    this.confirmationService.confirm({

      message: '¿Está seguro que desea desactivar la empresa <b>' + cliente.razonSocial + '</b> ? <br /><br />Podrá reactivar en cualquier momento.',
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
         this.clienteService
          .eliminar(cliente.cliente, this.autenticacionService.getDatosToken()?.codigoEmpresa ?? 0)
          .pipe(finalize(() => this.buscar()))
          .subscribe({
            next: (res) => {
              if (res.codigo === 0) {
                this.mensajeService.exito('Éxito','Se desactivó la empresa correctamente');
              } else {
                this.mensajeService.error('Error',res.mensaje || 'Error al eliminar');
              }
            },
            error: (err) => this.mensajeService.errorServicioGuardado(err)
          });
      }, 
    });
  }
  
}
