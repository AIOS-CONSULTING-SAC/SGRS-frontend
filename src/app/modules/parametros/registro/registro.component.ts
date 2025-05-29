
import { ParametroResponse } from '../../../models/parametro/parametro.interface';
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
@Component({
  selector: 'app-registro',
  imports: [DropdownModule, FormsModule, LoadingComponent, ReactiveFormsModule, 
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

  constructor(private fb: FormBuilder,
     private mensajeToast: MensajesToastService,
        private parametroService: ParametroService,
        private autenticacionService: AutenticacionService,
  ) {
  this.form = this.fb.group({
    parametro: [this.parametro?.parametro || '', Validators.required],
    codModulo: [this.parametro?.codModulo || '', Validators.required],
    codOpcion: [this.parametro?.codOpcion || '', Validators.required],
    prefijo: [this.parametro?.prefijo || '', Validators.required],
    correlativo: [this.parametro?.correlativo || '', Validators.required],
    desc01: [this.parametro?.descripcion1 || '', Validators.required],
    desc02: [this.parametro?.descripcion2 || ''],
    desc03: [this.parametro?.descripcion3 || ''],
    int01: [this.parametro?.entero01 || 0],
    int02: [this.parametro?.entero02 || 0],
    idEstado: [this.parametro?.idEstado || 1, Validators.required],
    usuarioSesion: [this.autenticacionService.getDatosToken()?.codigoUsuario.toString() || ''],
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
      prefijo: clienteActual.prefijo || '',
      desc01: clienteActual.descripcion1 || '',
      desc02: clienteActual.descripcion2 || '',
      desc03: clienteActual.descripcion3 || '',
      int01: clienteActual.entero01 || 0,
      int02: clienteActual.entero02 || 0,
      idEstado: clienteActual.idEstado ?? 1
    });
  }
}
  guardar(){

  }
}
