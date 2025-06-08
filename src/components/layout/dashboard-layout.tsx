
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { MotorcycleIcon as AppMotorcycleIcon } from "@/components/icons/motorcycle-icon"; // Renomeado para evitar conflito
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, ListFilter, AlertTriangle, Users, BarChart3, Settings, Package, MapPin, Wrench, CheckCircle2, XCircle, Bike as SidebarBikeIcon } from "lucide-react";
import type { NavItem, StatusRapidoItem as StatusRapidoItemType, Motorcycle, MotorcycleStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", subLabel: "Visão geral", icon: LayoutDashboard },
  { href: "/motorcycles", label: "Gestão de Motos", subLabel: "Frota completa", icon: ListFilter },
  // { href: "/inadimplencia", label: "Inadimplência", subLabel: "Controle de atrasos", icon: AlertTriangle }, // Comentado conforme PRD
  // { href: "/franqueados", label: "Franqueados", subLabel: "Análise por franqueado", icon: Users }, // Comentado conforme PRD
  { href: "/relatorios", label: "Relatórios", subLabel: "Análises e métricas", icon: BarChart3 },
  { href: "/predict-idle", label: "Previsão de Ociosidade", subLabel: "IA para tempo ocioso", icon: Users }, // Usando Users como placeholder
  { href: "/qr-scanner", label: "Leitor QR", subLabel: "Escanear códigos", icon: ListFilter }, // Usando ListFilter como placeholder
];

const initialStatusRapidoItems: StatusRapidoItemType[] = [
  { label: "Total de Motos", subLabel: "Placas únicas", count: 0, bgColor: "bg-slate-100", textColor: "text-slate-700", badgeTextColor: "text-slate-700", icon: Package },
  { label: "Disponíveis", subLabel: "Motos prontas", count: 0, bgColor: "bg-green-100", textColor: "text-green-700", badgeTextColor: "text-green-700", statusKey: 'active', icon: CheckCircle2 },
  { label: "Alugadas", subLabel: "Em uso", count: 0, bgColor: "bg-blue-100", textColor: "text-blue-700", badgeTextColor: "text-blue-700", statusKey: 'alugada', icon: SidebarBikeIcon },
  { label: "Relocadas", subLabel: "Em transferência", count: 0, bgColor: "bg-gray-100", textColor: "text-gray-700", badgeTextColor: "text-gray-700", statusKey: 'relocada', icon: MapPin },
  { label: "Manutenção", subLabel: "Em oficina", count: 0, bgColor: "bg-purple-100", textColor: "text-purple-700", badgeTextColor: "text-purple-700", statusKey: 'manutencao', icon: Wrench },
  { label: "Recolhidas", subLabel: "Aguardando", count: 0, bgColor: "bg-orange-100", textColor: "text-orange-700", badgeTextColor: "text-orange-700", statusKey: 'recolhida', icon: XCircle },
];


export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [dynamicStatusRapidoItems, setDynamicStatusRapidoItems] = useState<StatusRapidoItemType[]>(initialStatusRapidoItems);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    setIsLoadingStatus(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        const updatedMotorcycles = motosFromDB.map(moto =>
          moto.status === undefined ? { ...moto, status: 'alugada' as MotorcycleStatus } : moto
        );
        setAllMotorcycles(updatedMotorcycles);
      } else {
        console.warn("Data from subscribeToMotorcycles (dashboard layout) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoadingStatus(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoadingStatus || !Array.isArray(allMotorcycles)) {
      setDynamicStatusRapidoItems(prevItems => prevItems.map(item => ({ ...item, count: 0 })));
      return;
    }

    // Etapa 1: Obter o registro mais recente para cada placa única
    const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
    allMotorcycles.forEach(moto => {
      if (!moto.placa) return; // Ignorar motos sem placa

      const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];

      if (!existingMoto) {
        uniqueMotorcyclesByPlaca[moto.placa] = moto;
      } else {
        const existingDateStr = existingMoto.data_ultima_mov;
        const currentDateStr = moto.data_ultima_mov;

        // Comparar datas apenas se ambas existirem
        if (currentDateStr && existingDateStr) {
          if (new Date(currentDateStr) > new Date(existingDateStr)) {
            uniqueMotorcyclesByPlaca[moto.placa] = moto; // Moto atual é mais recente
          }
        } else if (currentDateStr && !existingDateStr) {
          uniqueMotorcyclesByPlaca[moto.placa] = moto; // Moto atual tem data, a existente não
        }
        // Se currentDateStr não existir, ou se ambas as datas forem iguais,
        // a moto existente (primeira encontrada com aquela data ou sem data) é mantida.
      }
    });
    const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);

    // Etapa 2: Calcular contagens com base nas motocicletas representativas
    const counts: Record<MotorcycleStatus, number> = {
      active: 0,
      alugada: 0,
      inadimplente: 0, // Mantido na estrutura, mas não exibido diretamente
      manutencao: 0,
      recolhida: 0,
      relocada: 0,
    };

    representativeMotorcycles.forEach(moto => {
      if (moto.status && counts[moto.status] !== undefined) {
        counts[moto.status]++;
      }
    });
    
    const totalUniqueMotorcycles = representativeMotorcycles.length;

    setDynamicStatusRapidoItems(
      initialStatusRapidoItems.map(item => {
        if (item.label === "Total de Motos") {
          return { ...item, count: totalUniqueMotorcycles };
        }
        return {
          ...item,
          count: item.statusKey ? counts[item.statusKey as MotorcycleStatus] || 0 : 0,
        };
      })
    );
  }, [allMotorcycles, isLoadingStatus]);


  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2.5">
            <AppMotorcycleIcon className="h-8 w-8 text-sidebar-primary" />
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground font-headline leading-tight">
                Master Salvador
              </h1>
              <p className="text-xs text-sidebar-foreground/80 leading-tight">Gestão de Locação</p>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="flex flex-col">
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/70">NAVEGAÇÃO</p>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href} legacyBehavior={false}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.labelTooltip || item.label}
                      className="h-auto py-1.5"
                    >
                      <item.icon className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span>{item.label}</span>
                        {item.subLabel && <span className="text-xs text-sidebar-foreground/70 -mt-0.5">{item.subLabel}</span>}
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
          <SidebarSeparator className="my-2" />
          <div className="p-2 space-y-2">
            <p className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/70">STATUS RÁPIDO</p>
            {dynamicStatusRapidoItems.map((item) => (
              <div key={item.label} className={cn("flex items-center justify-between p-2.5 rounded-md", item.bgColor)}>
                <div className="flex items-center gap-2">
                  {item.icon && <item.icon className={cn("h-5 w-5", item.textColor, "opacity-70")} />}
                  <div>
                    <p className={cn("text-sm font-medium", item.textColor)}>{item.label}</p>
                    <p className={cn("text-xs", item.textColor, "opacity-80")}>{item.subLabel}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={cn("bg-background/70 font-semibold", item.badgeTextColor)}>
                  {isLoadingStatus ? "..." : item.count}
                </Badge>
              </div>
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
          <SidebarSeparator className="my-2 bg-sidebar-border" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/40x40.png" alt="Admin" data-ai-hint="letter A" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
                <p className="text-xs text-sidebar-foreground/80">Salvador - BA</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <SidebarTrigger className="md:hidden" />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    