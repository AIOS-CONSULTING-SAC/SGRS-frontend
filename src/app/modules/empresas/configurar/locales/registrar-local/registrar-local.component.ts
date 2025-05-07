import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { FormInputComponent } from '../../../../../shared/components/form-input.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-registrar-local',
  imports: [DialogModule, FormsModule, ReactiveFormsModule, CommonModule, FormInputComponent, DropdownModule, ButtonModule],
  templateUrl: './registrar-local.component.html',
  styleUrl: './registrar-local.component.scss'
})
export class RegistrarLocalComponent {
  visible: boolean = false
  titulo: string = 'Registrar Local'
  form: FormGroup | any;
  formHelper !: any;
  @Output() volver = new EventEmitter();

  constructor(private fb: FormBuilder,) {
    this.form = this.fb.group({

      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      idEstado: [''],
    });
  }

  guardar() {

  }
}
