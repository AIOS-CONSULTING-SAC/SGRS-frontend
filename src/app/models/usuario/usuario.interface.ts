export interface UsuarioResponse {
    id?: number;
    descEmpresa: string
    tipoUsuario: 'Interno' | 'Externo'
    rol: 'Administrador' | 'Invitado'
    nroDocumento: string
    nombres: string;
    apellidos: string
    
    estado: 'Activo' | 'Inactivo';
  }
  