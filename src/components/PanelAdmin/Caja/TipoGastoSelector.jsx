import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';

const TipoGastoSelector = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [tiposGasto, setTiposGasto] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTipoGasto, setNewTipoGasto] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);

  useEffect(() => {
    fetchTiposGasto();
  }, []);

  const fetchTiposGasto = async () => {
    setLoadingTipos(true);
    try {
      const response = await api.get('/tipos-gasto');
      if (response.data.success) {
        setTiposGasto(response.data.tipos_gasto);
      }
    } catch (error) {
      console.error('Error al cargar tipos de gasto:', error);
      toast.error('Error al cargar tipos de gasto');
    } finally {
      setLoadingTipos(false);
    }
  };

  const handleAddTipoGasto = async () => {
    if (!newTipoGasto.trim()) {
      toast.error('Ingrese un nombre válido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/tipos-gasto', {
        nombre: newTipoGasto
      });

      if (response.data.success) {
        toast.success('Tipo de gasto agregado correctamente');
        setNewTipoGasto('');
        setShowAddDialog(false);
        await fetchTiposGasto();
      }
    } catch (error) {
      console.error('Error al agregar tipo de gasto:', error);
      toast.error(error.response?.data?.message || 'Error al agregar tipo de gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white border border-gray-300 text-gray-700 h-10"
          >
            {value
              ? tiposGasto.find((tipo) => tipo.id === value)?.nombre || "Seleccionar tipo de gasto"
              : "Seleccionar tipo de gasto"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[300px] p-0 bg-white border border-gray-200 shadow-md">
          <Command className="bg-white">
            <CommandInput placeholder="Buscar tipo de gasto..." className="h-10 border-b" />
            <CommandEmpty className="py-3 px-4 text-sm text-gray-500">
              {loadingTipos ? 'Cargando...' : 'No se encontraron resultados'}
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-y-auto">
              {tiposGasto.map((tipo) => (
                <CommandItem
                  key={tipo.id}
                  value={tipo.nombre}
                  onSelect={() => {
                    onChange(tipo.id === value ? null : tipo.id);
                    setOpen(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tipo.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tipo.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="p-2 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm bg-gray-50 hover:bg-gray-100"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar nuevo tipo de gasto
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Agregar Tipo de Gasto</DialogTitle>
            <DialogDescription>
              Ingrese el nombre del nuevo tipo de gasto
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={newTipoGasto}
                onChange={(e) => setNewTipoGasto(e.target.value)}
                placeholder="Ej: Alquiler, Servicios, Materiales"
                className="border border-gray-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={loading}
              className="border border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddTipoGasto}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              {loading ? 'Agregando...' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TipoGastoSelector; 