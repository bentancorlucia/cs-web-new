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
    color: "bg-amber-100 text-amber-700 ring-amber-600/20",
  },
  pagado: {
    label: "Pagado",
    color: "bg-blue-100 text-blue-700 ring-blue-600/20",
  },
  preparando: {
    label: "Preparando",
    color: "bg-purple-100 text-purple-700 ring-purple-600/20",
  },
  enviado: {
    label: "Enviado",
    color: "bg-cyan-100 text-cyan-700 ring-cyan-600/20",
  },
  entregado: {
    label: "Entregado",
    color: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-100 text-red-700 ring-red-600/20",
  },
};

const entradaStatuses: Record<string, { label: string; color: string }> = {
  valida: {
    label: "Válida",
    color: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  },
  usada: {
    label: "Usada",
    color: "bg-gray-100 text-gray-700 ring-gray-600/20",
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-red-100 text-red-700 ring-red-600/20",
  },
  transferida: {
    label: "Transferida",
    color: "bg-blue-100 text-blue-700 ring-blue-600/20",
  },
};

const productoStatuses: Record<string, { label: string; color: string }> = {
  activo: {
    label: "Activo",
    color: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  },
  inactivo: {
    label: "Inactivo",
    color: "bg-gray-100 text-gray-700 ring-gray-600/20",
  },
  sin_stock: {
    label: "Sin stock",
    color: "bg-red-100 text-red-700 ring-red-600/20",
  },
  destacado: {
    label: "Destacado",
    color: "bg-amber-100 text-amber-700 ring-amber-600/20",
  },
};

const eventoStatuses: Record<string, { label: string; color: string }> = {
  publicado: {
    label: "Publicado",
    color: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  },
  borrador: {
    label: "Borrador",
    color: "bg-gray-100 text-gray-700 ring-gray-600/20",
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-100 text-red-700 ring-red-600/20",
  },
  finalizado: {
    label: "Finalizado",
    color: "bg-blue-100 text-blue-700 ring-blue-600/20",
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
      color: "bg-gray-100 text-gray-700 ring-gray-600/20",
    };
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-xs rounded-md" : "px-2.5 py-1 text-xs rounded-lg",
        statusConfig.color
      )}
    >
      {statusConfig.label}
    </span>
  );
}
