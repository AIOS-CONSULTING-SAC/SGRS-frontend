import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 
import { HttpService } from '../shared/http.service'; 

const apiServicio = 'api/v1/dashboards/';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpService) { }

  listarGraficoBarra(codCliente: number, anio: number, local: number, meses: string, residuos: string): Observable<any> {
    let url = apiServicio + `listar01?codCliente=${codCliente}&anio=${anio}&locales=${local}&meses=${meses}&residuos=${residuos}`;
   
    return this.http.obtenerQueryGet<any>(url);
  }

  listarGraficoVertical(codCliente: number, anio: number, local: number, meses: string, residuos: string): Observable<any> {
    let url = apiServicio + `listar02?codCliente=${codCliente}&anio=${anio}&locales=${local}&meses=${meses}&residuos=${residuos}`;
    return this.http.obtenerQueryGet<any>(url);
  }
}
