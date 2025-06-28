import { Injectable } from '@angular/core'  
import { HttpService } from '../shared/http.service'
import { environment } from '../../enviroments/environment';
import { EmpresaTO, GuardarEmpresaRequest, ListadoEmpresasResponse } from '../models/empresa/empresa.interface';
import { Observable } from 'rxjs';
import { ApiResponse, ApiResponseCrud } from '../models/respuesta';
import { ClienteResponse, GuardarClienteRequest, ListadoClientesResponse } from '../models/cliente/cliente.interface';

 const apiServicio = 'api/v1/clientes/'
@Injectable({
  providedIn: 'root'
})
export class ClienteService { 
  constructor(private http: HttpService) { 
  }

  listado(idEmpresa?: number | null, ruc?: string, razonSocial?: string, idEstado?: number | null): Observable<ApiResponse<ClienteResponse[]>> {
    let url =apiServicio + `listar?`
    if (idEmpresa) url += `idEmpresa=${idEmpresa}`
    if (ruc) url += `ruc=${ruc}`
    if (razonSocial) url += `&razonSocial=${razonSocial}`
    if (idEstado) url += `&idEstado=${idEstado}`
    return this.http.obtenerQueryGet<ListadoClientesResponse>(url)
  }
 
  actualizar(request: GuardarClienteRequest) {
    return this.http.obtenerQueryPut(apiServicio, + 'actualizar', request)
  }

  registrar(request: GuardarClienteRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPost<any>(apiServicio + 'guardar', request)
  }

  eliminar(idCliente: number, idEmpresa: number) {
    let url = apiServicio + `eliminar?idCliente=${idCliente}&idEmpresa=${idEmpresa}`
    return this.http.obtenerQueryDelete<any>(url)
  }
}
