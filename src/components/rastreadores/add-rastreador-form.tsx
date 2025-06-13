"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Define a interface para os dados do formulário
interface FormData {
  cnpj: string;
  empresa: string;
  franqueado: string;
  chassi: string;
  placa: string;
  rastreador: string;
  tipo: string;
  moto: string;
  mes: string;
  valor: string;
}

interface AddRastreadorFormProps {
  onAddRastreador: (data: FormData) => Promise<void>;
}

export function AddRastreadorForm({ onAddRastreador }: AddRastreadorFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cnpj: "", empresa: "", franqueado: "", chassi: "", placa: "",
    rastreador: "", tipo: "", moto: "", mes: "", valor: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Chama a função recebida por props para adicionar o rastreador
      await onAddRastreador(formData);
      // Limpa o formulário e fecha o diálogo em caso de sucesso
      setFormData({
        cnpj: "", empresa: "", franqueado: "", chassi: "", placa: "",
        rastreador: "", tipo: "", moto: "", mes: "", valor: "",
      });
      setOpen(false);
    } catch (error) {
      // O erro já é tratado na página principal, mas um log pode ser útil
      console.error("Falha ao submeter o formulário:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Rastreador</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Rastreador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Campos do formulário... */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
              <Input id="cnpj" value={formData.cnpj} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="empresa" className="text-right">EMPRESA</Label>
              <Input id="empresa" value={formData.empresa} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="franqueado" className="text-right">FRANQUEADO</Label>
              <Input id="franqueado" value={formData.franqueado} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chassi" className="text-right">CHASSI</Label>
              <Input id="chassi" value={formData.chassi} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="placa" className="text-right">PLACA</Label>
              <Input id="placa" value={formData.placa} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rastreador" className="text-right">RASTREADOR</Label>
              <Input id="rastreador" value={formData.rastreador} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">TIPO</Label>
              <Input id="tipo" value={formData.tipo} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="moto" className="text-right">MOTO</Label>
              <Input id="moto" value={formData.moto} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mes" className="text-right">MÊS</Label>
              <Input id="mes" value={formData.mes} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">VALOR</Label>
              <Input id="valor" value={formData.valor} onChange={handleChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
