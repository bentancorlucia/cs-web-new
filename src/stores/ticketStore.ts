import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Asistente {
  nombre: string;
  cedula: string;
  email: string;
  telefono?: string;
}

export interface TicketSelection {
  tipoEntradaId: string;
  tipoEntradaNombre: string;
  precio: number;
  precioSocio?: number;
  cantidad: number;
  asistentes: Asistente[];
}

export interface TicketState {
  eventoId: string | null;
  eventoSlug: string | null;
  eventoTitulo: string | null;
  loteId: string | null;
  loteNombre: string | null;
  selections: TicketSelection[];
  step: "seleccion" | "asistentes" | "pago" | "confirmacion";

  // Actions
  setEvento: (id: string, slug: string, titulo: string) => void;
  setLote: (id: string, nombre: string) => void;
  addSelection: (selection: Omit<TicketSelection, "asistentes">) => void;
  updateSelectionQuantity: (tipoEntradaId: string, cantidad: number) => void;
  removeSelection: (tipoEntradaId: string) => void;
  setAsistentes: (tipoEntradaId: string, asistentes: Asistente[]) => void;
  setStep: (step: TicketState["step"]) => void;
  getTotal: (esSocio: boolean) => number;
  getTotalEntradas: () => number;
  clearTickets: () => void;
  clearAll: () => void;
}

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      eventoId: null,
      eventoSlug: null,
      eventoTitulo: null,
      loteId: null,
      loteNombre: null,
      selections: [],
      step: "seleccion",

      setEvento: (id, slug, titulo) => {
        const { eventoId } = get();
        // Si cambia el evento, limpiar selecciones
        if (eventoId !== id) {
          set({
            eventoId: id,
            eventoSlug: slug,
            eventoTitulo: titulo,
            loteId: null,
            loteNombre: null,
            selections: [],
            step: "seleccion",
          });
        }
      },

      setLote: (id, nombre) => {
        const { loteId } = get();
        // Si cambia el lote, limpiar selecciones
        if (loteId !== id) {
          set({
            loteId: id,
            loteNombre: nombre,
            selections: [],
          });
        }
      },

      addSelection: (selection) => {
        set((state) => {
          const existing = state.selections.find(
            (s) => s.tipoEntradaId === selection.tipoEntradaId
          );

          if (existing) {
            return {
              selections: state.selections.map((s) =>
                s.tipoEntradaId === selection.tipoEntradaId
                  ? { ...s, cantidad: s.cantidad + selection.cantidad }
                  : s
              ),
            };
          }

          return {
            selections: [
              ...state.selections,
              { ...selection, asistentes: [] },
            ],
          };
        });
      },

      updateSelectionQuantity: (tipoEntradaId, cantidad) => {
        set((state) => {
          if (cantidad <= 0) {
            return {
              selections: state.selections.filter(
                (s) => s.tipoEntradaId !== tipoEntradaId
              ),
            };
          }

          return {
            selections: state.selections.map((s) =>
              s.tipoEntradaId === tipoEntradaId
                ? {
                    ...s,
                    cantidad,
                    // Ajustar asistentes si la cantidad cambió
                    asistentes: s.asistentes.slice(0, cantidad),
                  }
                : s
            ),
          };
        });
      },

      removeSelection: (tipoEntradaId) => {
        set((state) => ({
          selections: state.selections.filter(
            (s) => s.tipoEntradaId !== tipoEntradaId
          ),
        }));
      },

      setAsistentes: (tipoEntradaId, asistentes) => {
        set((state) => ({
          selections: state.selections.map((s) =>
            s.tipoEntradaId === tipoEntradaId ? { ...s, asistentes } : s
          ),
        }));
      },

      setStep: (step) => set({ step }),

      getTotal: (esSocio) => {
        const { selections } = get();
        return selections.reduce((total, s) => {
          const precio = esSocio && s.precioSocio ? s.precioSocio : s.precio;
          return total + precio * s.cantidad;
        }, 0);
      },

      getTotalEntradas: () => {
        const { selections } = get();
        return selections.reduce((count, s) => count + s.cantidad, 0);
      },

      clearTickets: () => {
        set({
          selections: [],
          step: "seleccion",
        });
      },

      clearAll: () => {
        set({
          eventoId: null,
          eventoSlug: null,
          eventoTitulo: null,
          loteId: null,
          loteNombre: null,
          selections: [],
          step: "seleccion",
        });
      },
    }),
    {
      name: "club-seminario-tickets",
    }
  )
);
