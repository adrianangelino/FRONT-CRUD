# EventosPro - Admin Panel

Sistema administrativo para gerenciamento de eventos, desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento para aplicações React
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Biblioteca de ícones

## 📁 Estrutura do Projeto

```
front-crud/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatCard.tsx
│   ├── config/          # Configurações
│   │   └── api.ts       # Configuração da API
│   ├── hooks/           # Hooks customizados
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   ├── useEvents.ts
│   │   ├── useTickets.ts
│   │   └── useUsers.ts
│   ├── layouts/         # Layouts da aplicação
│   │   └── AdminLayout.tsx
│   ├── pages/           # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Eventos.tsx
│   │   ├── Ingressos.tsx
│   │   └── Usuarios.tsx
│   ├── services/        # Serviços de API
│   │   ├── api.ts       # Cliente HTTP base
│   │   ├── auth.ts      # Serviço de autenticação
│   │   ├── events.ts    # Serviço de eventos
│   │   ├── tickets.ts   # Serviço de ingressos
│   │   └── users.ts     # Serviço de usuários
│   ├── types/           # Definições de tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Funcionalidades

### Dashboard
- Visão geral com estatísticas do sistema
- Cards de métricas (Total de Eventos, Eventos Ativos, Ingressos Vendidos, Usuários)
- Receita total estimada
- Seções de ingressos recentes e próximos eventos
- Ações rápidas para navegação

### Eventos
- Listagem de todos os eventos
- Busca por nome ou localização
- Estatísticas resumidas
- Tabela com informações detalhadas (data, local, preço, ingressos, status)
- Ações de edição e exclusão

### Ingressos
- Gerenciamento de ingressos vendidos
- Busca por código, evento ou email
- Tabela com informações do comprador e status

### Usuários
- Gerenciamento de usuários do sistema
- Busca por nome ou email
- Visualização de função (Admin/Usuário)
- Ação para remover privilégios de admin

## 📱 Responsividade

O projeto é totalmente responsivo, com:
- Sidebar colapsável em dispositivos móveis
- Grid adaptativo para cards e tabelas
- Menu hambúrguer para navegação mobile
- Layout flexível que se adapta a diferentes tamanhos de tela

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd front-crud
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a URL da API:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione a variável: `VITE_API_BASE_URL=http://localhost:3000`
   - (Substitua pela URL do seu backend)

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse no navegador:
```
http://localhost:5173
```

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 🎯 Boas Práticas Implementadas

- ✅ Componentes reutilizáveis e modulares
- ✅ TypeScript para type safety
- ✅ Separação de responsabilidades (components, pages, layouts)
- ✅ Código limpo e bem organizado
- ✅ Responsividade mobile-first
- ✅ Acessibilidade (aria-labels, semântica HTML)
- ✅ Performance otimizada com React hooks
- ✅ Roteamento estruturado

## 🔌 Integração com Backend

O projeto está configurado para se comunicar com o backend através das seguintes rotas:

### Rotas de Eventos
- `POST /create-events` - Criar novo evento
- `GET /getEventById/:id` - Buscar evento por ID
- `DELETE /softDeletedEvent/:id` - Deletar evento (soft delete)

### Rotas de Ingressos
- `POST /create-ticket` - Criar novo ingresso
- `POST /check-ticket` - Verificar ingresso
- `GET /getTicketById/:id` - Buscar ingresso por ID
- `DELETE /softDeleted/:id` - Deletar ingresso (soft delete)

### Rotas de Usuários
- `POST /login` - Autenticação
- `POST /criar-usuario` - Criar novo usuário
- `GET /buscar-usuario` - Buscar usuário(s)
- `DELETE /ExcluirUsuario/:id` - Deletar usuário

### Estrutura de Serviços

O projeto utiliza uma arquitetura em camadas:
- **Services** (`src/services/`) - Cliente HTTP e serviços de API
- **Hooks** (`src/hooks/`) - Hooks customizados para gerenciar estado
- **Pages** (`src/pages/`) - Componentes de página que consomem os hooks

### Autenticação

O token de autenticação é armazenado no `localStorage` e enviado automaticamente nas requisições através do header `Authorization: Bearer <token>`.

**Tratamento de Erros de Autenticação:**
- Quando uma requisição retorna `401` (não autorizado), o token é automaticamente removido do localStorage
- Isso garante que tokens inválidos ou expirados sejam limpos automaticamente

### Configuração

Para mais detalhes sobre configuração da API, variáveis de ambiente e troubleshooting, consulte o arquivo [CONFIGURACAO.md](./CONFIGURACAO.md).

## 🔄 Próximos Passos

- [x] Integração com API backend
- [ ] Autenticação e autorização completa
- [ ] Formulários de criação/edição
- [ ] Paginação nas tabelas
- [ ] Filtros avançados
- [ ] Gráficos e visualizações
- [ ] Notificações e feedbacks
- [ ] Testes unitários e de integração
- [ ] Adicionar rota GET /events e GET /tickets no backend

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

