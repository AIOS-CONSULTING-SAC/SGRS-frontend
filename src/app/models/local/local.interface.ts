import { ApiResponse } from "../respuesta";

export interface LocalResponse {
  local: number;
  codCliente: number;
  nombre: string;
  idDepartamento: number;
  idProvincia: number;
  idDistrito: number;
  direccion: string;
  idEstado: number;
  descEstado: string;
  codUserReg: number;
  fechaRegistro: string; 
}

export interface GuardarLocalRequest {
  local?: number;
  codCliente: number;
  nombre: string;
  idDepartamento?: number;
  idProvincia?: number;
  idDistrito?: number;
  direccion: string;
  idEstado: number;
  usuarioSesion: string;
}

export type ListadoLocalesEmpresaResponse = ApiResponse<LocalResponse[]>