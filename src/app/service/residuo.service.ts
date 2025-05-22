import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 
import { HttpService } from '../shared/http.service';
import { ApiResponseCrud } from '../models/respuesta';
import { GuardarResiduoRequest, ListadoResiduosEmpresaResponse } from '../models/residuo/residuo.interface';

const apiServicio = 'api/v1/residuos/';

@Injectable({
  providedIn: 'root'
})
export class ResiduoService {
  constructor(private http: HttpService) { }

  listado(codCliente?: number | null, idEstado?: number | null): Observable<ListadoResiduosEmpresaResponse> {
    let url = apiServicio + 'listar?';
    if (codCliente != null) url += `codCliente=${codCliente}`;
    if (idEstado != null) url += `&idEstado=${idEstado}`;
    return this.http.obtenerQueryGet<ListadoResiduosEmpresaResponse>(url);
  }

  registrar(request: GuardarResiduoRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPost<ApiResponseCrud>(apiServicio + 'guardar', request);
  }

  actualizar(request: GuardarResiduoRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPut<ApiResponseCrud>(apiServicio + 'actualizar', request);
  }

  eliminar(idResiduo: number, usuarioSesion: string): Observable<ApiResponseCrud> {
    const url = apiServicio + `eliminar?idResiduo=${idResiduo}&usuarioSesion=${usuarioSesion}`;
    return this.http.obtenerQueryDelete<ApiResponseCrud>(url);
  }
}
