import { Injectable } from '@angular/core'  
import { HttpService } from '../shared/http.service'
import { environment } from '../../enviroments/environment';
import { EmpresaTO, GuardarEmpresaRequest, ListadoEmpresasResponse } from '../models/empresa/empresa.interface';
import { Observable } from 'rxjs';
import { ApiResponse, ApiResponseCrud } from '../models/respuesta';
import { GuardarParametroRequest, ListadoParametrosResponse, ParametroResponse } from '../models/parametro/parametro.interface';

 const apiServicio = 'api/v1/parametros/'
@Injectable({
  providedIn: 'root'
})
export class ParametroService { 
  constructor(private http: HttpService) { 
  }

  listado(tipoSQL: number, codModulo?: string, codOpcion?: string, codPrefijo?: string, 
    desc1?: string, desc2?: string, desc3?: string, 
    int01?: number, int02?: number, idEstado?: string): Observable<ApiResponse<ParametroResponse[]>> {
    let url =apiServicio + `listar?`
    if (tipoSQL) url += `tipoSQL=${tipoSQL}`
    if (codModulo) url += `&codModulo=${codModulo}`
    if (codOpcion) url += `&codOpcion=${codOpcion}`
    if (codPrefijo) url += `&codPrefijo=${codPrefijo}`
    if (desc1) url += `&desc1=${desc1}`
    if (desc2) url += `&desc2=${desc2}`
    if (desc3) url += `&desc3=${desc3}` 
    if (int01) url += `&int01=${int01}`
    if (int02) url += `&int02=${int02}`
    if (idEstado) url += `&idEstado=${idEstado}`
    return this.http.obtenerQueryGet<ListadoParametrosResponse>(url)
  }
 
  actualizar(request: GuardarParametroRequest) {
    return this.http.obtenerQueryPut(apiServicio, + 'actualizar', request)
  }

  registrar(request: GuardarParametroRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPost<any>(apiServicio + 'guardar', request)
  }

  eliminar(idParametro: number, usuarioSesion:number) {
    let url = apiServicio + `eliminar?idParametro=${idParametro}&usuarioSesion=${usuarioSesion}`
    return this.http.obtenerQueryDelete<any>(url)
  }
}
