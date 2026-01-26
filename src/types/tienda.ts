// Tipos para la Tienda - Club Seminario

// Categorías de productos
export interface CategoriaProducto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  activa: boolean;
  created_at: string;
}

// Producto base
export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  descripcion_corta: string | null;
  precio: number;
  precio_oferta: number | null;
  categoria_id: string | null;
  stock: number;
  sku: string;
  imagenes: string[];
  imagen_principal: string | null;
  activo: boolean;
  destacado: boolean;
  deporte: string | null;
  tallas: string[];
  colores: string[];
  created_at: string;
  updated_at: string;
}

// Producto con relaciones
export interface ProductoConCategoria extends Producto {
  categoria: CategoriaProducto | null;
}

export interface ProductoConVariantes extends Producto {
  variantes: VarianteProducto[];
}

export interface ProductoCompleto extends Producto {
  categoria: CategoriaProducto | null;
  variantes: VarianteProducto[];
}

// Variantes de producto
export interface VarianteProducto {
  id: string;
  producto_id: string;
  talla: string | null;
  color: string | null;
  stock: number;
  precio_adicional: number;
  sku: string;
}

// Métodos de envío
export interface MetodoEnvio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  tiempo_estimado: string | null;
  activo: boolean;
  orden: number;
}

// Estados de pedido
export type EstadoPedido =
  | "pendiente"
  | "pagado"
  | "preparando"
  | "enviado"
  | "entregado"
  | "cancelado";

// Pedido
export interface Pedido {
  id: string;
  numero_pedido: string;
  user_id: string | null;
  email: string;
  nombre_completo: string;
  telefono: string | null;
  direccion_envio: string | null;
  ciudad: string | null;
  departamento: string | null;
  codigo_postal: string | null;
  notas: string | null;
  subtotal: number;
  costo_envio: number;
  descuento: number;
  total: number;
  estado: EstadoPedido;
  metodo_pago: string | null;
  metodo_envio_id: string | null;
  numero_tracking: string | null;
  mercadopago_preference_id: string | null;
  mercadopago_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

// Pedido con items
export interface PedidoConItems extends Pedido {
  items: ItemPedido[];
  metodo_envio?: MetodoEnvio | null;
}

// Item de pedido
export interface ItemPedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  variante_id: string | null;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  talla: string | null;
  color: string | null;
  subtotal: number;
}

// Filtros para listado de productos
export interface ProductFilters {
  categoria?: string;
  deporte?: string;
  precioMin?: number;
  precioMax?: number;
  enOferta?: boolean;
  destacado?: boolean;
  busqueda?: string;
  ordenar?: "precio_asc" | "precio_desc" | "nombre" | "recientes";
}

// Datos para crear pedido
export interface CreateOrderData {
  email: string;
  nombre_completo: string;
  telefono?: string;
  direccion_envio?: string;
  ciudad?: string;
  departamento?: string;
  codigo_postal?: string;
  notas?: string;
  metodo_envio_id: string;
  items: {
    producto_id: string;
    variante_id?: string;
    cantidad: number;
  }[];
}

// Respuesta de MercadoPago
export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MercadoPagoWebhook {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

// Props comunes para componentes
export interface ProductCardProps {
  product: Producto;
  showAddToCart?: boolean;
}

export interface ProductGridProps {
  products: Producto[];
  loading?: boolean;
}

export interface ProductFiltersProps {
  categorias: CategoriaProducto[];
  deportes: string[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}
