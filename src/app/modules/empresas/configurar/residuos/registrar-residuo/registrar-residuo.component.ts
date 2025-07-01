import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { ClienteResponse } from '../../../../../models/cliente/cliente.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormHelper } from '../../../../../shared/form.helper';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormInputComponent } from '../../../../../shared/components/form-input.component';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { ResiduoService } from '../../../../../service/residuo.service';

import { catchError, EMPTY, finalize } from 'rxjs';
import { MensajesToastService } from '../../../../../shared/mensajes-toast.service';
import { GuardarResiduoRequest } from '../../../../../models/residuo/residuo.interface';
import { AutenticacionService } from '../../../../../auth/autenticacion.service';
import { ApiResponseCrud } from '../../../../../models/respuesta';
import { ParametroService } from '../../../../../service/parametro.service';
import { PARAMETROS } from '../../../../../shared/sistema-enums';
import { ParametroResponse } from '../../../../../models/parametro/parametro.interface';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

@Component({
  selector: 'app-registrar-residuo',
  templateUrl: './registrar-residuo.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, CommonModule,
    FormInputComponent, DropdownModule, FormsModule, LoadingComponent],
})
export class RegistrarResiduoComponent implements OnInit {
  @Output() actualizado = new EventEmitter<void>(); 
  visible = signal(false);
  titulo = signal('Registrar residuo');
  form: FormGroup | any;
  formHelper !: any;
  unidadesMedida: ParametroResponse[] = []

  loading = signal(false);
  @Output() guardado = new EventEmitter<string>();
  @Input() cliente!: ClienteResponse;
  constructor(
    private fb: FormBuilder,
    private residuosService: ResiduoService,
    private mensajeService: MensajesToastService,
    private parametroService: ParametroService,
    private autenticacionService: AutenticacionService
  ) {
    this.setearForm()
  }

  ngOnInit(): void {
    this.formHelper = new FormHelper(this.form);
    this.cargarUnidadesMedida()
  }
  abrir(titulo: string, data?: any) {
     this.visible.set(true);
    this.form.reset({ idEstado: 1 });
     
    this.titulo.set(titulo);
    if (data) this.form.patchValue(data)
    else this.setearForm()
   
  }

  setearForm() {
    this.form = this.fb.group({
      residuo: [null],
      codCliente: [this.cliente?.cliente],
      descripcion: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/)]],
      idUnidad: [null, Validators.required],
      idEstado: [1, Validators.required],
    });
  }
  cerrar() {
    this.form.reset({ idEstado: 1 });
    this.visible.set(false);
  }

  cargarUnidadesMedida(): void {

    this.parametroService.listado(1, PARAMETROS.MODULOS.MANTENIMIENTO,
      PARAMETROS.MANTENIMIENTO.OPCIONES.EMPRESAS,
      PARAMETROS.MANTENIMIENTO.EMPRESAS.UNIDADES_MEDIDA).pipe(
        catchError(error => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }), finalize(() => { })
      ).subscribe(response => {
        this.unidadesMedida = response.codigo === 0 ? response.respuesta ?? [] : [];
      });
  }
  guardar() {
    if (this.form.valid) {

      const formValue: GuardarResiduoRequest = this.form.getRawValue();
      const peticion = formValue.residuo
        ? this.residuosService.actualizar(formValue)
        : this.residuosService.registrar(formValue);

      this.loading.set(true);
      peticion.pipe(
        catchError((errorResponse: any) => {
          this.mensajeService.errorServicioGuardado(errorResponse);
          return EMPTY;
        }), finalize(() => { this.loading.set(false); })
      ).subscribe((response: ApiResponseCrud) => {
        const { respuesta, codigo, mensaje } = response;
        if (codigo === 0 && respuesta == '200') {
          this.guardado.emit(mensaje);
          this.form.reset();
          this.visible.set(false);
        } else {
          this.mensajeService.error('Error', mensaje);
        }
      });

    } else {
      this.form.markAllAsTouched();
      return;
    }
  }

  cancelar() {
    this.cerrar();
  }
}
