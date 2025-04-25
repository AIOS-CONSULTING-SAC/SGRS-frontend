import { Component, signal } from '@angular/core';
import { ListadoComponent } from './listado/listado.component';
import { RegistroComponent } from './registro/registro.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  imports: [ListadoComponent, RegistroComponent, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent {
  private mostrarListadoSignal = signal(true);
    private objetoSignal = signal<any | null>(null);
  
    mostrarListado = this.mostrarListadoSignal.asReadonly();
    objetoSeleccionada = this.objetoSignal.asReadonly();
  
    abrirRegistro() {
      this.objetoSignal.set(null);
      this.mostrarListadoSignal.set(false);
    }
  
    editarUsuario(objeto: any) {
      this.objetoSignal.set(objeto);
      this.mostrarListadoSignal.set(false);
    }
  
    volverAlListado() {
      this.mostrarListadoSignal.set(true);
    }
}
