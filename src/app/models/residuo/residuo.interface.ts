import { ApiResponse } from "../respuesta";

export interface GuardarResiduoRequest {
  residuo?: number; // null o undefined si es nuevo
  codCliente: number;
  descripcion: string;
  idUnidad: number | null;
  idEstado: number; 
  mensaje?: string;
}

export interface ResiduoResponse {
  residuo: number;
  codCliente: number; 
  idUnidad: number;
  descripcion?: string;
  idEstado: number;
  descEstado: string;
  fechaRegistro: string;           
}

export type ListadoResiduosEmpresaResponse = ApiResponse<ResiduoResponse[]>


export interface ManejoResiduoResponse {
  codCliente: number;
  descCliente: string;
  codLocal: number;
  descLocal: string;
  codResiduo: number;
  descResiduo: string;
  codUnidad: number;
  descUnidad: string;
  mes01: number;
  mes02: number;
  mes03: number;
  mes04: number;
  mes05: number;
  mes06: number;
  mes07: number;
  mes08: number;
  mes09: number;
  mes10: number;
  mes11: number;
  mes12: number;
  total: number;
}

export interface LocalGroup {
  codLocal: number;
  descLocal: string;
  residuos: ManejoResiduoResponse[];
  expanded?: boolean;
}

export type ListadoLocalResiduosResponse = ApiResponse<ManejoResiduoResponse[]>


export interface GuardarManejoResiduoRequest {
  codLocal: number;
  codResiduo: number;
  anio: number;
  detalle: { mes: number; cantidad: number }[];
  idEstado?: number; 
}