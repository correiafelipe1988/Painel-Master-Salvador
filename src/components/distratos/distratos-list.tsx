"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, AlertCircle, FileText } from "lucide-react";
import { DistratoData } from "@/lib/firebase/distratoService";
import { formatDate } from "@/lib/utils";

interface DistratosListProps {
  distratos: DistratoData[];
  onEditDistrato: (distrato: DistratoData) => void;
  onDeleteDistrato: (id: string) => void;
  isLoading: boolean;
}

const getCausaBadgeColor = (causa: string) => {
  const causaLower = causa.toLowerCase();
  if (causaLower.includes('inadimplência') || causaLower.includes('inadimplencia')) {
    return 'bg-red-100 text-red-800';
  }
  if (causaLower.includes('desistência') || causaLower.includes('desistencia')) {
    return 'bg-orange-100 text-orange-800';
  }
  if (causaLower.includes('motivos pessoais')) {
    return 'bg-blue-100 text-blue-800';
  }
  if (causaLower.includes('manutenção') || causaLower.includes('manutencao') || causaLower.includes('troca')) {
    return 'bg-purple-100 text-purple-800';
  }
  if (causaLower.includes('sem informações')) {
    return 'bg-gray-100 text-gray-800';
  }
  return 'bg-gray-100 text-gray-800';
};

const formatMotivo = (motivo: string) => {
  if (motivo.length <= 100) return motivo;
  return motivo.substring(0, 100) + '...';
};

const calcularDuracaoContrato = (inicio: string, fim: string) => {
  try {
    // Formato esperado: DD/MM/YYYY
    const [diaInicio, mesInicio, anoInicio] = inicio.split('/');
    const [diaFim, mesFim, anoFim] = fim.split('/');
    
    const dataInicio = new Date(parseInt(anoInicio), parseInt(mesInicio) - 1, parseInt(diaInicio));
    const dataFim = new Date(parseInt(anoFim), parseInt(mesFim) - 1, parseInt(diaFim));
    
    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return '1 dia';
    if (diffDays < 30) return `${diffDays} dias`;
    
    const diffMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    
    if (diffMonths === 1 && remainingDays === 0) return '1 mês';
    if (remainingDays === 0) return `${diffMonths} meses`;
    
    return `${diffMonths}m ${remainingDays}d`;
  } catch {
    return 'N/A';
  }
};

export function DistratosList({ 
  distratos, 
  onEditDistrato, 
  onDeleteDistrato, 
  isLoading 
}: DistratosListProps) {
  const [expandedMotivos, setExpandedMotivos] = useState<Set<string>>(new Set());

  const toggleMotivoExpansion = (id: string) => {
    const newExpanded = new Set(expandedMotivos);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMotivos(newExpanded);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-10">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p>Carregando distratos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (distratos.length === 0) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-10">
          <div className="text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p>Nenhum distrato encontrado.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Distratos de Locação ({distratos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Franqueado</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Causa</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distratos.map((distrato) => (
                <TableRow key={distrato.id}>
                  <TableCell className="font-mono font-medium">
                    {distrato.placa}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate" title={distrato.franqueado}>
                      {distrato.franqueado}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{distrato.inicio_ctt}</span>
                      <span>→</span>
                      <span>{distrato.fim_ctt}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {calcularDuracaoContrato(distrato.inicio_ctt, distrato.fim_ctt)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getCausaBadgeColor(distrato.causa)} text-xs`}
                      variant="secondary"
                    >
                      {distrato.causa}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    {distrato.motivo.length > 100 ? (
                      <div>
                        <p className="text-sm">
                          {expandedMotivos.has(distrato.id || '') 
                            ? distrato.motivo 
                            : formatMotivo(distrato.motivo)
                          }
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => toggleMotivoExpansion(distrato.id || '')}
                        >
                          {expandedMotivos.has(distrato.id || '') ? 'Ver menos' : 'Ver mais'}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm">{distrato.motivo}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditDistrato(distrato)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => distrato.id && onDeleteDistrato(distrato.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}