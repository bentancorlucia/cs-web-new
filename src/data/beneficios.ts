export interface Beneficio {
  id: number;
  empresa: string;
  descuento: string;
  descripcion: string;
  categoria: string;
  logo?: string;
}

export interface CategoriaBeneficio {
  id: number;
  nombre: string;
}

export const categorias: CategoriaBeneficio[] = [
  { id: 0, nombre: "Todas" },
  { id: 1, nombre: "Servicio Automotriz" },
  { id: 2, nombre: "Cuidado Personal" },
  { id: 3, nombre: "Educación" },
  { id: 4, nombre: "Gastronomía" },
  { id: 5, nombre: "Hogar y Oficina" },
  { id: 6, nombre: "Joyería" },
  { id: 7, nombre: "Mascotas" },
  { id: 8, nombre: "Niños" },
  { id: 9, nombre: "Salud" },
  { id: 10, nombre: "Servicio a deportistas" },
  { id: 11, nombre: "Servicios financieros" },
  { id: 12, nombre: "Turismo" },
  { id: 13, nombre: "Vestimenta y accesorios" },
];

export const beneficios: Beneficio[] = [
  {
    id: 1,
    empresa: "UCU",
    descuento: "10% de descuento",
    descripcion: "",
    categoria: "Educación",
    logo: "/logos/logo-ucu.png",
  },
  {
    id: 2,
    empresa: "OMNIA Wellness",
    descuento: "Descuentos",
    descripcion: "",
    categoria: "Cuidado Personal",
  },
  {
    id: 3,
    empresa: "MS Recovery",
    descuento: "Descuentos",
    descripcion: "",
    categoria: "Servicio a deportistas",
  },
  {
    id: 4,
    empresa: "New Balance",
    descuento: "20% de descuento",
    descripcion: "Presentando la tarjeta de socio",
    categoria: "Vestimenta y accesorios",
    logo: "/logos/logo-nb.png",
  },
];
