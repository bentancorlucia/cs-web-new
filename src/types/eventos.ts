export interface EventoSocial {
  id: string;
  titulo: string;
  slug: string;
  descripcion?: string;
  descripcion_corta?: string;
  fecha_evento: string;
  fecha_fin?: string;
  hora_apertura?: string;
  hora_cierre?: string;
  ubicacion?: string;
  direccion?: string;
  imagen_url?: string;
  imagenes_galeria?: string[];
  capacidad_total?: number;
  edad_minima?: number;
  incluye?: string[];
  solo_socios: boolean;
  activo: boolean;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoteEntrada {
  id: string;
  evento_id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_maxima?: number;
  orden: number;
  activo: boolean;
  created_at: string;
}

export interface TipoEntrada {
  id: string;
  lote_id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_socio?: number;
  cantidad_total: number;
  cantidad_vendida: number;
  max_por_compra: number;
  incluye?: string[];
  orden: number;
  activo: boolean;
  created_at: string;
}

export interface Entrada {
  id: string;
  evento_id: string;
  lote_id: string;
  tipo_entrada_id: string;
  user_id: string;
  pedido_id?: string;
  codigo_qr: string;
  token_validacion: string;
  nombre_asistente: string;
  cedula_asistente?: string;
  email_asistente?: string;
  telefono_asistente?: string;
  estado: "valida" | "usada" | "cancelada" | "transferida";
  fecha_compra: string;
  fecha_uso?: string;
  notas?: string;
  created_at: string;
}

export interface EscaneoEntrada {
  id: string;
  entrada_id: string;
  escaneado_por: string;
  resultado: "valida" | "ya_usada" | "cancelada" | "no_encontrada" | "evento_incorrecto";
  ip_address?: string;
  user_agent?: string;
  ubicacion_escaneo?: string;
  created_at: string;
}

export interface EventoCompleto extends EventoSocial {
  lotes: LoteConTipos[];
  entradas_vendidas: number;
  precio_desde?: number;
}

export interface LoteConTipos extends LoteEntrada {
  tipos_entrada: TipoEntrada[];
}

export interface EntradaCompleta extends Entrada {
  evento: EventoSocial;
  lote: LoteEntrada;
  tipo_entrada: TipoEntrada;
}

export interface EventoFilters {
  soloSocios?: boolean;
  pasados?: boolean;
  busqueda?: string;
}

export interface EstadisticasEvento {
  evento_id: string;
  titulo: string;
  fecha_evento: string;
  capacidad_total?: number;
  total_vendidas: number;
  total_ingresadas: number;
  pendientes_ingreso: number;
  canceladas: number;
  ingresos_totales: number;
}
