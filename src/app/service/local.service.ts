import { Injectable } from '@angular/core'  
import { HttpService } from '../shared/http.service'
import { environment } from '../../enviroments/environment';
import { EmpresaTO, GuardarEmpresaRequest } from '../models/empresa/empresa.interface';
import { Observable } from 'rxjs';
import { ApiResponse, ApiResponseCrud } from '../models/respuesta';
import { GuardarLocalRequest, ListadoLocalesEmpresaResponse, LocalResponse } from '../models/local/local.interface';

 const apiServicio = 'api/v1/locales/'
@Injectable({
  providedIn: 'root'
})
export class LocalService { 
  constructor(private http: HttpService) { 
  }

  listado(codCliente?: number | null, idEstado?: number | null): Observable<ListadoLocalesEmpresaResponse> {
    let url = apiServicio + 'listar?';
    if (codCliente != null) url += `codCliente=${codCliente}`;
    if (idEstado != null) url += `&idEstado=${idEstado}`;
    return this.http.obtenerQueryGet<ListadoLocalesEmpresaResponse>(url);
  }

  registrar(request: GuardarLocalRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPost<ApiResponseCrud>(apiServicio + 'guardar', request);
  }

  actualizar(request: GuardarLocalRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPut<ApiResponseCrud>(apiServicio + 'actualizar', request);
  }

  eliminar(idLocal: number, usuarioSesion: string): Observable<ApiResponseCrud> {
    const url = apiServicio + `eliminar?idLocal=${idLocal}&usuarioSesion=${usuarioSesion}`;
    return this.http.obtenerQueryDelete<ApiResponseCrud>(url);
  }
}
