
"use client";

// ESTE ARQUIVO NÃO É MAIS USADO E PODE SER REMOVIDO.
// A lógica do formulário foi movida para src/app/rastreadores/page.tsx
// para melhor gerenciamento de estado do modal e dados.

// Mantendo o conteúdo apenas para evitar erros de importação caso algo ainda o referencie por engano,
// mas ele deve ser desconsiderado.

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
      await onAddRastreador(formData);
      setFormData({
        cnpj: "", empresa: "", franqueado: "", chassi: "", placa: "",
        rastreador: "", tipo: "", moto: "", mes: "", valor: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Falha ao submeter o formulário:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Rastreador (Formulário Antigo)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Rastreador (Formulário Antigo)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
              <Input id="cnpj" value={formData.cnpj} onChange={handleChange} className="col-span-3" />
            </div>
            {/* Outros campos... */}
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

// Recomenda-se remover este arquivo do projeto.
