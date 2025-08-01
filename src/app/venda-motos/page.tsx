"use client";

import { useAuth } from "@/context/AuthContext"; // Importa o hook de autenticação
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaMotosTable } from "@/components/venda-motos/venda-motos-table";
import { AnaliseFranqueadoView } from "@/components/venda-motos/analise-franqueado-view";
import { AnaliseProdutoView } from "@/components/venda-motos/analise-produto-view";
import { VendasKpiCards } from "@/components/venda-motos/kpi/vendas-kpi-cards";
import { DollarSign, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Lista de IDs de usuários permitidos
const ALLOWED_USER_IDS = [
  "edsTZ2zG54Ph2ZoNSyFZXoJj74s2", 
  "FOHbVCbMyhadO3tm1rVdknwLVPr1", 
  "VL0J7KdhhPUAmcTI0onP2PqZ19T2", 
  "9NvNKnLzbJZIrO7p8FlgFJ0IuYL2", 
  "asa5TnKscSgeZbOUZKem2cJl0Yf2", 
  "y884M0oE6lbom15xQw0DpAup4Tg1"
];

export default function VendaMotosPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Debug temporário - mostrar UID do usuário
  console.log("Debug Venda Motos - User UID:", user?.uid);
  console.log("Debug Venda Motos - User UID length:", user?.uid?.length);
  console.log("Debug Venda Motos - Allowed IDs:", ALLOWED_USER_IDS);
  console.log("Debug Venda Motos - Target UID exact match test:", user?.uid === "y884M0oE6lbom15xQw0DpAup4Tg1");
  console.log("Debug Venda Motos - Array includes test:", user?.uid && ALLOWED_USER_IDS.includes(user.uid));
  
  // Função de verificação mais robusta
  const isUserAllowed = (userUid: string | undefined): boolean => {
    if (!userUid) return false;
    
    // Limpar espaços e caracteres especiais
    const cleanUid = userUid.trim();
    const cleanAllowedIds = ALLOWED_USER_IDS.map(id => id.trim());
    
    console.log("Debug - Clean UID:", cleanUid);
    console.log("Debug - Clean Allowed IDs:", cleanAllowedIds);
    console.log("Debug - Clean includes test:", cleanAllowedIds.includes(cleanUid));
    
    return cleanAllowedIds.includes(cleanUid);
  };

  // Verifica se o ID do usuário está na lista de permitidos
  if (!user || !isUserAllowed(user.uid)) {
    return (
      <DashboardLayout>
        <PageHeader
            title="Acesso Restrito"
            description="Você não tem permissão para visualizar esta página."
            icon={ShieldAlert}
            iconContainerClassName="bg-red-600"
        />
        <div className="p-4">
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4"/>
                <AlertTitle>Acesso Negado</AlertTitle>
                <AlertDescription>
                    Esta área é restrita e requer permissões especiais. Por favor, entre em contato com o administrador se você acredita que isso é um erro.
                    <br /><br />
                    <strong>Debug Info:</strong><br />
                    User UID: {user?.uid || 'Não logado'}<br />
                    User Email: {user?.email || 'N/A'}
                </AlertDescription>
            </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Venda de Motos"
        description="Analise as vendas, receitas e performance dos compradores."
        icon={DollarSign}
        iconContainerClassName="bg-green-600"
      />
      
      <div className="space-y-4 mb-6">
        <VendasKpiCards />
      </div>

      <Tabs defaultValue="produto" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produto">Gráficos</TabsTrigger>
          <TabsTrigger value="franqueado">Análise por Franqueado</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
        </TabsList>
        <TabsContent value="produto">
          <AnaliseProdutoView />
        </TabsContent>
        <TabsContent value="franqueado">
          <AnaliseFranqueadoView />
        </TabsContent>
        <TabsContent value="dados">
          <VendaMotosTable />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
