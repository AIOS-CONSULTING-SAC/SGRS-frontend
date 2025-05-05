import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpresaTO, GuardarEmpresaRequest } from '../../../models/empresa/empresa.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-registro',
  imports: [DropdownModule, FormsModule,ReactiveFormsModule, CommonModule, InputTextModule, ButtonModule, FormInputComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  @Input() empresa: EmpresaTO | null = null;
  @Output() volver = new EventEmitter();
  form:  FormGroup | any;
  formHelper !: any;
  constructor(private fb: FormBuilder,
    private mensajeToast: MensajesToastService,
    private empresaService: EmpresaService ) {
    this.form = this.fb.group({
      ruc: [this.empresa?.ruc || '', Validators.required],
      razonSocial: [this.empresa?.razonSocial || '', Validators.required],
      nombreComercial: [this.empresa?.nombreComercial || '', Validators.required],
      departamento: ['', Validators.required],
      provincia: [''],
      distrito: [''],
      direccion: ['', Validators.required],
      idEstado: [''],
    });
  
  }

  ngOnInit() { 
    this.formHelper = new FormHelper(this.form);
    
    if (this.empresa) {
      this.form.patchValue(this.empresa);
      
        this.form.get('ruc').disable();
     
    }
  }

  request(): GuardarEmpresaRequest {
    return {
      id: this.empresa?.id || null,
      ruc: this.form.get('ruc').value,
      razonSocial: this.form.get('razonSocial').value,
      nombreComercial: this.form.get('nombreComercial').value,
      direccion: this.form.get('direccion').value,
      idEstado: this.empresa?.idEstado || 1, 
      usuarioSesion: 1 
    };
  }

  guardar() { 
   
    this.empresaService.registrar(this.form.value as GuardarEmpresaRequest).pipe(
      catchError((errorResponse: any) => {
        this.mensajeToast.errorServicioGuardado(errorResponse);
        return EMPTY;
      }), finalize(() => {} )
    ).subscribe((response: ApiResponseCrud) => {
      const { respuesta, codigo, mensaje } = response;
      if(codigo === 0 &&  respuesta =='200') { 
        
      }
    });
  }
}
