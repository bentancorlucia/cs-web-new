"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Home() {
  const heroRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 200 });
  const historiaRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 100 });
  const visionRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 100 });
  const escudoRef = useScrollReveal<HTMLDivElement>({ animation: "fade-up", delay: 100 });

  return (
    <>
      {/* Hero Section con Video */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video-inicio-15-reducido.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-bordo/70 via-bordo/50 to-bordo/80" />

        <div ref={heroRef} className="relative container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6 drop-shadow-lg">
            Club{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amarillo to-amarillo-light">
              Seminario
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            Institución deportiva, social y cultural que reúne a la comunidad jesuita en Uruguay desde 2010.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/socios">
              <Button size="lg" variant="secondary">
                Hacete socio
              </Button>
            </Link>
            <Link href="/club/instalaciones">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-bordo">
                Conocé el club
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-stone-50/50">
        <div className="container mx-auto px-4 lg:px-12 xl:px-20">
          <div ref={historiaRef} className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-bordo mb-10 text-center tracking-tight">
              Nuestra Historia
            </h2>

            <div className="space-y-5 text-bordo-dark/80 text-xl leading-relaxed">
              <p>
                El <span className="text-bordo font-semibold">Club Seminario</span> es una institución deportiva, social y cultural que reúne a la comunidad jesuita en Uruguay. Se fundó el 13 de mayo de 2010 y nuclea a equipos deportivos de exalumnos, padres y madres del colegio que, hasta ese entonces, funcionaban en forma independiente. Además, dio cabida al nacimiento y la consolidación de nuevas disciplinas deportivas.
              </p>
              <p>
                Nos unen los valores ignacianos, con el denominador común de sentirnos parte de la familia del Colegio Seminario y el orgullo de llevar los lobos de Loyola en nuestras camisetas.
              </p>
            </div>

            {/* Quote destacado */}
            <blockquote className="my-10 p-8 bg-amarillo/10 rounded-2xl relative">
              <svg className="absolute top-6 left-6 w-8 h-8 text-amarillo/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-bordo-dark text-xl leading-relaxed pl-10">
                Hoy somos más de 1000 socios, compitiendo en 22 categorías de rugby, hockey, fútbol, handball, basquet y volley. Además, tenemos un grupo de corredores que entrena en nuestro Club.
              </p>
            </blockquote>

            <div className="space-y-5 text-bordo-dark/80 text-xl leading-relaxed">
              <p>
                Cada año nuestros deportistas juegan más de 600 partidos en la Liga Universitaria de Deportes (LUD), la Asociación Deportiva de Institutos Católicos (ADIC), la Unión de Rugby del Uruguay (URU), la Asociación Uruguaya de Fútbol (AUF), Federación Uruguaya de Hockey (FUHC), la Asociación de Clubes de Balonmano, en amistosos y torneos internos.
              </p>
              <p>
                A través del deporte ponemos al servicio del otro nuestras habilidades y potencialidades, nos superamos a nosotros mismos, damos nuestro más. Organizamos instancias de colaboración con quien lo necesita, promovemos el deporte como ámbito educativo en realidades de contexto crítico, nos sumamos a campañas del Colegio o la Fundación Jesuitas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visión, Misión y Valores */}
      <section className="py-16 lg:py-24 bg-stone-50/70">
        <div className="container mx-auto px-4 lg:px-12 xl:px-20">
          <div ref={visionRef} className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-bordo mb-10 text-center tracking-tight">
              Visión, Misión y Valores
            </h2>

            <div className="space-y-5 text-bordo-dark/80 text-xl leading-relaxed mb-10">
              <p>
                <span className="text-bordo font-semibold">Somos</span> un club deportivo y social que une a todas las personas vinculadas a los jesuitas en Uruguay, que pretenden llevar a cada deporte la espiritualidad ignaciana.
              </p>
              <p>
                <span className="text-bordo font-semibold">Trabajamos</span> para ser competitivos deportivamente, reconocidos por jugar limpio en todas las canchas y promover el deporte como estrategia educativa, de integración y recreativa.
              </p>
              <p>
                <span className="text-bordo font-semibold">Misión, visión y valores:</span> Ofrecemos a nuestros asociados un espacio donde practicar deportes, desarrollar actividades culturales y sociales para contribuir, con sus diversas manifestaciones, a fortalecer los valores cristianos para la formación de personas espiritual y físicamente sanas y fuertes.
              </p>
            </div>

            {/* Quote Alfonso */}
            <blockquote className="p-8 lg:p-10 bg-amarillo/10 rounded-2xl relative">
              <svg className="absolute top-6 left-6 lg:left-8 w-8 h-8 text-amarillo/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <div className="pl-10 lg:pl-12">
                <p className="text-bordo/70 mb-3 italic">
                  En definitiva, vivimos el deporte como lo describe Alfonso Alonso-Lasheras, SJ:
                </p>
                <p className="text-bordo-dark text-xl leading-relaxed">
                  &ldquo;…La vida es como un gran partido en el que uno sólo se puede sentir contento si sabe que lo ha dado todo haciéndolo lo mejor posible. Porque en la vida, casi todas las cosas realmente importantes están cuesta arriba, empezando por la propia felicidad. Y es ahí donde el deporte nos enseña a todos a luchar y a desgastarnos por aquello que merece la pena (…) Ojalá que el deporte hoy, como entonces, también sea herramienta que ayude a crear fraternidad, a tender puentes y a derribar muros&rdquo;.
                </p>
                <p className="text-bordo/50 text-sm mt-4">
                  <a
                    href="http://jesuitasaru.org/deporte-encuentro-fraternal-y-paz-en-el-mundo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-bordo transition-colors"
                  >
                    jesuitasaru.org/deporte-encuentro-fraternal-y-paz-en-el-mundo
                  </a>
                </p>
              </div>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Nuestro Escudo */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-12 xl:px-20">
          <div ref={escudoRef} className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-bordo mb-12 text-center tracking-tight">
              Nuestro Escudo
            </h2>

            {/* Escudo e info */}
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center mb-10">
              <div className="lg:col-span-2 hidden lg:flex justify-center">
                <div className="relative w-40 h-40 md:w-52 md:h-52">
                  <Image
                    src="/logo-cs.png"
                    alt="Escudo Club Seminario"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="lg:col-span-3">
                <h3 className="text-xl font-bold text-bordo mb-4">El escudo</h3>
                <div className="space-y-4 text-bordo-dark/80 text-xl leading-relaxed">
                  <p>
                    El escudo del Club toma uno de los tres símbolos representados en el escudo del Colegio Seminario. Los lobos apoyados en el caldero son la imagen de la familia de San Ignacio de Loyola, fundador de la Compañía de Jesús.
                  </p>
                  <p>
                    Es un símbolo que identifica a los jesuitas en todo el mundo. Los Loyola tienen un escudo que expresa la virtud de ese hogar: la hospitalidad. Este sentimiento está expresado por dos lobos pardos en sable. Es decir, &ldquo;la hospitalidad de los Loyola se extiende aún a las fieras de la montaña, a todos reciben sin miramientos&rdquo;.
                  </p>
                </div>
              </div>
            </div>

            {/* Los colores */}
            <h3 className="text-xl font-bold text-bordo mb-4">Los colores</h3>
            <div className="space-y-5 text-bordo-dark/80 text-xl leading-relaxed mb-8">
              <p>
                El escudo de Los Oñaz, la línea materna de San Ignacio, representa sobre campo de oro (hidalguía, heroísmo, fidelidad) siete barras de color sangre, la derramada en la batalla por los siete hijos del señor de Oñaz.
              </p>
              <p>
                El bordó representa el sacrificio y la entrega de cada persona que practica deportes en el Club. El oro representa la voluntad y esfuerzo de cada integrante del Club por superarse a sí mismo, en servicio de sus compañeros y de la institución. Ser generosos y nobles en nuestro desempeño dentro y fuera de las canchas. Ser fieles a los valores cristianos en nuestro accionar.
              </p>
            </div>

            {/* Quote final */}
            <blockquote className="mt-14 py-6 px-8 bg-amarillo/8 rounded-xl text-center">
              <p className="text-xl text-bordo/90 font-medium italic max-w-2xl mx-auto">
                &ldquo;Nuestro escudo y sus colores representan una forma de ser, actuar y vivir.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
      </section>

    </>
  );
}
