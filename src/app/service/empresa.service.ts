import { Injectable } from '@angular/core'  
import { HttpService } from '../shared/http.service'
import { environment } from '../../environments/environment';
import { EmpresaTO, GuardarEmpresaRequest, ListadoEmpresasResponse } from '../models/empresa/empresa.interface';
import { Observable } from 'rxjs';
import { ApiResponse, ApiResponseCrud } from '../models/respuesta';

 const apiServicio = 'api/v1/empresas/'
@Injectable({
  providedIn: 'root'
})
export class EmpresaService { 
  constructor(private http: HttpService) { 
  }

  listado(ruc?: string, razonSocial?: string, idEstado?: number | null): Observable<ApiResponse<EmpresaTO[]>> {
    let url =apiServicio + `listar?`
    if (ruc) url += `ruc=${ruc}`
    if (razonSocial) url += `&razonSocial=${razonSocial}`
    if (idEstado) url += `&idEstado=${idEstado}`
    return this.http.obtenerQueryGet<ListadoEmpresasResponse>(url)
  }
 
  actualizar(request: GuardarEmpresaRequest) {
    return this.http.obtenerQueryPut(apiServicio, + 'actualizar', request)
  }

  registrar(request: GuardarEmpresaRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPost<any>(apiServicio + 'guardar', request)
  }

  eliminar(idEmpresa: number) {
    let url = apiServicio + `eliminar?idEmpresa=${idEmpresa}`
    return this.http.obtenerQueryDelete<any>(url)
  }
}
