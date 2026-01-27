"use client";

import { useState } from "react";
import { AdminHeader, StatsCard } from "@/components/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ReportType = "ventas" | "productos" | "eventos" | "entradas";

interface ReportConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: string[];
}

const reportConfigs: Record<ReportType, ReportConfig> = {
  ventas: {
    title: "Reporte de Ventas",
    description: "Pedidos completados con detalles de productos y totales",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    fields: ["numero_pedido", "fecha", "cliente", "email", "productos", "subtotal", "envio", "total", "estado", "metodo_pago"],
  },
  productos: {
    title: "Reporte de Productos",
    description: "Inventario de productos con stock y precios",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    fields: ["sku", "nombre", "categoria", "precio", "precio_oferta", "stock", "estado", "destacado"],
  },
  eventos: {
    title: "Reporte de Eventos",
    description: "Eventos con estadísticas de venta de entradas",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    fields: ["titulo", "fecha", "ubicacion", "capacidad", "entradas_vendidas", "ingresos", "estado"],
  },
  entradas: {
    title: "Reporte de Entradas",
    description: "Entradas vendidas con datos de asistentes",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    fields: ["codigo_qr", "evento", "lote", "tipo_entrada", "asistente", "cedula", "email", "estado", "fecha_compra"],
  },
};

export default function ReportesPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("ventas");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[] | null>(null);

  const generateReport = async (download: boolean = false) => {
    setGenerating(true);
    const supabase = createClient();

    try {
      let data: Record<string, unknown>[] = [];

      switch (selectedReport) {
        case "ventas": {
          let query = supabase
            .from("pedidos")
            .select(`
              *,
              items:items_pedido(nombre_producto, cantidad, precio_unitario, subtotal)
            `)
            .in("estado", ["pagado", "preparando", "enviado", "entregado"])
            .order("created_at", { ascending: false });

          if (dateFrom) query = query.gte("created_at", dateFrom);
          if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59`);

          const { data: pedidos } = await query;

          data = (pedidos ?? []).map((p) => ({
            numero_pedido: p.numero_pedido,
            fecha: formatDate(p.created_at),
            cliente: p.nombre_completo,
            email: p.email,
            productos: p.items?.map((i: { nombre_producto: string; cantidad: number }) => `${i.nombre_producto} (x${i.cantidad})`).join("; "),
            subtotal: p.subtotal,
            envio: p.costo_envio,
            total: p.total,
            estado: p.estado,
            metodo_pago: p.metodo_pago ?? "MercadoPago",
          }));
          break;
        }

        case "productos": {
          const { data: productos } = await supabase
            .from("productos")
            .select(`
              *,
              categoria:categorias_producto(nombre)
            `)
            .order("nombre");

          data = (productos ?? []).map((p) => ({
            sku: p.sku,
            nombre: p.nombre,
            categoria: p.categoria?.nombre ?? "Sin categoría",
            precio: p.precio,
            precio_oferta: p.precio_oferta ?? "-",
            stock: p.stock,
            estado: p.activo ? "Activo" : "Inactivo",
            destacado: p.destacado ? "Sí" : "No",
          }));
          break;
        }

        case "eventos": {
          let query = supabase
            .from("eventos_sociales")
            .select("*")
            .order("fecha_evento", { ascending: false });

          if (dateFrom) query = query.gte("fecha_evento", dateFrom);
          if (dateTo) query = query.lte("fecha_evento", `${dateTo}T23:59:59`);

          const { data: eventos } = await query;

          // Get stats for each event
          const eventosConStats = await Promise.all(
            (eventos ?? []).map(async (e) => {
              const { data: stats } = await supabase
                .from("estadisticas_evento")
                .select("*")
                .eq("evento_id", e.id)
                .single();

              return {
                titulo: e.titulo,
                fecha: formatDate(e.fecha_evento),
                ubicacion: e.ubicacion ?? "-",
                capacidad: e.capacidad_total ?? "Ilimitada",
                entradas_vendidas: stats?.total_vendidas ?? 0,
                ingresos: stats?.ingresos_totales ?? 0,
                estado: e.publicado ? "Publicado" : "Borrador",
              };
            })
          );

          data = eventosConStats;
          break;
        }

        case "entradas": {
          let query = supabase
            .from("entradas")
            .select(`
              *,
              evento:eventos_sociales(titulo),
              lote:lotes_entrada(nombre),
              tipo:tipos_entrada(nombre)
            `)
            .order("fecha_compra", { ascending: false });

          if (dateFrom) query = query.gte("fecha_compra", dateFrom);
          if (dateTo) query = query.lte("fecha_compra", `${dateTo}T23:59:59`);

          const { data: entradas } = await query;

          data = (entradas ?? []).map((e) => ({
            codigo_qr: e.codigo_qr,
            evento: e.evento?.titulo ?? "-",
            lote: e.lote?.nombre ?? "-",
            tipo_entrada: e.tipo?.nombre ?? "-",
            asistente: e.nombre_asistente,
            cedula: e.cedula_asistente ?? "-",
            email: e.email_asistente ?? "-",
            estado: e.estado,
            fecha_compra: formatDate(e.fecha_compra),
          }));
          break;
        }
      }

      if (download && data.length > 0) {
        downloadCSV(data, `${selectedReport}_${new Date().toISOString().split("T")[0]}.csv`);
      } else {
        setPreviewData(data.slice(0, 10));
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            const stringValue = String(value ?? "");
            // Escape quotes and wrap in quotes if contains comma
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Reportes"
        subtitle="Genera y exporta reportes en formato CSV"
      />

      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(reportConfigs) as [ReportType, ReportConfig][]).map(
              ([type, config]) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedReport(type);
                    setPreviewData(null);
                  }}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    selectedReport === type
                      ? "border-bordo bg-bordo/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                      selectedReport === type
                        ? "bg-bordo/10 text-bordo"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {config.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{config.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                </button>
              )
            )}
          </div>

          {/* Filters */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Fecha desde"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                label="Fecha hasta"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => generateReport(false)}
                  isLoading={generating}
                >
                  Vista Previa
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => generateReport(true)}
                  isLoading={generating}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                >
                  Exportar CSV
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview */}
          {previewData && (
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Vista Previa
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (mostrando {previewData.length} de los registros)
                  </span>
                </h2>
                <Button
                  size="sm"
                  onClick={() => generateReport(true)}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                >
                  Descargar Todo
                </Button>
              </div>

              {previewData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No hay datos para el período seleccionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-y border-gray-100">
                      <tr>
                        {Object.keys(previewData[0]).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-3 text-left font-medium text-gray-500 uppercase text-xs"
                          >
                            {key.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {previewData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {typeof value === "number" && value >= 100
                                ? formatPrice(value)
                                : String(value ?? "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Columns Info */}
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Columnas del Reporte
            </h2>
            <div className="flex flex-wrap gap-2">
              {reportConfigs[selectedReport].fields.map((field) => (
                <span
                  key={field}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg"
                >
                  {field.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
