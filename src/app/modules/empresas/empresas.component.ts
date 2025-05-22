import { Component, OnInit, signal } from '@angular/core'; 
import { ListadoComponent } from './listado/listado.component';
import { RegistroComponent } from './registro/registro.component';
import { CommonModule } from '@angular/common'; 
import { EmpresaTO } from '../../models/empresa/empresa.interface';
import { ConfigurarComponent } from './configurar/configurar.component';
import { ClienteResponse } from '../../models/cliente/cliente.interface';

@Component({
  selector: 'app-empresas',
  imports: [ListadoComponent, RegistroComponent, CommonModule, ConfigurarComponent],
  templateUrl: './empresas.component.html', 
   
})
export class EmpresasComponent implements OnInit {
  private mostrarListadoSignal = signal(true);
  private empresaSignal = signal<ClienteResponse | null>(null);
  private configurarSignal = signal<ClienteResponse | null>(null);
  
  mostrarConfigurar= this.configurarSignal.asReadonly()
  mostrarListado = this.mostrarListadoSignal.asReadonly();
  empresaSeleccionada = this.empresaSignal.asReadonly();

  ngOnInit(): void { 
  }
  abrirRegistro() {
    this.empresaSignal.set(null);
    this.mostrarListadoSignal.set(false);
    this.configurarSignal.set(null);
  }

  editarEmpresa(empresa: ClienteResponse) {
    this.empresaSignal.set(empresa);
    this.configurarSignal.set(null);
    this.mostrarListadoSignal.set(false);
  }

  configurarEmpresa(empresa: ClienteResponse) {
    this.empresaSignal.set(null);
    this.configurarSignal.set(empresa);
    this.mostrarListadoSignal.set(false);
  }

  get estaConfigurando() {
  return this.configurarSignal() !== null;
}

  volverAlListado() {
    this.mostrarListadoSignal.set(true);
    this.empresaSignal.set(null);
    this.configurarSignal.set(null);
  } 
  
}
