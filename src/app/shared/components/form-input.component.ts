import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-form-input',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, InputTextModule],
  template: `
    <div [formGroup]="formGroup">
      <label class="block text-sm font-medium text-slate-700 mb-1">
        {{ label }} <small *ngIf="required" class="p-error">*</small>
      </label>
      <input
        pInputText 
        [formControlName]="controlName"
        [placeholder]="placeholder" [maxLength]="maxLength"
        [class]="formHelper?.esClaseInvalido(controlName)"
        class="w-full"
      />
      <small *ngIf="formHelper?.esCampoInvalido(controlName)" class="p-error">
        {{ formHelper?.obtenerMensajeErrorDefecto() }}
      </small>
    </div>
  `
})
export class FormInputComponent {
  @Input() formGroup!: FormGroup;
  @Input() controlName!: string;
  @Input() label!: string;
  @Input() maxLength!: number;
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() formHelper: any;

}
