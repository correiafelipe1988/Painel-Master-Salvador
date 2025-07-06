# 🏍️ Painel Master Salvador
## Sistema de Gestão de Frota de Motocicletas

---

### 📋 **Visão Geral do Projeto**

O **Painel Master Salvador** é um sistema completo de gestão de frota de motocicletas desenvolvido para a **LocaGora**, focado no controle operacional, financeiro e analítico do negócio de aluguel de motocicletas em Salvador, Bahia.

### 🎯 **Objetivos do Sistema**

- **Controle em Tempo Real**: Monitoramento instantâneo da frota com atualizações automáticas
- **Gestão Financeira**: Análise completa de receitas, metas e projeções
- **Análise Preditiva**: Uso de IA para prever tempos ociosos e otimizar operações
- **Controle de Franqueados**: Gestão e análise de performance por franqueado
- **Relatórios Gerenciais**: Dashboards completos para tomada de decisão

### 🏢 **Público-Alvo**

- **Gestores**: Análise estratégica e tomada de decisão
- **Administradores**: Controle operacional completo
- **Franqueados**: Acompanhamento de performance individual
- **Equipe Operacional**: Gestão diária da frota

---

### 🛠️ **Stack Tecnológica**

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 15.3.3 | Framework React com App Router |
| **TypeScript** | 5.x | Tipagem estática e desenvolvimento seguro |
| **Firebase** | 11.8.1 | Backend-as-a-Service (Auth, Firestore, Hosting) |
| **Tailwind CSS** | 3.4.1 | Framework CSS utilitário |
| **Recharts** | 2.15.1 | Visualização de dados e gráficos |
| **React Hook Form** | 7.54.2 | Gerenciamento de formulários |
| **Zod** | 3.24.2 | Validação de dados |
| **shadcn/ui** | Latest | Sistema de componentes UI |
| **Google Genkit** | 1.8.0 | Integração com IA para predições |

---

### 🌟 **Funcionalidades Principais**

#### 🏍️ **Gestão de Motocicletas**
- ✅ CRUD completo de motocicletas
- ✅ Controle de status em tempo real (8 estados diferentes)
- ✅ Cálculo automático de tempo ocioso
- ✅ Geração de QR codes para controle físico
- ✅ Importação/exportação em lote via CSV

#### 💰 **Controle Financeiro**
- ✅ Dashboard financeiro com KPIs em tempo real
- ✅ Análise de receita por franqueado
- ✅ Projeções otimista, realista e pessimista
- ✅ Geração automática de DRE
- ✅ Análise temporal de performance

#### 📊 **Analytics e Relatórios**
- ✅ 18 tipos diferentes de gráficos
- ✅ Análise de distribuição da frota
- ✅ Relatórios de manutenção e relocação
- ✅ Métricas de performance por franqueado
- ✅ Análise de vendas de motocicletas

#### 🤖 **Inteligência Artificial**
- ✅ Predição de tempo ocioso usando Google Gemini
- ✅ Análise contextual para decisões de negócio
- ✅ Otimização de alocação de frota

#### 👥 **Gestão de Usuários**
- ✅ Sistema de autenticação seguro
- ✅ Controle de acesso baseado em roles
- ✅ Perfis de usuário personalizáveis
- ✅ Auditoria de ações

---

### 🎨 **Screenshots das Principais Telas**

> **Nota**: Screenshots serão adicionados após a próxima atualização da documentação

#### Dashboard Principal
`[SCREENSHOT: Visão geral do dashboard com KPIs principais, gráficos de receita mensal e status da frota em tempo real]`

#### Gestão de Motocicletas
`[SCREENSHOT: Lista de motocicletas com filtros, status coloridos e ações de edição/exclusão]`

#### Análise Financeira
`[SCREENSHOT: Gráficos de receita por período, projeções e comparativos por franqueado]`

#### Predições com IA
`[SCREENSHOT: Interface de predição de tempo ocioso com input de contexto e resultados]`

---

### 🚀 **Quickstart**

#### Para Desenvolvedores
```bash
# Clone o repositório
git clone https://github.com/correiafelipe1988/Painel-Master-Salvador.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute em modo desenvolvimento
npm run dev
```

#### Para Usuários Finais
- **Acesso**: https://motosight-dashboard.web.app
- **Login**: Use suas credenciais fornecidas pelo administrador
- **Suporte**: Entre em contato com a equipe de TI

---

### 📖 **Navegação da Documentação**

#### 🚀 **Getting Started**
- [📦 Instalação](./getting-started/installation.md)
- [⚙️ Configuração do Ambiente](./getting-started/environment-setup.md)
- [🎯 Primeira Execução](./getting-started/first-run.md)

#### 🏗️ **Arquitetura**
- [📋 Visão Geral](./architecture/overview.md)
- [🗄️ Design do Banco de Dados](./architecture/database-design.md)
- [🔥 Estrutura Firebase](./architecture/firebase-structure.md)
- [🔒 Modelo de Segurança](./architecture/security-model.md)

#### 🌟 **Funcionalidades**
- [🔐 Sistema de Autenticação](./features/authentication.md)
- [🏍️ Gestão de Motocicletas](./features/motorcycle-management.md)
- [💰 Gestão de Vendas](./features/sales-management.md)
- [📡 Gestão de Rastreadores](./features/tracker-management.md)
- [👥 Papéis de Usuário](./features/user-roles.md)

#### 💻 **Desenvolvimento**
- [📝 Padrões de Código](./development/coding-standards.md)
- [🧩 Estrutura de Componentes](./development/component-structure.md)
- [📡 Endpoints da API](./development/api-endpoints.md)
- [🔄 Gerenciamento de Estado](./development/state-management.md)

#### 🚀 **Deployment**
- [🔨 Processo de Build](./deployment/build-process.md)
- [🔥 Firebase Hosting](./deployment/firebase-hosting.md)
- [⚙️ Pipeline CI/CD](./deployment/ci-cd-pipeline.md)

#### 🔧 **Troubleshooting**
- [❗ Problemas Comuns](./troubleshooting/common-issues.md)
- [🐛 Guia de Debug](./troubleshooting/debugging-guide.md)
- [⚡ Dicas de Performance](./troubleshooting/performance-tips.md)

#### 📡 **API Reference**
- [🔐 API de Autenticação](./api/authentication-api.md)
- [🏍️ API de Motocicletas](./api/motorcycles-api.md)
- [💰 API de Vendas](./api/sales-api.md)
- [👥 API de Usuários](./api/users-api.md)

---

### 🎯 **Métricas e KPIs do Sistema**

#### 📊 **Indicadores Operacionais**
- **Taxa de Ocupação**: Meta de 91%
- **Tempo Médio Ocioso**: Monitoramento em tempo real
- **Status da Frota**: 8 categorias de controle
- **Distribuição por Franqueado**: Análise de performance

#### 💰 **Indicadores Financeiros**
- **Receita Semanal**: Cálculo automático por motocicleta
- **Projeção Mensal**: Três cenários (otimista, realista, pessimista)
- **Performance por Franqueado**: Ranking e comparativos
- **ROI por Motocicleta**: Análise individual de rentabilidade

---

### 🔧 **Configurações Importantes**

#### 🌍 **Ambientes**
- **Desenvolvimento**: `localhost:9002`
- **Produção**: `https://motosight-dashboard.web.app`
- **Staging**: A ser configurado

#### 🔑 **Variáveis de Ambiente Necessárias**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

### 📞 **Contatos e Suporte**

#### 👨‍💻 **Equipe de Desenvolvimento**
- **Desenvolvedor Principal**: Felipe Correia
- **Repositório**: [GitHub](https://github.com/correiafelipe1988/Painel-Master-Salvador)
- **Issues**: [GitHub Issues](https://github.com/correiafelipe1988/Painel-Master-Salvador/issues)

#### 🏢 **Suporte Técnico**
- **Email**: felipe.correia@locagoraba.com.br
- **Telefone**: (71) 981282058
- **Horário**: Segunda a Sexta, 8h às 18h

#### 🔗 **Links Úteis**
- [Firebase Console](https://console.firebase.google.com/project/motosight-dashboard)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Firebase](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

### 📄 **Licença e Termos de Uso**

Este sistema é propriedade da **Felipe Correia** e está protegido por direitos autorais. O uso é restrito aos funcionários e parceiros autorizados da empresa.

### 📅 **Versionamento**

- **Versão Atual**: 1.0.0
- **Data de Criação**: Junho 2025
- **Última Atualização**: Julho 2025
- **Próxima Release**: Agosto 2025

---

### 🔄 **Changelog Recente**

#### v1.0.0 (Junho 2025)
- ✅ Implementação inicial do sistema
- ✅ Integração completa com Firebase
- ✅ Sistema de autenticação
- ✅ Dashboard principal com 18 tipos de gráficos
- ✅ Gestão de motocicletas com tempo ocioso
- ✅ Análise financeira completa
- ✅ Integração com IA para predições
- ✅ Deploy automático no Firebase Hosting

---

### 🏷️ **Tags**

`#dashboard` `#next.js` `#firebase` `#typescript` `#motorcycle-management` `#financial-analytics` `#real-time` `#ai-prediction` `#brazilian-market`

---

**💡 Dica**: Para desenvolvedores iniciantes no projeto, recomendamos começar pela [documentação de instalação](./getting-started/installation.md) seguida pela [visão geral da arquitetura](./architecture/overview.md).