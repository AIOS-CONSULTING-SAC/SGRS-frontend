import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { FormInputComponent } from '../../../../../shared/components/form-input.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { LocalService } from '../../../../../service/local.service';
import { ClienteResponse } from '../../../../../models/cliente/cliente.interface';
import { AutenticacionService } from '../../../../../auth/autenticacion.service';
import { GuardarLocalRequest } from '../../../../../models/local/local.interface';
import { catchError, EMPTY, finalize } from 'rxjs';
import { ApiResponseCrud } from '../../../../../models/respuesta';
import { MensajesToastService } from '../../../../../shared/mensajes-toast.service';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { FormHelper } from '../../../../../shared/form.helper';

@Component({
  selector: 'app-registrar-local',
  imports: [DialogModule, FormsModule, ReactiveFormsModule, LoadingComponent, CommonModule, FormInputComponent, DropdownModule, ButtonModule],
  templateUrl: './registrar-local.component.html',
  styleUrl: './registrar-local.component.scss'
})
export class RegistrarLocalComponent implements OnInit {
  visible: boolean = false
  titulo: string = 'Registrar Local'
  loading: boolean = false
  form: FormGroup | any;
  formHelper !: any;
  @Output() volver = new EventEmitter();
  @Output() guardado = new EventEmitter<string>();
  @Input() cliente!: ClienteResponse;
  constructor(private fb: FormBuilder,
    private localService: LocalService,

    private mensajeService: MensajesToastService,
    private autenticacionService: AutenticacionService
  ) {
    this.form = this.fb.group({
      local: [null],
      codCliente: [this.cliente?.cliente],
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      idEstado: [1,Validators.required], 
      usuarioSesion: [this.autenticacionService.getDatosToken()?.codigoUsuario.toString() ?? ''],
    });
  }

  ngOnInit(): void {
    this.formHelper = new FormHelper(this.form);

  }

  guardar() {
    if (this.form.valid) {
      const request: GuardarLocalRequest = {
        local: this.form.get('local').value ?? null,
        codCliente: this.cliente.cliente,
        usuarioSesion: this.form.get('usuarioSesion').value,
        nombre: this.form.get('nombre').value,
        direccion: this.form.get('direccion').value,
        idEstado: this.form.get('idEstado').value,
        idDepartamento: 0,
        idProvincia: 0,
        idDistrito: 0,
      }
      this.loading = true;
      this.localService.registrar(request).pipe(
        catchError((errorResponse: any) => {
          this.mensajeService.errorServicioGuardado(errorResponse);
          return EMPTY;
        }), finalize(() => { this.loading = false; })
      ).subscribe((response: ApiResponseCrud) => {
        const { respuesta, codigo, mensaje } = response;
        if (codigo === 0 && respuesta == '200') {
          this.guardado.emit(mensaje);
          this.form.reset();
          this.visible = false;
        } else {
          this.mensajeService.error('Error', mensaje);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancelar() {
    this.visible = false
    this.form.markAsUntouched();
  }
}
