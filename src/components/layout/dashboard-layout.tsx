"use client";

import Link from "next/link";
import Image from "next/image";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, ListFilter, Users, BarChart3, Package, MapPin, Wrench, CheckCircle2, XCircle, Bike as SidebarBikeIcon, TrendingUp, LogOut, User, Settings, DollarSign } from "lucide-react";
import type { NavItem, StatusRapidoItem as StatusRapidoItemType, Motorcycle, MotorcycleStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { useAuth } from '@/context/AuthContext';

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", subLabel: "Visão geral", icon: LayoutDashboard },
  { href: "/motorcycles", label: "Gestão de Motos", subLabel: "Frota completa", icon: ListFilter },
  { href: "/venda-motos", label: "Venda de Motos", subLabel: "Registro de vendas", icon: DollarSign },
  { href: "/projecao-motos", label: "Projeção de Crescimento", subLabel: "Meta 1.000 motos", icon: TrendingUp },
  { href: "/rastreadores", label: "Rastreadores", subLabel: "Nossos rastreadores", icon: MapPin },
  { href: "/franqueados", label: "Franqueados", subLabel: "Análise por franqueado", icon: Users },
  { href: "/financeiro", label: "Financeiro", subLabel: "Receitas e análises", icon: DollarSign },
  { href: "/relatorios", label: "Relatórios", subLabel: "Análises e métricas", icon: BarChart3 },
  { href: "/predict-idle", label: "Previsão de Ociosidade", subLabel: "IA para tempo ocioso", icon: BarChart3 },
  { href: "/frota", label: "Frota", subLabel: "Análise de modelos", icon: Package },
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
  const { user, logout } = useAuth();
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [dynamicStatusRapidoItems, setDynamicStatusRapidoItems] = useState<StatusRapidoItemType[]>(initialStatusRapidoItems);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

    const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
    allMotorcycles.forEach(moto => {
      if (!moto.placa) return; 

      const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];

      if (!existingMoto) {
        uniqueMotorcyclesByPlaca[moto.placa] = moto;
      } else {
        const existingDateStr = existingMoto.data_ultima_mov;
        const currentDateStr = moto.data_ultima_mov;

        if (currentDateStr && existingDateStr) {
          if (new Date(currentDateStr) > new Date(existingDateStr)) {
            uniqueMotorcyclesByPlaca[moto.placa] = moto; 
          }
        } else if (currentDateStr && !existingDateStr) {
          uniqueMotorcyclesByPlaca[moto.placa] = moto; 
        }
      }
    });
    const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);

    const counts: Record<MotorcycleStatus, number> = {
      active: 0,
      alugada: 0,
      inadimplente: 0,
      manutencao: 0,
      recolhida: 0,
      relocada: 0,
      indisponivel_rastreador: 0,
      indisponivel_emplacamento: 0,
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
        <SidebarHeader className="p-4 flex items-center justify-start">
          <Link href="/" className="flex items-center">
            <Image
              src="https://locagoraveiculos.com.br/storage/2023/08/GO-removebg-preview-2-300x252.png" 
              alt="Locagora Logo"
              width={48} 
              height={40} 
              className="object-contain mr-2" 
              priority
            />
             <div>
              <span className="font-bold text-lg text-sidebar-foreground">Master Salvador</span>
              <p className="text-xs text-sidebar-foreground/80">Gestao de Locacao</p>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto hover:bg-sidebar-accent">
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Usuário'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(user?.displayName || user?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.displayName || 'Usuário'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/80 truncate">
                      {user?.email || 'Salvador - BA'}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center">
            <SidebarTrigger className="md:hidden" />
          </div>
          <div className="flex items-center">
            <Image
              src="https://i.postimg.cc/yx9LJQpZ/logo.png"
              alt="Floc Grupo Logo"
              width={144} 
              height={36} 
              className="object-contain"
              priority
            />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
