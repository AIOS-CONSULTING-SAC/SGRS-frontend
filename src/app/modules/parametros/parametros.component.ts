import { Component, signal } from '@angular/core';
import { ListadoComponent } from './listado/listado.component';
import { RegistroComponent } from './registro/registro.component';
import { ParametroResponse } from '../../models/parametro/parametro.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parametros',
  imports: [ListadoComponent, RegistroComponent, CommonModule],
  templateUrl: './parametros.component.html',
  styleUrl: './parametros.component.scss'
})
export class ParametrosComponent {
  private mostrarListadoSignal = signal(true);
  private parametroSignal = signal<ParametroResponse | any>(null);

  mostrarListado = this.mostrarListadoSignal.asReadonly();
  parametroSeleccionado = this.parametroSignal.asReadonly();


  abrirRegistro() {
    this.parametroSignal.set(null);
    this.mostrarListadoSignal.set(false);
  }

  editarParametro(parametro: ParametroResponse) {
    this.parametroSignal.set(parametro);
    this.mostrarListadoSignal.set(false);
  }

  volverAlListado() {
    this.mostrarListadoSignal.set(true);
    this.parametroSignal.set(null);
  }
}
