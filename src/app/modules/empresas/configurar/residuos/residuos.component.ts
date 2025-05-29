import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button'; 
import { EMPTY, finalize, catchError } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RegistrarResiduoComponent } from './registrar-residuo/registrar-residuo.component';
import { ConfirmationService } from 'primeng/api';
import { MensajesToastService } from '../../../../shared/mensajes-toast.service';
import { ListadoResiduosEmpresaResponse, ResiduoResponse } from '../../../../models/residuo/residuo.interface';
import { ClienteResponse } from '../../../../models/cliente/cliente.interface';
import { ResiduoService } from '../../../../service/residuo.service';
import { InputTextModule } from 'primeng/inputtext';
import { AutenticacionService } from '../../../../auth/autenticacion.service';

@Component({
  selector: 'app-residuos',
  standalone: true,
  templateUrl: './residuos.component.html',
  styleUrl: './residuos.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    ConfirmDialogModule,
    RegistrarResiduoComponent
  ],
  providers: [ConfirmationService, MensajesToastService]
})
export class ResiduosComponent {
  nombre: string = '';
  estado!: number | null;
  loading: boolean = false;
  residuos: ResiduoResponse[] = [];

  @ViewChild(RegistrarResiduoComponent) registrarResiduo!: RegistrarResiduoComponent;
   @Input() cliente!: ClienteResponse;
  

  constructor(
    private mensajeService: MensajesToastService,
    private residuosService: ResiduoService,
    private autenticacionService: AutenticacionService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente']) this.buscar();
  }

  limpiar() {
    this.nombre = '';
    this.estado = null;
    this.buscar();
  }

  buscar() {
    this.loading = true;
    this.residuosService
      .listado(this.cliente?.cliente, this.estado)
      .pipe(
        catchError((error) => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((res: ListadoResiduosEmpresaResponse) => {
        this.residuos = res.codigo === 0 ? res.respuesta : [];
      });
  }

  registrar() {
    this.registrarResiduo.abrir('Registrar residuo', {
      codCliente: this.cliente?.cliente,
      usuarioSesion: this.autenticacionService.getDatosToken()?.codigoUsuario
    });
  }

  editar(residuo: ResiduoResponse) {
    this.registrarResiduo.abrir('Editar residuo', {
      ...residuo,
      usuarioSesion: this.autenticacionService.getDatosToken()?.codigoUsuario
    });
  }

  eliminar(residuo: ResiduoResponse) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea desactivar el residuo <b>${residuo.descripcion}</b>?<br><br>Podrá reactivarlo luego.`,
      header: 'Desactivar residuo',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Confirmar',
        severity: 'danger'
      },
      accept: () => {
        this.residuosService
          .eliminar(residuo.residuo, this.autenticacionService.getDatosToken()?.codigoUsuario ?? 0)
          .pipe(finalize(() => this.buscar()))
          .subscribe({
            next: (res) => {
              if (res.codigo === 0) {
                this.mensajeService.exito('Éxito','Se desactivó el residuo correctamente');
              } else {
                this.mensajeService.error('Error',res.mensaje || 'Error al eliminar');
              }
            },
            error: (err) => this.mensajeService.errorServicioGuardado(err)
          });
      }
    });
  }

  guardar(event: string) {
    this.mensajeService.exito('Éxito', event);
    this.buscar();
  }
}
