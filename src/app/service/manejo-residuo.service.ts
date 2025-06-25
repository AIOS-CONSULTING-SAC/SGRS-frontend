import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 
import { HttpService } from '../shared/http.service';
import { ApiResponseCrud } from '../models/respuesta';
import { GuardarResiduoRequest, ListadoLocalResiduosResponse, ListadoResiduosEmpresaResponse } from '../models/residuo/residuo.interface';

const apiServicio = 'api/v1/manejoresiduos/';

@Injectable({
  providedIn: 'root'
})
export class ManejoResiduoService {
  constructor(private http: HttpService) { }

  listado(codCliente: number, anio: number, local: number): Observable<ListadoLocalResiduosResponse> {
    let url = apiServicio + `listar?codCliente=${codCliente}&anio=${anio}&locales=${local}&idEstado=1`;
   
    return this.http.obtenerQueryGet<ListadoLocalResiduosResponse>(url);
  }

  registrar(request: GuardarResiduoRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPost<ApiResponseCrud>(apiServicio + 'guardar', request);
  }

 
}
