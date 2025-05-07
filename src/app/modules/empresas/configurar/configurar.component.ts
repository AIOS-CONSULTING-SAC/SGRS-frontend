import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmpresaTO } from '../../../models/empresa/empresa.interface';
import { FormInputComponent } from '../../../shared/components/form-input.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TabsModule } from 'primeng/tabs';
import { RouterModule } from '@angular/router';
import { LocalesComponent } from './locales/locales.component'; 
import { ResiduosComponent } from './residuos/residuos.component';

@Component({
  selector: 'app-configurar',
  imports: [DropdownModule, FormsModule, ReactiveFormsModule, CommonModule, InputTextModule, 
    ButtonModule, LocalesComponent, ResiduosComponent, TabsModule,  RouterModule],
  templateUrl: './configurar.component.html',
  styleUrl: './configurar.component.scss'
})
export class ConfigurarComponent {
  @Input() empresa: EmpresaTO | null = null;
  @Output() volver = new EventEmitter();
  tabs = [
    { label: 'Locales', icon: 'pi pi-home' },
    { label: 'Residuos', icon: 'pi pi-chart-line' }
];
}
