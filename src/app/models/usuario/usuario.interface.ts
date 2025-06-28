import { ApiResponse } from "../respuesta";

export interface UsuarioResponse {
usuario: number;
  codEmpresa: number;
  descEmpresa: string;
  codCliente: number;
  descCliente: string;
  codTipoUser: number;
  descTipoUser: string;
  codPerfil: number;
  descPerfil: string;
  codTipoDoc: number;
  ndoc: string;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  telefono: string;
  correo: string;
  idEstado: number; 
  descEstado: string;
  fechaRegistro: Date;
}

export type ListadoUsuarioResponse = ApiResponse<UsuarioResponse[]>

export interface GuardarUsuarioRequest {
  idUsuario: number | null;
  idEmpresa: number;
  idCliente: number;
  idTipoUser: number;
  idPerfil: number;
  idTipoDoc: number;
  ndoc: string;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  telefono: string;
  correo: string; 
  idEstado: number;  
  mensaje?: string;
}


export class IniciarSesionRequest {
  usuario!: string;
  password!: string;

}