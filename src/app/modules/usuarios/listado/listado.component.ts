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
import { ClienteResponse, ListadoClientesResponse } from '../../../models/cliente/cliente.interface';
import { catchError, EMPTY, finalize, forkJoin } from 'rxjs';
import { AutenticacionService } from '../../../auth/autenticacion.service';
import { ParametroService } from '../../../service/parametro.service';
import { PARAMETROS } from '../../../shared/sistema-enums';
import { ParametroResponse } from '../../../models/parametro/parametro.interface';
import { ClienteService } from '../../../service/cliente.service';

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

  empresa: string = '';

  ruc = '';
  nombres: string = ''
  estado: any = '1';

  tipoUsuario: ParametroResponse[] = [];
  idTipoUsuario: string = '';
  tipoPerfil: ParametroResponse[] = [];
  empresas: ClienteResponse[] = [];
  idTipoPerfil: string = '';
  @Output() registrar = new EventEmitter();
  @Output() editar = new EventEmitter<UsuarioResponse>();

  constructor(
    private confirmationService: ConfirmationService,
    private mensajeToast: MensajesToastService,
    private usuarioService: UsuarioService,
    private clienteService: ClienteService,
    private parametroService: ParametroService,
    private autenticacionService: AutenticacionService
  ) {
    this.cargarDatosIniciales()
    //this.buscar();
  }

  private obtenerClientes() {
    return this.clienteService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa).pipe(
      catchError(error => {
        this.mensajeToast.errorServicioConsulta(error);
        return EMPTY;
      })
    );
  }

  private obtenerTipoUsuario() {
    return this.parametroService.listado(
      1,PARAMETROS.MODULOS.MANTENIMIENTO,
      PARAMETROS.MANTENIMIENTO.OPCIONES.USUARIOS,
      PARAMETROS.MANTENIMIENTO.USUARIOS.TIPO_USUARIO
    ).pipe(
      catchError(error => {
        this.mensajeToast.errorServicioConsulta(error);
        return EMPTY;
      })
    );
  }

  private obtenerPerfiles() {
    return this.parametroService.listado(
     1, PARAMETROS.MODULOS.MANTENIMIENTO,
      PARAMETROS.MANTENIMIENTO.OPCIONES.USUARIOS,
      PARAMETROS.MANTENIMIENTO.USUARIOS.TIPO_PERFIL
    ).pipe(
      catchError(error => {
        this.mensajeToast.errorServicioConsulta(error);
        return EMPTY;
      })
    );
  }

  cargarDatosIniciales(): void {
    this.loading = true;
    forkJoin([
      this.obtenerClientes(),
      this.obtenerTipoUsuario(),
      this.obtenerPerfiles()
    ]).pipe(
      finalize(() => this.loading = false)
    ).subscribe(([clientesResp, tipoUsuarioResp, perfilesResp]) => {
      this.empresas = clientesResp?.codigo === 0 ? clientesResp.respuesta : [];
      this.tipoUsuario = tipoUsuarioResp?.codigo === 0 ? tipoUsuarioResp.respuesta : [];
      this.tipoPerfil = perfilesResp?.codigo === 0 ? perfilesResp.respuesta : [];
    });
  }


  cambiarTipoUsuario() {
    this.usuarios =[]
  }

  buscar() {
    this.loading = true;
    if (this.idTipoUsuario == '') {
      this.mensajeToast.error('Error', 'Debe seleccionar un tipo de usuario.');
      this.loading = false
      return
    }
    this.usuarioService
      .listar({
        tipoUser: this.idTipoUsuario ? +this.idTipoUsuario : undefined,
        perfil: this.idTipoPerfil ? +this.idTipoPerfil : undefined,
        nroDocumento: this.ruc,
        nombre: this.nombres,
        idEstado: this.estado,
      }).pipe(
        catchError((errorResponse: any) => {
          this.mensajeToast.errorServicioConsulta(errorResponse);

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
    this.idTipoUsuario = ''
    this.idTipoPerfil = '';
    this.ruc = '';
    this.nombres = ''
    this.estado = 'Activo';
    this.usuarios = []
  }

  eliminar(usuario: UsuarioResponse) {
    this.confirmationService.confirm({

      message: '¿Está seguro que desea desactivar el usuario <b>' + usuario.correo + '</b> ? <br /><br />Podrá reactivarlo en cualquier momento.',
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
        this.usuarioService.eliminar(usuario.usuario)
          .pipe(finalize(() => this.buscar()))
          .subscribe({
            next: (res) => {
              if (res.codigo === 0) {
                this.mensajeToast.exito('Éxito', 'Se desactivó el usuario correctamente');
              } else {
                this.mensajeToast.error('Error', res.mensaje || 'Error al eliminar');
              }
            },
            error: (err) => this.mensajeToast.errorServicioGuardado(err)
          });
      },
    });
  }
}
