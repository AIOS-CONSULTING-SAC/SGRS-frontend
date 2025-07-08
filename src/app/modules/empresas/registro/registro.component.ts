import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { EmpresaTO, GuardarEmpresaRequest } from '../../../models/empresa/empresa.interface';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button, ButtonModule } from 'primeng/button';
import { FormHelper } from '../../../shared/form.helper';
import { FormInputComponent } from '../../../shared/components/form-input.component';
import { EmpresaService } from '../../../service/empresa.service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { MensajesToastService } from '../../../shared/mensajes-toast.service';
import { ApiResponse, ApiResponseCrud } from '../../../models/respuesta';
import { ParametroService } from '../../../service/parametro.service';
import { ParametroResponse } from '../../../models/parametro/parametro.interface';
import { ClienteService } from '../../../service/cliente.service';
import { ClienteResponse, GuardarClienteRequest } from '../../../models/cliente/cliente.interface';
import { AutenticacionService } from '../../../auth/autenticacion.service';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { PARAMETROS } from '../../../shared/sistema-enums';
import { rucValidator } from '../../../shared/ruc-validator';

@Component({
  selector: 'app-registro',
  imports: [DropdownModule, FormsModule, LoadingComponent, ReactiveFormsModule, CommonModule, InputTextModule, ButtonModule, FormInputComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  @Input() cliente!: ClienteResponse;
  @Output() volver = new EventEmitter();
  form: FormGroup | any;
  formHelper !: any;
  departamentos: ParametroResponse[] = [];
  provincias: ParametroResponse[] = [];
  distritos: ParametroResponse[] = [];
  loading: boolean = false
  constructor(private fb: FormBuilder,
    private mensajeToast: MensajesToastService,
    private parametroService: ParametroService,
    private autenticacionService: AutenticacionService,
    private clienteService: ClienteService) {

    this.form = this.fb.group({
      codEmpresa: [this.cliente?.codEmpresa || '', Validators.required],
      cliente: [this.cliente?.cliente || '', Validators.required],
      ruc: [this.cliente?.ruc || '', [
        Validators.required,
        Validators.maxLength(15),
        rucValidator
      ]],
      razonSocial: [this.cliente?.razonSocial || '', [Validators.required,  Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/), Validators.maxLength(100)]],
      nombreComercial: [this.cliente?.nombreComercial || '', [Validators.required,  Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/), Validators.maxLength(100)]],
      idDepartamento: ['', Validators.required],
      idProvincia: ['', Validators.required],
      idDistrito: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/),Validators.maxLength(400)]],
      idEstado: [''], 
    });

  }


  ngOnInit() {
    this.formHelper = new FormHelper(this.form);

    if (this.cliente) {

      this.form.get('ruc').disable();
    }
    this.cargarDepartamentos();

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue(changes['cliente'].currentValue);
    let idDepartamento = changes['cliente'].currentValue?.idDepartamento;

    if (idDepartamento) {
      this.cargarProvincias(idDepartamento);
    } else {
      this.provincias = [];
      this.distritos = [];
    }

    let idProvincia = changes['cliente'].currentValue?.idProvincia;

    if (idProvincia) {
      this.cargarDistritos(idDepartamento, idProvincia);
    } else {
      this.distritos = [];
    }
  }

  cambiarDepartamento() {
    this.provincias = [];
    this.distritos = [];
    this.form.get('idProvincia').setValue(null)
    this.form.get('idDistrito').setValue(null)
    this.cargarProvincias(this.form.get('idDepartamento').value)
  }

  cambiarProvincia() {
    this.distritos = []
    this.form.get('idDistrito').setValue(null)
    const { idDepartamento, idProvincia } = this.form.value
    this.cargarDistritos(idDepartamento, idProvincia)
  }
  cargarDepartamentos(): void {
    this.parametroService.listado(1, PARAMETROS.MODULOS.MANTENIMIENTO,
      PARAMETROS.MANTENIMIENTO.OPCIONES.EMPRESAS,
      PARAMETROS.MANTENIMIENTO.EMPRESAS.DEPARTAMENTOS).pipe(
        catchError(error => {
          this.mensajeToast.errorServicioConsulta(error);
          return EMPTY;
        })
      ).subscribe(response => {
        if (response.codigo === 0) {
          this.departamentos = response.respuesta;
        } else {
          this.departamentos = [];
        }
      });
  }

  cargarProvincias(idDepartamento: number): void {
    this.loading = true
    this.parametroService.listado(1, PARAMETROS.MODULOS.MANTENIMIENTO,
      PARAMETROS.MANTENIMIENTO.OPCIONES.EMPRESAS,
      PARAMETROS.MANTENIMIENTO.EMPRESAS.PROVINCIAS, "", "", "", idDepartamento).pipe(
        catchError(error => {
          this.mensajeToast.errorServicioConsulta(error);
          return EMPTY;
        }), finalize(() => { this.loading = false })
      ).subscribe(response => {
        if (response.codigo === 0) {
          this.provincias = response.respuesta;
        } else {
          this.provincias = [];
        }
      });
  }

  cargarDistritos(idDepartamento: number, idProvincia: number): void {
    this.loading = true
    this.parametroService.listado(1, PARAMETROS.MODULOS.MANTENIMIENTO,
      PARAMETROS.MANTENIMIENTO.OPCIONES.EMPRESAS,
      PARAMETROS.MANTENIMIENTO.EMPRESAS.DISTRITOS, "", "", "", idDepartamento, idProvincia).pipe(
        catchError(error => {
          this.mensajeToast.errorServicioConsulta(error);
          return EMPTY;
        }), finalize(() => { this.loading = false })
      ).subscribe(response => {
        if (response.codigo === 0) {
          this.distritos = response.respuesta;
        } else {
          this.distritos = [];
        }
      });
  }


  request(): GuardarClienteRequest {
    return {
      codEmpresa: this.autenticacionService.getDatosToken()?.codigoEmpresa ?? 0,
      cliente: this.form.get('cliente').value ?? null,
      ruc: this.form.get('ruc').value,
      razonSocial: this.form.get('razonSocial').value,
      nombreComercial: this.form.get('nombreComercial').value,
      direccion: this.form.get('direccion').value,
      idDepartamento: this.form.get('idDepartamento').value,
      idProvincia: this.form.get('idProvincia').value,
      idDistrito: this.form.get('idDistrito').value,
      idEstado: this.form.get('idEstado').value || 0, 
    };
  }

  guardar() {
    this.loading = true
    this.clienteService.registrar(this.request()).pipe(
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
  }
}
