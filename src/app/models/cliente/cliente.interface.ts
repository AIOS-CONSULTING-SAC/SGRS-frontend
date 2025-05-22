import { ApiResponse } from "../respuesta";

export interface ClienteResponse {
  cliente: number;
  codEmpresa: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string
  idDepartamento: number
  idProvincia: number
  idDistrito: number
  direccion: string
  descEstado: 'Activo' | 'Inactivo';
  idEstado: number;
}

export type ListadoClientesResponse = ApiResponse<ClienteResponse[]>