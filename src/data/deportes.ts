export interface Categoria {
  nombre: string;
  descripcion: string;
  imagen?: string;
  practicas: {
    horario: string;
    lugar: string;
  };
  contacto: {
    nombre: string;
    telefono: string;
  };
}

export interface Deporte {
  slug: string;
  nombre: string;
  descripcion?: string;
  imagen: string;
  categorias: Categoria[];
}

export const deportes: Deporte[] = [
  {
    slug: "basquetbol",
    nombre: "Básquetbol",
    imagen: "/PapiBasket.JPG",
    categorias: [
      {
        nombre: "Papi Basket",
        descripcion:
          "El Papibasket, es un grupo de disfrute, deporte y encuentros sociales. Un gran grupo humano que sigue creciendo en todos los aspectos. Durante el año realizamos torneos internos, reuniones, asados y cerramos con una despedida del año.",
        imagen: "/PapiBasket.JPG",
        practicas: {
          horario: "Martes y Jueves de 20:00 a 21:00",
          lugar: "Polideportivo Gonzaga",
        },
        contacto: {
          nombre: "Mauricio Rinaldi",
          telefono: "099 628 071",
        },
      },
      {
        nombre: "Mami Basket",
        descripcion:
          "En MamiBasket, nuestro objetivo es aprender, divertirnos y salir de la rutina. Cada una de nosotras enfrenta su propio desafío a su propio ritmo, porque todas somos nuevas en el deporte.",
        imagen: "/MamiBasket.JPG",
        practicas: {
          horario: "Martes y Jueves de 19:00 a 20:00",
          lugar: "Polideportivo Gonzaga",
        },
        contacto: {
          nombre: "Mónica Gómez",
          telefono: "091 399 993",
        },
      },
    ],
  },
  {
    slug: "corredores",
    nombre: "Corredores",
    descripcion:
      "Disfrutamos de la rambla, nos motivamos, nos acompañamos y cumplimos objetivos juntos. Lo importante es tener ganas de moverse, compartir buenos momentos. Desde 5k a Maratón, corremos todas las distancias y participamos en distintas carreras según los intereses de cada uno.",
    imagen: "/Corredores.jpg",
    categorias: [
      {
        nombre: "Corredores",
        descripcion:
          "Disfrutamos de la rambla, nos motivamos, nos acompañamos y cumplimos objetivos juntos. Lo importante es tener ganas de moverse, compartir buenos momentos. Desde 5k a Maratón, corremos todas las distancias y participamos en distintas carreras según los intereses de cada uno.",
        imagen: "/Corredores.jpg",
        practicas: {
          horario: "Martes y Jueves de 08:10",
          lugar: "Mojón 7.500 Rambla de Pta. Carretas",
        },
        contacto: {
          nombre: "María Victoria Pieri",
          telefono: "099 443 230",
        },
      },
    ],
  },
  {
    slug: "handball",
    nombre: "Handball",
    imagen: "/hb-masculino.jpg",
    categorias: [
      {
        nombre: "Femenino",
        descripcion:
          "Competimos en la liga ACB, en la categoría Mayores A. El plantel esta compuesto mayoritariamente por exalumnas, aunque no es excluyente para formar parte del equipo. Todas las jugadoras cuentan con experiencia previa en el deporte.",
        imagen: "/hb-femenino.jpg",
        practicas: {
          horario: "Lunes de 19:45 a 21:30 y Miércoles de 19:45 a 21:00",
          lugar: "Parque Loyola",
        },
        contacto: {
          nombre: "Agustina Olivera",
          telefono: "099 625 705",
        },
      },
      {
        nombre: "Masculino",
        descripcion:
          "Competimos en la Superliga de ACB, los partidos son los sábados. Las edades de los jugadores son muy variadas pero todos contamos con experiencia previa en el deporte. No es un requisito excluyente ser exalumno del Colegio para formar parte del plantel.",
        imagen: "/hb-masculino.jpg",
        practicas: {
          horario: "Martes y Jueves de 20:00 a 21:30",
          lugar: "Parque Loyola",
        },
        contacto: {
          nombre: "Facundo Domínguez",
          telefono: "091 075 988",
        },
      },
      {
        nombre: "Mami Handball",
        descripcion:
          "El objetivo principal es seguir compitiendo y disfrutando del deporte que más nos gusta. Competimos en ADIC y en la Liga ACB. Los partidos son cada 15 días y pueden participar exalumnas, madres y funcionarias del Colegio.",
        imagen: "/MamiHB.JPG",
        practicas: {
          horario: "Martes y Jueves de 19:15 a 20:30",
          lugar: "Polideportivo Gonzaga",
        },
        contacto: {
          nombre: "Graciela Palacios",
          telefono: "097 300 320",
        },
      },
    ],
  },
  {
    slug: "hockey",
    nombre: "Hockey",
    imagen: "/Hockey.jpg",
    categorias: [
      {
        nombre: "Hockey",
        descripcion:
          "Buscamos hacer propio el Ut Serviam poniendo nuestras mejores cualidades al servicio del equipo. Nuestro objetivo es que haya un lugar para todas las exalumnas que les gusta el deporte y quieran seguir aprendiendo, formando parte de un equipo donde se prioriza el esfuerzo y el compromiso.",
        imagen: "/Hockey.jpg",
        practicas: {
          horario: "Martes y Jueves de 19:30 a 22:30",
          lugar: "Parque Loyola",
        },
        contacto: {
          nombre: "Lola Delafond",
          telefono: "091 878 717",
        },
      },
      {
        nombre: "Mami Hockey",
        descripcion:
          "Lo que buscamos es practicar hockey en forma recreativa y competitiva, promover un espíritu de grupo y representar los valores del Club Seminario en todas las canchas. Competimos con diferentes equipos, en distintas categorías del Torneo de Mami Hockey de LID.",
        imagen: "/MamiHockey.jpg",
        practicas: {
          horario: "Lunes y Miércoles de 20:30 a 22:00",
          lugar: "Parque Loyola",
        },
        contacto: {
          nombre: "Alejandra Castro",
          telefono: "094 274 524",
        },
      },
    ],
  },
  {
    slug: "futbol",
    nombre: "Fútbol",
    imagen: "/foto-futfem.webp",
    categorias: [
      {
        nombre: "Femenino",
        descripcion:
          "El Fútbol Femenino del Club ha crecido mucho en estos últimos años, siempre con el objetivo de competir al más alto nivel y lograr un espacio de integración y crecimiento del equipo. Contamos con dos planteles organizados según el objetivo de formación: Plantel A, que compite en la categoría C de la MGC (sábados a la tarde) y el Plantel B, que compite en la categoría F (sábados a la tarde).",
        imagen: "/futbol-femenino.jpg",
        practicas: {
          horario: "Lunes, Martes y Jueves 19:00 a 20:30 hrs",
          lugar: "Parque CUPRA / Polideportivo Gonzaga",
        },
        contacto: {
          nombre: "Lucía Alvariza",
          telefono: "095 732 333",
        },
      },
      {
        nombre: "Masculino",
        descripcion:
          "Competimos en la Liga Universitaria de Deportes en siete categorías, desde Sub 14 hasta Pre-Senior. Contamos con 10 planteles, buscando que todos tengan su lugar para disfrutar de jugar el fútbol con sus amigos.",
        imagen: "/futbol-masculino.jpg",
        practicas: {
          horario: "Variables según categoría",
          lugar: "Variables según categoría",
        },
        contacto: {
          nombre: "Domingo Martinelli",
          telefono: "099 613 671",
        },
      },
      {
        nombre: "Mami Fútbol",
        descripcion:
          "A todas las que tienen muchas ganas de divertirse jugando al fútbol, a todas las que quieran encontrarse con otras mujeres que siguen aprendiendo a jugarlo y por supuesto a todas aquellas que tengan ganas de meter goles o evitarlos… las esperamos en el Mamifútbol del Club Seminario.",
        imagen: "/MamiFutbol.JPG",
        practicas: {
          horario: "Martes y Jueves de 20:30 a 22:00",
          lugar: "Polideportivo Gonzaga",
        },
        contacto: {
          nombre: "Cecilia Capozzoli",
          telefono: "099 152 362",
        },
      },
    ],
  },
  {
    slug: "rugby",
    nombre: "Rugby",
    descripcion:
      "Competimos en la Unión de Rugby del Uruguay en tres categorías, M19, Intermedia y Primera. Nuestro objetivo es que los chiquilines sigan disfrutando del deporte con sus amigos una vez que egresan del Colegio.",
    imagen: "/Rugby.jpg",
    categorias: [
      {
        nombre: "Rugby",
        descripcion:
          "Competimos en la Unión de Rugby del Uruguay en tres categorías, M19, Intermedia y Primera. Nuestro objetivo es que los chiquilines sigan disfrutando del deporte con sus amigos una vez que egresan del Colegio.",
        imagen: "/Rugby.jpg",
        practicas: {
          horario: "Martes y Jueves de 20:00 a 22:00",
          lugar: "Parque CUPRA",
        },
        contacto: {
          nombre: "Julio Gutiérrez",
          telefono: "099 606 827",
        },
      },
    ],
  },
  {
    slug: "volleyball",
    nombre: "Volleyball",
    imagen: "/Papivolley.jpeg",
    categorias: [
      {
        nombre: "Papi Volley",
        descripcion:
          "Una oportunidad de descubrir un nuevo deporte, con un gran grupo humano que busca aprender y divertirse. Un lindo proceso en el cual se comparten prácticas, juntadas y mucho más.",
        imagen: "/Papivolley.jpeg",
        practicas: {
          horario: "Martes y Jueves de 21:00 a 22:00",
          lugar: "Polideportivo Gonzaga",
        },
        contacto: {
          nombre: "Rodrigo Ripa",
          telefono: "099 743 206",
        },
      },
      {
        nombre: "Mami Volley",
        descripcion:
          "MamiVolley se formó hace más de 20 años, como un espacio para aprender de un precioso deporte, compartiendo con un lindo grupo y cosechar amistades. Competimos en ADIC y los partidos son generalmente los sábados.",
        imagen: "/MamiVolley.jpg",
        practicas: {
          horario: "Lunes y Miércoles de 19:00 a 21:00",
          lugar: "Polideportivo Gonzaga",
        },
        contacto: {
          nombre: "Valeria del Portillo",
          telefono: "099 503 239",
        },
      },
    ],
  },
];

export function getDeporteBySlug(slug: string): Deporte | undefined {
  return deportes.find((d) => d.slug === slug);
}
