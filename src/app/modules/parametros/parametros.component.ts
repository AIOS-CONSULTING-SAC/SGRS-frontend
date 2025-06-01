import { Component, signal } from '@angular/core';
import { ListadoComponent } from './listado/listado.component';
import { RegistroComponent } from './registro/registro.component';
import { ParametroResponse } from '../../models/parametro/parametro.interface';
import { CommonModule } from '@angular/common';
import { ParametroService } from '../../service/parametro.service';
import { MensajesToastService } from '../../shared/mensajes-toast.service';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-parametros',
  imports: [ListadoComponent, RegistroComponent, CommonModule],
  templateUrl: './parametros.component.html',
  styleUrl: './parametros.component.scss'
})
export class ParametrosComponent {
  private mostrarListadoSignal = signal(true);
  private parametroSignal = signal<ParametroResponse | any>(null);
  modulos: ParametroResponse[] = [];
  mostrarListado = this.mostrarListadoSignal.asReadonly();
  parametroSeleccionado = this.parametroSignal.asReadonly();


  constructor(private parametroService: ParametroService,
    private mensajeService: MensajesToastService,
  ){
      this.cargarModulos()
  }

    cargarModulos(): void {
      
      this.parametroService.listado(2).pipe(
        catchError(error => {
          this.mensajeService.errorServicioConsulta(error);
          return EMPTY;
        }), finalize(() => {})
      ).subscribe(response => {
        if (response.codigo === 0) {
          this.modulos = response.respuesta;
        } else {
          this.modulos = [];
        }
      });
    }
  
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
