# Guia de Autenticação - Master Salvador

## Visão Geral

Foi implementado um sistema completo de autenticação com Firebase para o painel Master Salvador. Apenas usuários cadastrados e autenticados podem acessar o sistema.

## Funcionalidades Implementadas

### 1. **Páginas de Autenticação**
- **Login** (`/login`): Página de entrada com identidade visual da empresa
- **Cadastro** (`/signup`): Página para criação de novas contas
- **Proteção de Rotas**: Todas as páginas do dashboard são protegidas

### 2. **Identidade Visual**
- Logo da Locagora e Floc Grupo
- Cores da marca (azul #354FBF e verde #6DCC33)
- Design responsivo e moderno
- Gradientes e efeitos visuais consistentes

### 3. **Funcionalidades de Segurança**
- Autenticação via Firebase Auth
- Validação de formulários
- Mensagens de erro personalizadas
- Logout seguro
- Proteção de rotas automática

## Como Usar

### Para Usuários

1. **Primeiro Acesso**:
   - Acesse `/signup` para criar uma conta
   - Preencha: Nome completo, email e senha
   - A senha deve ter pelo menos 6 caracteres

2. **Login**:
   - Acesse `/login` ou será redirecionado automaticamente
   - Digite email e senha cadastrados
   - Clique em "Entrar"

3. **Navegação**:
   - Após login, acesso completo ao dashboard
   - Menu lateral com todas as funcionalidades
   - Dropdown do usuário no canto inferior esquerdo

4. **Logout**:
   - Clique no avatar do usuário no sidebar
   - Selecione "Sair" no menu dropdown

### Para Desenvolvedores

#### Estrutura de Arquivos Criados/Modificados:

```
src/
├── context/
│   └── AuthContext.tsx          # Contexto de autenticação
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx   # Componente de proteção de rotas
├── lib/
│   └── firebase/
│       ├── config.ts           # Configuração Firebase (atualizada)
│       └── userService.ts      # Serviços de usuário
├── app/
│   ├── layout.tsx              # Layout principal (com AuthProvider)
│   ├── page.tsx                # Dashboard (com proteção)
│   ├── login/
│   │   └── page.tsx            # Página de login
│   └── signup/
│       └── page.tsx            # Página de cadastro
└── components/layout/
    └── dashboard-layout.tsx    # Layout do dashboard (com logout)
```

#### Configuração do Firebase:

As credenciais devem ser configuradas no `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="sua_api_key_aqui"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu_projeto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu_projeto_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu_projeto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="seu_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="seu_app_id"
```

**⚠️ IMPORTANTE**: Nunca exponha suas credenciais reais em arquivos de documentação!

#### Regras do Firestore:

As regras foram atualizadas para garantir segurança:
- Apenas usuários autenticados podem acessar dados
- Usuários podem gerenciar apenas seus próprios perfis
- Admins têm acesso expandido

## Componentes Principais

### AuthContext
Gerencia o estado global de autenticação:
- `user`: Usuário atual ou null
- `loading`: Estado de carregamento
- `signIn()`: Função de login
- `signUp()`: Função de cadastro
- `logout()`: Função de logout

### ProtectedRoute
Componente que protege rotas:
- Verifica se usuário está autenticado
- Redireciona para login se necessário
- Mostra loading durante verificação

### UserService
Serviços para gerenciamento de usuários:
- Criação de perfis
- Atualização de dados
- Controle de permissões

## Fluxo de Autenticação

1. **Usuário não autenticado** → Redirecionado para `/login`
2. **Login bem-sucedido** → Redirecionado para dashboard (`/`)
3. **Navegação protegida** → Verificação automática de autenticação
4. **Logout** → Limpeza de sessão e redirecionamento para login

## Personalização

### Cores da Marca
Definidas em `globals.css`:
- **Primary**: #354FBF (Azul da marca)
- **Accent**: #6DCC33 (Verde da marca)
- **Background**: Gradientes suaves

### Logos
- **Locagora**: Logo principal no cabeçalho de login
- **Floc Grupo**: Logo secundário

## Segurança

- ✅ Autenticação obrigatória
- ✅ Validação de formulários
- ✅ Proteção de rotas
- ✅ Regras de Firestore seguras
- ✅ Logout seguro
- ✅ Tratamento de erros

## Próximos Passos

1. **Gerenciamento de Usuários**: Página admin para gerenciar usuários
2. **Recuperação de Senha**: Implementar reset de senha
3. **Perfis de Usuário**: Página para editar perfil
4. **Permissões Avançadas**: Sistema de roles mais detalhado

## Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar aplicação
http://localhost:9002

# Páginas principais
http://localhost:9002/login    # Login
http://localhost:9002/signup   # Cadastro
http://localhost:9002/         # Dashboard (protegido)
```

## Suporte

Para dúvidas ou problemas:
1. Verifique se o Firebase está configurado corretamente
2. Confirme se as regras do Firestore estão aplicadas
3. Verifique o console do navegador para erros
4. Teste com diferentes usuários e cenários

---

**Sistema implementado com sucesso! 🚀**
Agora apenas usuários cadastrados no Firebase podem acessar o painel Master Salvador.