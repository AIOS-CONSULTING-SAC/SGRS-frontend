
import { GuardarParametroRequest, ParametroResponse } from '../../../models/parametro/parametro.interface';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Button, ButtonModule } from 'primeng/button';
import { FormHelper } from '../../../shared/form.helper';
import { FormInputComponent } from '../../../shared/components/form-input.component';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { AutenticacionService } from '../../../auth/autenticacion.service';
import { ParametroService } from '../../../service/parametro.service';
import { MensajesToastService } from '../../../shared/mensajes-toast.service';
import { catchError, EMPTY, finalize } from 'rxjs';
@Component({
  selector: 'app-registro',
  imports: [DropdownModule, FormsModule,  LoadingComponent, ReactiveFormsModule,
    CommonModule, InputTextModule, ButtonModule, FormInputComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {
  @Input() parametro!: ParametroResponse;
  @Output() volver = new EventEmitter();
  form: FormGroup | any;
  formHelper !: any;
  loading: boolean = false
  @Input() modulos: ParametroResponse[] = [];

  opciones: ParametroResponse[] = [];

  prefijos: ParametroResponse[] = [];

  constructor(private fb: FormBuilder,
    private mensajeService: MensajesToastService,
    private parametroService: ParametroService,
    private autenticacionService: AutenticacionService,
  ) {
    this.form = this.fb.group({
      parametro: [this.parametro?.parametro || ''],
      codModulo: [this.parametro?.codModulo || '', Validators.required],
      codOpcion: [this.parametro?.codOpcion || '', Validators.required],
      prefijo: [this.parametro?.prefijo || '', Validators.required],
      correlativo: [this.parametro?.correlativo || ''],
      desc01: [this.parametro?.descripcion1 || '', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/), Validators.maxLength(50)]],
      desc02: [this.parametro?.descripcion2 || '', [Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/), Validators.maxLength(50)]],
      desc03: [this.parametro?.descripcion3 || '', [Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/), Validators.maxLength(50)]],
      int01: [this.parametro?.entero01 || null, [Validators.pattern(/^[0-9]+$/), Validators.maxLength(11)]],
      int02: [this.parametro?.entero02 || null, [Validators.pattern(/^[0-9]+$/), Validators.maxLength(11)]],
      idEstado: [this.parametro?.idEstado || 1, Validators.required], 
    });

  }

  ngOnInit(): void {
    this.formHelper = new FormHelper(this.form);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parametro'] && changes['parametro'].currentValue) {
      const clienteActual = changes['parametro'].currentValue;
       this.form.patchValue({
        parametro: clienteActual.parametro || '',
        codModulo: clienteActual.codModulo || '',
        codOpcion: clienteActual.codOpcion || '',
        correlativo: clienteActual.correlativo || null,
        prefijo: clienteActual.prefijo || '',
        desc01: clienteActual.descripcion1 || '',
        desc02: clienteActual.descripcion2 || '',
        desc03: clienteActual.descripcion3 || '',
        int01: clienteActual.entero01 || 0,
        int02: clienteActual.entero02 || 0,
        idEstado: clienteActual.idEstado ?? 1
      });
        let codModulo = changes['parametro'].currentValue?.codModulo;
        if(codModulo) { 
          this.cambiarModulo();
        } else{
          this.opciones = [];
          this.prefijos = [];
        }

        let codOpcion = changes['parametro'].currentValue?.codOpcion;
        if(codOpcion) {
          this.cambiarOpcion();
        } else {
          this.prefijos = [];
        }

     
    }

   
  }

  cargarModulos(): void {
    this.loading = true
    this.parametroService.listado(2).pipe(
      catchError(error => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe(response => {
      if (response.codigo === 0) {
        this.modulos = response.respuesta;
      } else {
        this.modulos = [];
      }
    });
  }

  cambiarModulo() {

    this.loading = true
    this.parametroService.listado(3, this.form.get('codModulo').value).pipe(
      catchError(error => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe(response => {
      if (response.codigo === 0) {
        this.opciones = response.respuesta;
      } else {
        this.opciones = [];
      }
    });
  }

  cambiarOpcion() {
    this.loading = true
    this.parametroService.listado(4, this.form.get('codModulo').value, this.form.get('codOpcion').value).pipe(
      catchError(error => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe(response => {
      if (response.codigo === 0) {
        this.prefijos = response.respuesta;
      } else {
        this.prefijos = [];
      }
    });
  }

  getLabel<T>(list: T[], valueKey: keyof T, labelKey: keyof T, selectedValue: any): string {
    const item = list.find(i => i[valueKey] === selectedValue);
    return item ? (item[labelKey] as string) : '';
  }

  request() {
    const formValues = this.form.value; 
    const request: GuardarParametroRequest = {
      parametro: formValues.parametro || null,
      codModulo: formValues.codModulo || '',
      descModulo: this.getLabel(this.modulos, 'codModulo', 'descModulo', formValues.codModulo),
      descOpcion: this.getLabel(this.opciones, 'codOpcion', 'descOpcion', formValues.codOpcion),
      codOpcion: formValues.codOpcion || '',
      prefijo: formValues.prefijo || '',
      correlativo: formValues.correlativo || null,
      desc01: formValues.desc01,
      desc02: formValues.desc02,
      desc03: formValues.desc03,
      int01: formValues.int01 || null,
      int02: formValues.int02 || null,
      idEstado: formValues.idEstado ?? 1, 
    };
  
    return request;
  }


  guardar() { 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.parametroService.registrar(this.request()).pipe(
      catchError(error => {
        this.mensajeService.errorServicioConsulta(error);
        return EMPTY;
      }), finalize(() => { this.loading = false })
    ).subscribe(response => {
      if (response.codigo === 0) {
        this.mensajeService.exito('Éxito', 'Registro guardado correctamente');
        this.volver.emit();
      } else {
        this.mensajeService.error('Error', response.mensaje);
      }
    });
  }
}
