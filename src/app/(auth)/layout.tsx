import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bordo via-bordo-dark to-bordo relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <Link href="/" className="mb-12">
            <Image
              src="/logo-cs.png"
              alt="Club Seminario"
              width={160}
              height={160}
              className="drop-shadow-2xl"
            />
          </Link>

          <h1 className="text-4xl font-bold mb-4 text-center">Club Seminario</h1>
          <p className="text-xl text-white/80 text-center max-w-md mb-8">
            Deporte, valores y comunidad desde 2010
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-amarillo">+1000</div>
              <div className="text-sm text-white/70">Socios activos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amarillo">22</div>
              <div className="text-sm text-white/70">Disciplinas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amarillo">+600</div>
              <div className="text-sm text-white/70">Partidos al año</div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amarillo/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-48 h-48 bg-amarillo/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-50">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden mb-8">
          <Image
            src="/logo-cs.png"
            alt="Club Seminario"
            width={80}
            height={80}
          />
        </Link>

        <div className="w-full max-w-md">{children}</div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Link href="/" className="hover:text-bordo transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
