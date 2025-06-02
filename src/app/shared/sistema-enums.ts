export const PARAMETROS = {
  MODULOS: {
    MANTENIMIENTO: '1',
    CONFIGURACION: '2',
  },
  MANTENIMIENTO: {
    OPCIONES: {
      EMPRESAS: '1',
      USUARIOS: '2',
    },
    EMPRESAS: {
      DEPARTAMENTOS: '1',
      PROVINCIAS: '2',
      DISTRITOS: '3',
      UNIDADES_MEDIDA: '4',
      ANIOS: '5',
    },
    USUARIOS: {
      TIPO_USUARIO: '1',
      TIPO_PERFIL: '2',
      TIPO_DOCUMENTO: '3',
      LINK_EMPRESA: '4',
      CREDENCIALES_SERV_CORREO: '5',
    },
  },
};


export const MESES: { label: string; value: number }[] = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
];