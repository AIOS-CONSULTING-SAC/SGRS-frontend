import { ApiResponse } from "../respuesta";

export interface GuardarResiduoRequest {
  residuo?: number; // null o undefined si es nuevo
  codCliente: number;
  descripcion: string;
  idUnidad: number | null;
  idEstado: number;
  usuarioSesion: number;
  mensaje?: string;
}

export interface ResiduoResponse {
  residuo: number;
  codCliente: number; 
  idUnidad: number;
  descripcion?: string;
  idEstado: number;
  descEstado: string;              // "Activo" o "Inactivo"
  fechaRegistro: string;           
}

export type ListadoResiduosEmpresaResponse = ApiResponse<ResiduoResponse[]>