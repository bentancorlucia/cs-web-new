"use client";

import { cn } from "@/lib/utils";
import type { EstadoPedido } from "@/types/tienda";

interface StatusBadgeProps {
  status: string;
  type?: "pedido" | "evento" | "entrada" | "producto";
  size?: "sm" | "md";
}

const pedidoStatuses: Record<EstadoPedido, { label: string; color: string }> = {
  pendiente: {
    label: "Pendiente",
    color: "bg-amber-50 text-amber-600",
  },
  pagado: {
    label: "Pagado",
    color: "bg-sky-50 text-sky-600",
  },
  preparando: {
    label: "Preparando",
    color: "bg-violet-50 text-violet-600",
  },
  enviado: {
    label: "Enviado",
    color: "bg-cyan-50 text-cyan-600",
  },
  entregado: {
    label: "Entregado",
    color: "bg-emerald-50 text-emerald-600",
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-rose-50 text-rose-600",
  },
};

const entradaStatuses: Record<string, { label: string; color: string }> = {
  valida: {
    label: "Válida",
    color: "bg-emerald-50 text-emerald-600",
  },
  usada: {
    label: "Usada",
    color: "bg-gray-100 text-gray-500",
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-rose-50 text-rose-600",
  },
  transferida: {
    label: "Transferida",
    color: "bg-sky-50 text-sky-600",
  },
};

const productoStatuses: Record<string, { label: string; color: string }> = {
  activo: {
    label: "Activo",
    color: "bg-emerald-50 text-emerald-600",
  },
  inactivo: {
    label: "Inactivo",
    color: "bg-gray-100 text-gray-500",
  },
  sin_stock: {
    label: "Sin stock",
    color: "bg-rose-50 text-rose-600",
  },
  destacado: {
    label: "Destacado",
    color: "bg-amber-50 text-amber-600",
  },
};

const eventoStatuses: Record<string, { label: string; color: string }> = {
  publicado: {
    label: "Publicado",
    color: "bg-emerald-50 text-emerald-600",
  },
  borrador: {
    label: "Borrador",
    color: "bg-gray-100 text-gray-500",
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-rose-50 text-rose-600",
  },
  finalizado: {
    label: "Finalizado",
    color: "bg-sky-50 text-sky-600",
  },
};

export function StatusBadge({ status, type = "pedido", size = "md" }: StatusBadgeProps) {
  let statusConfig: { label: string; color: string } | undefined;

  switch (type) {
    case "pedido":
      statusConfig = pedidoStatuses[status as EstadoPedido];
      break;
    case "entrada":
      statusConfig = entradaStatuses[status];
      break;
    case "producto":
      statusConfig = productoStatuses[status];
      break;
    case "evento":
      statusConfig = eventoStatuses[status];
      break;
  }

  if (!statusConfig) {
    statusConfig = {
      label: status,
      color: "bg-gray-100 text-gray-500",
    };
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs",
        statusConfig.color
      )}
    >
      {statusConfig.label}
    </span>
  );
}
