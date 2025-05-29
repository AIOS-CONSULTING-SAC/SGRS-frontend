import { ApiResponse } from "../respuesta";

export interface ParametroResponse {
parametro: number;
  codModulo: number;
  descModulo: string;
  codOpcion: number;
  descOpcion: string;
  prefijo: number;
  correlativo: number;
  descripcion1: string;
  descripcion2: string;
  descripcion3: string;
  entero01: number;
  entero02: number;
  idEstado: number;
  descEstado: string;
  codUserReg: number;
  fechaRegistro: string;
}

export type ListadoParametrosResponse = ApiResponse<ParametroResponse[]>

export interface GuardarParametroRequest {
  parametro?: number
  codModulo: number;
  descModulo: string;
  codOpcion: number;
  descOpcion: string;
  prefijo: number;
  correlativo: number;
  desc01: string;
  desc02: string;
  desc03: string;
  int01: number;
  int02: number;
  idEstado: number;
  usuarioSesion: number;
}

