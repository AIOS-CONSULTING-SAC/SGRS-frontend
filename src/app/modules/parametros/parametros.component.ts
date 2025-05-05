import { Component } from '@angular/core';
import { ListadoComponent } from './listado/listado.component';
import { RegistroComponent } from './registro/registro.component';

@Component({
  selector: 'app-parametros',
  imports: [ListadoComponent, RegistroComponent],
  templateUrl: './parametros.component.html',
  styleUrl: './parametros.component.scss'
})
export class ParametrosComponent {

}
