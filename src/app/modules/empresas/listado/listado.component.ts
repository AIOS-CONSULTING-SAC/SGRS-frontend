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

@Component({
  selector: 'app-listado',
  imports: [FormsModule, TableModule, DropdownModule, ButtonModule, InputTextModule, ConfirmDialogModule],
  providers: [ConfirmationService, MensajesToastService],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  empresas: ClienteResponse[] = [];
  loading = false;
  razonSocial = '';
  ruc = '';
  estado:number | null = null;
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
    console.log(this.autenticacionService.getDatosToken())
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
    this.estado = null;
    this.buscar();
  }

  eliminar(empresa: EmpresaTO) {
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
