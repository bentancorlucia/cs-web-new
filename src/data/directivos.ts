export interface Directivo {
  nombre: string;
  cargo: string;
}

export const comisionDirectiva: Directivo[] = [
  { nombre: "Atilano Abella", cargo: "Presidente" },
  { nombre: "Natalia Orellano", cargo: "Vice-presidente" },
  { nombre: "Mathías Rojas", cargo: "Secretario" },
  { nombre: "Juan Abou-Nigm", cargo: "Tesorero" },
  { nombre: "Luis Scremini", cargo: "Pro-Tesorero" },
  { nombre: "Alejandra Castro", cargo: "Titular" },
  { nombre: "Paula Prato", cargo: "Titular" },
  { nombre: "Sebastián Perona", cargo: "Titular" },
  { nombre: "Santiago Cerisola", cargo: "Titular" },
];

export const suplentes: Directivo[] = [
  { nombre: "Laura Sotelo", cargo: "Suplente" },
  { nombre: "Lucía Alvariza", cargo: "Suplente" },
  { nombre: "Facundo Domínguez", cargo: "Suplente" },
  { nombre: "Gonzalo Hernández", cargo: "Suplente" },
  { nombre: "Guillermo Murissich", cargo: "Suplente" },
  { nombre: "Lola Delafond", cargo: "Suplente" },
  { nombre: "Santiago Pérez", cargo: "Suplente" },
  { nombre: "Lucía Bentancor", cargo: "Suplente" },
  { nombre: "Jose Pedro Montero", cargo: "Suplente" },
];

export const comisionFiscal: Directivo[] = [
  { nombre: "Juan Andrés Guimaraes", cargo: "Contador" },
  { nombre: "José Luis Olivera", cargo: "Contador" },
  { nombre: "Luis Andrés Vilaró", cargo: "Contador" },
  { nombre: "Isaac Pérez", cargo: "Contador" },
  { nombre: "María Ines Lombardo", cargo: "Contadora" },
  { nombre: "Eugenio Balestie", cargo: "Contador" },
];
