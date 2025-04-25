export interface ApiResponse<T> {
    respuesta: T;
    codigo: number;
    mensaje: string;
}


export interface ApiResponseCrud {
    respuesta: string;
    codigo: number;
    mensaje: string;
}
