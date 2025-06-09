
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redireciona se já estiver logado
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") {
        router.replace("/");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulação de login
    // No futuro, substitua isso pela lógica de autenticação real
    if (email && password) { // Poderia ser uma verificação mais robusta
      setTimeout(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true");
        }
        router.replace("/"); // Usar replace para não adicionar ao histórico de navegação
      }, 1000);
    } else {
      setError("Por favor, preencha todos os campos.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="https://locagoraveiculos.com.br/storage/2023/08/GO-removebg-preview-2-300x252.png"
              alt="Locagora Logo"
              width={120}
              height={100}
              priority
              className="object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-primary font-headline">Acesse sua Conta</CardTitle>
          <CardDescription>
            Bem-vindo ao Painel Master Salvador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center text-muted-foreground">
                <KeyRound className="mr-2 h-4 w-4" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-xs text-muted-foreground mt-4">
          <p>&copy; {new Date().getFullYear()} Floc Grupo. Todos os direitos reservados.</p>
          <Link href="#" className="hover:text-primary hover:underline mt-1">
            Esqueceu sua senha?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
