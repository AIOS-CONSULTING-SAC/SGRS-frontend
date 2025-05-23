import { ApiResponse } from "../respuesta";

export interface UsuarioResponse {
  id: number;
  descEmpresa: string;
  tipoUsuario: string;
  rol: string;
  nombres: string;
  apellidos: string;
  nroDocumento: string;
  estado: string;
}

export type ListadoUsuarioResponse = ApiResponse<UsuarioResponse[]>

export interface GuardarUsuarioRequest {
  idUsuario?: number;
  idEmpresa?: number;
  idcliente?: number;
  idTipoUser?: number;
  idPerfil?: number;
  idTipoDoc?: number;
  ndoc?: string;
  nombre?: string;
  apellidoP?: string;
  apellidoM?: string;
  correo?: string;
  password?: string;
  idEstado: number;
  usuarioSesion: number;
  mensaje?: string;
}


export class IniciarSesionRequest {
  usuario!: string;
  password!: string;

}