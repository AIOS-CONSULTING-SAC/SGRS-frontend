import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormInputComponent } from '../../../shared/components/form-input.component';
import { FormHelper } from '../../../shared/form.helper';
import { GuardarUsuarioRequest, UsuarioResponse } from '../../../models/usuario/usuario.interface';
import { ParametroResponse } from '../../../models/parametro/parametro.interface';
import { MensajesToastService } from '../../../shared/mensajes-toast.service';
import { ParametroService } from '../../../service/parametro.service';
import { AutenticacionService } from '../../../auth/autenticacion.service';
import { UsuarioService } from '../../../service/usuario.service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { ApiResponseCrud } from '../../../models/respuesta';
import { ClienteService } from '../../../service/cliente.service';
import { ClienteResponse, ListadoClientesResponse } from '../../../models/cliente/cliente.interface';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { PARAMETROS } from '../../../shared/sistema-enums';

@Component({
  selector: 'app-registro',
  imports: [DropdownModule, FormsModule, LoadingComponent, ReactiveFormsModule, CommonModule, InputTextModule, ButtonModule, FormInputComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  @Input() usuario!: UsuarioResponse;
  @Output() volver = new EventEmitter();
  form: FormGroup | any;
  formHelper !: any;
  tipoUsuario: ParametroResponse[] = [];
  tipoPerfil: ParametroResponse[] = [];
  tipoDocumento: ParametroResponse[] = [];
  estados: any[] = [];
  empresas: ClienteResponse[] = [];
  loading: boolean = false
  constructor(private fb: FormBuilder,
    private mensajeToast: MensajesToastService,
    private parametroService: ParametroService,
    private clienteService: ClienteService,
    private autenticacionService: AutenticacionService,
    private usuarioService: UsuarioService) {
    this.cargarTipoUsuario();
    this.cargarPerfiles();
    this.cargarClientes()
    this.cargarTipoDoc()
    this.setearEstados()
    this.form = this.fb.group({
      usuario: [this.usuario?.usuario || null],
      idEmpresa: [this.usuario?.codEmpresa || '', Validators.required],

      codTipoUser: [this.usuario?.codTipoUser || '', Validators.required],
      codPerfil: [this.usuario?.codPerfil || null],
      codCliente: [this.usuario?.codCliente || null],
      codTipoDoc: [this.usuario?.codTipoDoc || '', Validators.required],
      ndoc: [this.usuario?.ndoc || '', Validators.required],
      nombre: [this.usuario?.nombre || '', Validators.required],
      apellidoP: [this.usuario?.apellidoP || '', Validators.required],
      apellidoM: [this.usuario?.apellidoM || '', Validators.required],
      telefono: [this.usuario?.telefono || ''],
      correo: [this.usuario?.correo || '', [Validators.required, Validators.email]],
      idEstado: [this.usuario?.idEstado ?? 1],
      usuarioSesion: [this.autenticacionService.getDatosToken()?.codigoUsuario.toString() ?? ''],
    });
  }

  ngOnInit() {
    this.formHelper = new FormHelper(this.form);

    if (this.usuario) {

    }
  }

  setearEstados() {
    this.estados = [
      { codigo: 1, descripcion: 'Activo' },
      { codigo: 0, descripcion: 'Inactivo' }
    ];
  }

  cambiarTipoUsuario() {
    this.form.get('codTipoUser')?.valueChanges.subscribe((tipoUser: any) => {
      const idPerfil = this.form.get('codPerfil');
      const idCliente = this.form.get('codCliente');

      if (tipoUser === 1) {
        idPerfil?.setValidators(Validators.required);
        idCliente?.clearValidators();
      } else if (tipoUser === 2) {
        idCliente?.setValidators(Validators.required);
        idPerfil?.clearValidators();
      } else {
        idPerfil?.clearValidators();
        idCliente?.clearValidators();
      }

      idPerfil?.updateValueAndValidity();
      idCliente?.updateValueAndValidity();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue(changes['usuario'].currentValue);
    this.cambiarTipoUsuario()
    const modificarUsuario = this.form.get('usuario').value !== null
    if (modificarUsuario) {
      this.form.get('correo').disable();
      this.form.get('usuario').disable();
    } else {
      this.form.get('correo').enable();
    }
    const bloquearUsuarioExt = modificarUsuario && this.form.get('codTipoUser').value == 1;
    if (bloquearUsuarioExt) {
      this.form.get('codCliente').disable();
    } else {
      this.form.get('codCliente').enable();
    }
  }

  cargarTipoUsuario(): void {
    this.loading = true
    this.parametroService.listado(PARAMETROS.MODULOS.MANTENIMIENTO,
      PARAMETROS.MANTENIMIENTO.OPCIONES.USUARIOS,
      PARAMETROS.MANTENIMIENTO.USUARIOS.TIPO_USUARIO).pipe(
        catchError(error => {
          this.mensajeToast.errorServicioConsulta(error);
          return EMPTY;
        }), finalize(() => { this.loading = false })
      ).subscribe(response => {
        if (response.codigo === 0) {
          this.tipoUsuario = response.respuesta;
        } else {
          this.tipoUsuario = [];
        }
      });
  }

  cargarPerfiles(): void {
    this.loading = true

    this.parametroService.listado(PARAMETROS.MODULOS.MANTENIMIENTO, 
      PARAMETROS.MANTENIMIENTO.OPCIONES.USUARIOS, 
    PARAMETROS.MANTENIMIENTO.USUARIOS.TIPO_PERFIL).pipe(
      catchError(error => {
        this.mensajeToast.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe(response => {
      if (response.codigo === 0) {
        this.tipoPerfil = response.respuesta;
      } else {
        this.tipoPerfil = [];
      }
    });
  }

  cargarClientes() {
    this.loading = true
    this.clienteService.listado(this.autenticacionService.getDatosToken()?.codigoEmpresa).pipe(
      catchError(error => {
        this.mensajeToast.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe((response: ListadoClientesResponse) => {
      const { respuesta, codigo } = response;
      if (codigo === 0) this.empresas = respuesta
      else this.empresas = []

    });
  }

  cargarTipoDoc(): void {
    this.loading = true
    this.parametroService.listado(PARAMETROS.MODULOS.MANTENIMIENTO, 
      PARAMETROS.MANTENIMIENTO.OPCIONES.USUARIOS, 
    PARAMETROS.MANTENIMIENTO.USUARIOS.TIPO_DOCUMENTO).pipe(
      catchError(error => {
        this.mensajeToast.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe(response => {

      this.tipoDocumento = response.codigo === 0 && response.respuesta.length > 0 ? response.respuesta : [];

    });
  }

  

  request(): GuardarUsuarioRequest {
    return {
      idUsuario: this.form.get('usuario').value,
      idEmpresa: this.autenticacionService.getDatosToken()?.codigoUsuario ?? 0,
      idcliente: this.form.get('codCliente').value,
      idTipoUser: this.form.get('codTipoUser').value,
      idPerfil: this.form.get('codPerfil').value,

      idTipoDoc: this.form.get('codTipoDoc').value,
      ndoc: this.form.get('ndoc').value,
      nombre: this.form.get('nombre').value,
      apellidoP: this.form.get('apellidoP').value,
      apellidoM: this.form.get('apellidoM').value,
      telefono: this.form.get('telefono').value,
      correo: this.form.get('correo').value,
      idEstado: this.form.get('idEstado').value,

      usuarioSesion: this.autenticacionService.getDatosToken()?.codigoUsuario ?? 0
    };
  }

  guardar() {
    this.loading = true
    this.usuarioService.registrar(this.request()).pipe(
      catchError((errorResponse: any) => {
        this.mensajeToast.errorServicioGuardado(errorResponse);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe((response: ApiResponseCrud) => {
      const { respuesta, codigo, mensaje } = response;
      if (codigo === 0 && respuesta == '200') {
        this.mensajeToast.exito('Éxito', mensaje)
      } else {
        this.mensajeToast.error('Error', mensaje)
      }
    });
  }
}
