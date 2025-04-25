import { Component, signal } from '@angular/core'; 
import { ListadoComponent } from './listado/listado.component';
import { RegistroComponent } from './registro/registro.component';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { EmpresaTO } from '../../models/empresa/empresa.interface';

@Component({
  selector: 'app-empresas',
  imports: [ListadoComponent, RegistroComponent, CommonModule],
  templateUrl: './empresas.component.html', 
   
})
export class EmpresasComponent {
  private mostrarListadoSignal = signal(true);
  private empresaSignal = signal<EmpresaTO | null>(null);

  mostrarListado = this.mostrarListadoSignal.asReadonly();
  empresaSeleccionada = this.empresaSignal.asReadonly();

  abrirRegistro() {
    this.empresaSignal.set(null);
    this.mostrarListadoSignal.set(false);
  }

  editarEmpresa(empresa: EmpresaTO) {
    this.empresaSignal.set(empresa);
    this.mostrarListadoSignal.set(false);
  }

  volverAlListado() {
    this.mostrarListadoSignal.set(true);
  }
  onAnimDone() {
    // Esto asegura que la vista se actualice después de que la animación termine.
    if (this.mostrarListadoSignal()) {
      this.mostrarListadoSignal.set(true);
    } else {
      this.mostrarListadoSignal.set(false);
    }
  }
  
}
