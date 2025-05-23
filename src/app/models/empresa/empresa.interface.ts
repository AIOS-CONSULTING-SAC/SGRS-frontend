import { ApiResponse } from "../respuesta";

export interface GuardarEmpresaRequest {
  id?: number | null;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  idDepartamento: number
  idProvincia: number
  idDistrito: number;
  direccion: string
  idEstado: number;
  usuarioSesion: number;
}

export interface EliminarEmpresaRequest {
  idEmpresa: number;
  usuarioSesion: number;
}

export interface EmpresaTO {
  cliente?: number;
  codEmpresa?: number;
  
  ruc: string;
  razonSocial: string;
  nombreComercial: string
  descEstado: 'Activo' | 'Inactivo';
  idEstado: number;
}

export type ListadoEmpresasResponse = ApiResponse<EmpresaTO[]>

