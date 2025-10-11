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
import { catchError, EMPTY, finalize, firstValueFrom } from 'rxjs';
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
      idEmpresa: [this.usuario?.codigoEmpresa || '', Validators.required],

      codTipoUser: [this.usuario?.codTipoUser || '', [Validators.required]],
      codPerfil: [this.usuario?.codPerfil || null],
      codCliente: [this.usuario?.codCliente || null],
      codTipoDoc: [this.usuario?.codTipoDoc || '', [Validators.required]],
      ndoc: [this.usuario?.ndoc || '', [Validators.required]],
      nombre: [this.usuario?.nombre || '', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), Validators.maxLength(100)]],
      apellidoP: [this.usuario?.apellidoP || '', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), Validators.maxLength(100)]],
      apellidoM: [this.usuario?.apellidoM || '', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), Validators.maxLength(100)]],
      telefono: [this.usuario?.telefono || '', [Validators.minLength(7), Validators.maxLength(20), Validators.pattern(/^[0-9]+$/)]],
      correo: [this.usuario?.correo || '', [Validators.required, Validators.email, Validators.maxLength(100)]],
      idEstado: [this.usuario?.idEstado ?? 1],
    });



    // Inicializa la validación si ya hay valor cargado
    this.actualizarValidacionNdoc(this.form.get('codTipoDoc').value);
  }

  ngOnInit() {
    this.formHelper = new FormHelper(this.form);
    this.cambiarTipoUsuario()
    if (this.usuario) {

    }
  }

  cambiarTipoDoc() {

    const valor = this.form.get('codTipoDoc').value;
    this.actualizarValidacionNdoc(valor);
  }

  actualizarValidacionNdoc(codTipoDoc: string | number) {
    const ndocCtrl = this.form.get('ndoc');

    if (!ndocCtrl) return;

    let validators = [Validators.required];

    if (codTipoDoc === 1) {
      // DNI: solo números, 8 dígitos
      validators.push(Validators.pattern(/^[0-9]{8}$/));
    } else if (codTipoDoc === 2) {
      // RUC: solo números, 11 dígitos
      validators.push(Validators.pattern(/^[0-9]{11}$/));
    } else {
      // Otros: máximo 15 caracteres numéricos
      validators.push(Validators.pattern(/^[0-9]+$/), Validators.maxLength(15));
    }

    ndocCtrl.setValidators(validators);
    ndocCtrl.updateValueAndValidity();
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
        idCliente?.setValidators(Validators.required);
        idPerfil?.clearValidators();
      } else if (tipoUser === 2) {
        idPerfil?.setValidators(Validators.required);
        idCliente?.clearValidators();
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

  async cargarTipoUsuario(): Promise<void> {
    this.loading = true;
    try {
      const response = await firstValueFrom(this.parametroService.listado(
        1,
        PARAMETROS.MODULOS.MANTENIMIENTO,
        PARAMETROS.MANTENIMIENTO.OPCIONES.USUARIOS,
        PARAMETROS.MANTENIMIENTO.USUARIOS.TIPO_USUARIO
      ));
      this.tipoUsuario = response.codigo === 0 ? response.respuesta : [];
    } catch (error) {
      this.mensajeToast.errorServicioConsulta(error);
      this.tipoUsuario = [];
    } finally {
      this.loading = false;
    }
  }


  async cargarPerfiles(): Promise<void> {
    this.loading = true;
    try {
      const response = await firstValueFrom(this.parametroService.listado(
        1,
        PARAMETROS.MODULOS.MANTENIMIENTO,
        PARAMETROS.MANTENIMIENTO.OPCIONES.USUARIOS,
        PARAMETROS.MANTENIMIENTO.USUARIOS.TIPO_PERFIL
      ));
      this.tipoPerfil = response.codigo === 0 ? response.respuesta : [];
    } catch (error) {
      this.mensajeToast.errorServicioConsulta(error);
      this.tipoPerfil = [];
    } finally {
      this.loading = false;
    }
  }


  async cargarClientes(): Promise<void> {
    this.loading = true;
    try {
      const codigoEmpresa = this.autenticacionService.getDatosToken()?.codigoEmpresa;
      const response = await firstValueFrom(this.clienteService.listado(codigoEmpresa));
      this.empresas = response.codigo === 0 ? response.respuesta : [];
    } catch (error) {
      this.mensajeToast.errorServicioConsulta(error);
      this.empresas = [];
    } finally {
      this.loading = false;
    }
  }


  async cargarTipoDoc(): Promise<void> {
    this.loading = true;
    try {
      const response = await firstValueFrom(this.parametroService.listado(
        1,
        PARAMETROS.MODULOS.MANTENIMIENTO,
        PARAMETROS.MANTENIMIENTO.OPCIONES.USUARIOS,
        PARAMETROS.MANTENIMIENTO.USUARIOS.TIPO_DOCUMENTO
      ));
      this.tipoDocumento = response.codigo === 0 ? response.respuesta : [];
    } catch (error) {
      this.mensajeToast.errorServicioConsulta(error);
      this.tipoDocumento = [];
    } finally {
      this.loading = false;
    }
  }




  request(): GuardarUsuarioRequest {
    return {
      idUsuario: this.form.get('usuario').value,
      idEmpresa: this.autenticacionService.getDatosToken()?.codigoEmpresa ?? 0,
      idCliente: this.form.get('codCliente').value,
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
    };
  }

  guardar() {
    this.form.get('idEmpresa').setValue(this.autenticacionService.getDatosToken()?.codigoEmpresa)

    if (this.form.valid) {
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
          this.volver.emit();
        } else {
          this.mensajeToast.error('Error', mensaje)
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }


}
