import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ListadoUsuarioResponse, UsuarioResponse } from '../../../models/usuario/usuario.interface';
import { CommonModule } from '@angular/common';
import { MensajesToastService } from '../../../shared/mensajes-toast.service';
import { UsuarioService } from '../../../service/usuario.service';
import { ListadoClientesResponse } from '../../../models/cliente/cliente.interface';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-listado',
  imports: [FormsModule, TableModule, CommonModule, DropdownModule, ButtonModule, InputTextModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent {
  usuarios: UsuarioResponse[] = [];
  loading = false;

  tipoUsuario: '1' | '2' | '' = '1';
  empresa: string = '';
  rol: string = '';
  ruc = '';
  estado: 'Activo' | 'Inactivo' | '' = 'Activo';

  @Output() registrar = new EventEmitter();
  @Output() editar = new EventEmitter<UsuarioResponse>();

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MensajesToastService,
    private usuarioService: UsuarioService
  ) {
    this.buscar();
  }

  buscar() {
    this.loading = true;
    const estadoNumerico = this.estado === 'Activo' ? 1 : this.estado === 'Inactivo' ? 0 : undefined;

    this.usuarioService
      .listar({
        codEmpresa: this.tipoUsuario === '2' ? +this.empresa : undefined,
        codCliente: undefined,
        idEstado: estadoNumerico,
      }).pipe(
        catchError((errorResponse: any) => {
          this.messageService.errorServicioConsulta(errorResponse);

          return EMPTY;
        }), finalize(() => { this.loading = false })
      )
      .subscribe((response: ListadoUsuarioResponse) => {
        const { respuesta, codigo } = response;
        if (codigo === 0) this.usuarios = respuesta
        else this.usuarios = []

      });

    this.loading = true;

  }

  limpiar() {
    this.empresa = '';
    this.rol = '';
    this.ruc = '';
    this.estado = 'Activo';
    this.buscar();
  }

  eliminar(usuario: UsuarioResponse) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea desactivar el usuario <b>${usuario.nombres}</b>?<br><br>Podrá reactivarlo en cualquier momento.`,
      header: 'Eliminar usuario',
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
        const usuarioSesion = 1; // <-- reemplazar con ID real del usuario logueado

        this.usuarioService.eliminar(usuario.id, usuarioSesion).subscribe({
          next: () => {
            this.messageService.exito('Éxito', `El usuario <b>${usuario.nombres}</b> fue desactivado correctamente.`);
            this.buscar(); // recarga el listado
          },
          error: () => {
            this.messageService.error('Error', 'No se pudo desactivar el usuario.');
          },
        });
      },
    });
  }
}
