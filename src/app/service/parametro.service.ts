import { Injectable } from '@angular/core'  
import { HttpService } from '../shared/http.service'
import { environment } from '../../enviroments/environment';
import { EmpresaTO, GuardarEmpresaRequest, ListadoEmpresasResponse } from '../models/empresa/empresa.interface';
import { Observable } from 'rxjs';
import { ApiResponse, ApiResponseCrud } from '../models/respuesta';
import { ListadoParametrosResponse, ParametroResponse } from '../models/parametro/parametro.interface';

 const apiServicio = 'api/v1/parametros/'
@Injectable({
  providedIn: 'root'
})
export class ParametroService { 
  constructor(private http: HttpService) { 
  }

  listado(codModulo?: string, codOpcion?: string, codPrefijo?: string, int01?: number, int02?: number): Observable<ApiResponse<ParametroResponse[]>> {
    let url =apiServicio + `listar?`
    if (codModulo) url += `codModulo=${codModulo}`
    if (codOpcion) url += `&codOpcion=${codOpcion}`
    if (codPrefijo) url += `&codPrefijo=${codPrefijo}`
    if (int01) url += `&int01=${int01}`
    if (int02) url += `&int02=${int02}`
    return this.http.obtenerQueryGet<ListadoParametrosResponse>(url)
  }
 
  actualizar(request: GuardarEmpresaRequest) {
    return this.http.obtenerQueryPut(apiServicio, + 'actualizar', request)
  }

  registrar(request: GuardarEmpresaRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPost<any>(apiServicio + 'guardar', request)
  }

  eliminar(idEmpresa: number, usuarioSesion:number) {
    let url = apiServicio + `eliminar?idEmpresa=${idEmpresa}&usuarioSesion=${usuarioSesion}`
    return this.http.obtenerQueryDelete<any>(url)
  }
}
