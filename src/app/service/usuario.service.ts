import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 
import { HttpService } from '../shared/http.service';
import { ApiResponse, ApiResponseCrud } from '../models/respuesta';
import { GuardarUsuarioRequest, ListadoUsuarioResponse, UsuarioResponse } from '../models/usuario/usuario.interface';

const apiUsuario = 'api/v1/usuarios/';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private http: HttpService) {}

  listar(params: {
    tipoUser?: number;
    perfil?: number;
    nroDocumento?: string;
    nombre?: string;
    idEstado?: number;
  }): Observable<ListadoUsuarioResponse> {
    let queryParams = [];
    if (params.tipoUser != null) queryParams.push(`tipoUser=${params.tipoUser}`);
    if (params.perfil != null) queryParams.push(`perfil=${params.perfil}`);
    if (params.nroDocumento != null) queryParams.push(`nroDocumento=${params.nroDocumento}`);
    if (params.nombre != null) queryParams.push(`nombre=${params.nombre}`);
    if (params.idEstado != null) queryParams.push(`idEstado=${params.idEstado}`);
    const url = apiUsuario + 'listar?' + queryParams.join('&');
    return this.http.obtenerQueryGet<ListadoUsuarioResponse>(url);
  }

  registrar(request: GuardarUsuarioRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPost<ApiResponseCrud>(apiUsuario + 'guardar', request);
  }

  actualizar(request: GuardarUsuarioRequest): Observable<ApiResponseCrud> {
    return this.http.obtenerQueryPut<ApiResponseCrud>(apiUsuario + 'actualizar', request);
  }

  eliminar(idUsuario: number, usuarioSesion: number): Observable<ApiResponseCrud> {
    const url = `${apiUsuario}eliminar?idUsuario=${idUsuario}&usuarioSesion=${usuarioSesion}`;
    return this.http.obtenerQueryDelete<ApiResponseCrud>(url);
  }
}