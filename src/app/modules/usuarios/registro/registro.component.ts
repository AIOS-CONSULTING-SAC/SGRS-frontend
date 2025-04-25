import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormInputComponent } from '../../../shared/components/form-input.component';
import { FormHelper } from '../../../shared/form.helper';

@Component({
  selector: 'app-registro',
  imports: [DropdownModule, FormsModule, ReactiveFormsModule, CommonModule, InputTextModule, ButtonModule, FormInputComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {

  @Input() usuario: any | null = null;
  @Output() volver = new EventEmitter();
  form: FormGroup | any
  formHelper !: any;

  constructor(private fb: FormBuilder,) {
    this.form = this.fb.group({
      ruc: [this.usuario?.ruc || '', Validators.required],
      razonSocial: [this.usuario?.razonSocial || '', Validators.required],
      nombreComercial: [this.usuario?.nombreComercial || '', Validators.required],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      direccion: ['', Validators.required]
    });


  }

  ngOnInit() {
    this.formHelper = new FormHelper(this.form);

    if (this.usuario) {
      this.form.patchValue(this.usuario);
 

    }
  }

  guardar() {
    /*this.empresaService.registrar(this.form.value as EmpresaDTO).subscribe(() => {
      this.volver.emit();
    });*/

    if (this.form.valid) {
      const dto: any = this.form.value;
      this.volver.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }

}
