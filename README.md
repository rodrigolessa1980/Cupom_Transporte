# Sistema de Cupons de Transporte

Sistema web para gerenciamento de cupons fiscais de transporte, desenvolvido em React com TypeScript e integração com backend n8n.

## 🚀 Tecnologias Utilizadas

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **Lucide React** para ícones
- **Axios** para requisições HTTP
- **Radix UI** para componentes acessíveis

## 📋 Funcionalidades

### 🔐 Sistema de Autenticação
- Login com usuário e senha
- Controle de sessão com tokens
- Diferentes níveis de acesso (Administrador e Operador)
- Validação de credenciais via API

### 👥 Gerenciamento de Usuários
- Cadastro, edição e exclusão de usuários
- Controle de status (Ativo/Inativo)
- Diferentes tipos de usuário (Admin/Operador)
- Integração completa com backend n8n

### 🏢 Gerenciamento de Empresas (Transportadoras)
- Cadastro de empresas com CNPJ e telefone
- Edição e exclusão de empresas
- Integração com API n8n para persistência
- Remoção do vínculo com usuários (conforme solicitado)

### 📞 Configuração de Vínculos Telefone/Motorista
- Associação de números de telefone com motoristas
- Gerenciamento de vínculos para identificação automática
- Armazenamento local para configurações

### 🚫 Itens Não Reembolsáveis
- Cadastro de produtos e grupos proibidos
- Verificação automática de itens não reembolsáveis
- Integração com API para persistência

### 🧾 Gerenciamento de Cupons
- Visualização de cupons fiscais
- Filtros por data, status e estabelecimento
- Detalhes completos dos cupons
- Controle de status (Pago, Pendente, Cancelado)

## 🔧 Integração com Backend n8n

### 📡 Endpoints da API

#### Empresas (Transportadoras)
- **Base URL**: `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/empresa`
- **Métodos**: GET, POST, PUT, DELETE
- **Campos**: `nome`, `cnpj`, `telefone`
- **Resposta**: JSON com `success` e `message`

#### Usuários
- **Base URL**: `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/usuario`
- **Métodos**: GET, POST, PUT, DELETE
- **Campos**: `user`, `nome`, `email`, `senha`
- **Status**: 1=Admin Ativo, 2=Operador Ativo, 3=Admin Inativo, 4=Operador Inativo

#### Cupons
- **Base URL**: `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom`
- **Métodos**: GET, PUT, POST, DELETE (DELETE para `/excluir`)
- **Campos**: `n_cupom`, `estabelecimento`, `cnpj`, `valor_total`, `valor_reembolso`, `form_pgto`, `data_registro`, `transportadora`, `telefone`, `status`, `dono_cupom_id`

#### Itens Proibidos
- **Base URL**: `https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/item_proibido`
- **Métodos**: GET, POST, PUT, DELETE
- **Campos**: `produto`, `grupo` (apenas um deve ser preenchido)

#### Produtos
- **Base URL**: `https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/produto`
- **Métodos**: GET, POST, PUT, DELETE
- **Campos**: `produto`, `qtd`, `valor_uni`, `reembolso` (0 ou 1), `cupom_id`, `item_proibido_id`

### 🔄 Fluxo de Dados

#### Processamento de Cupons via WhatsApp
1. **Recebimento**: Mensagem com imagem do cupom via WhatsApp
2. **Processamento**: API GPT analisa a imagem com OCR
3. **Extração**: Dados extraídos conforme prompt estruturado
4. **Validação**: Verificação de itens não reembolsáveis
5. **Persistência**: Inserção no banco de dados via n8n

#### Prompt GPT para Análise
```json
{
  "cupom": {
    "n_cupom": "00001",
    "estabelecimento": "WPX Locadora",
    "cnpj": "22.831.673/0001-26",
    "valor_total": 100,
    "valor_reebolso": 100,
    "form_pgto": "pix",
    "data_registro": "2025-07-30",
    "telefone": "(11) 99999-9999"
  },
  "produtos": [
    {
      "produto": "bolo",
      "qtd": 1.5,
      "valor_unitario": 100.60,
      "reembolso": 100.60,
      "produto_reembolsavel": true
    }
  ]
}
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/            # Componentes base (botões, inputs, etc.)
│   ├── users-management.tsx
│   ├── configuracoes-modal.tsx
│   └── ...
├── contexts/           # Contextos React
│   ├── auth-context.tsx
│   ├── users-context.tsx
│   └── configuracoes-context.tsx
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
│   ├── api.ts         # Integração com API n8n
│   └── utils.ts       # Funções utilitárias
├── types/              # Definições de tipos TypeScript
└── App.tsx            # Componente principal
```

## 🚀 Instalação e Execução

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Acessar a aplicação**:
   Abra o navegador em `http://localhost:5173`

## 🔧 Configurações

### Variáveis de Ambiente
- **API Base URL**: Configurada em `src/lib/api.ts`
- **Timeout**: 10 segundos para requisições
- **Headers**: Content-Type e Accept configurados para JSON

### Banco de Dados
- **Empresas**: Tabela `empresa` com campos `id`, `nome`, `cnpj`, `telefone`
- **Usuários**: Tabela `usuario` com campos `id`, `user`, `nome`, `email`, `senha`, `status`
- **Cupons**: Tabela `cupom` com campos completos conforme especificação

## 📊 Status dos Cupons

O sistema utiliza cores específicas para os status dos cupons:

- 🟢 **PAGO**: Verde (#16a34a) - Cupons que foram pagos
- 🟡 **Pendente**: Amarelo (#ca8a04) - Cupons aguardando pagamento
- 🔴 **Cancelado**: Vermelho (#dc2626) - Cupons cancelados

## 🔄 Principais Modificações Realizadas

### 1. Integração com API n8n
- **Empresas**: Migração completa para API REST
- **Usuários**: Integração com sistema de status numérico
- **Cupons**: Manutenção da integração existente

### 2. Remoção de Vínculos
- **Usuário-Empresa**: Removido conforme solicitado
- **Telefone-Motorista-Empresa**: Simplificado para apenas telefone-motorista

### 3. Novos Campos
- **Email**: Adicionado ao sistema de usuários
- **Status Numérico**: Mapeamento para roles e estados de usuário

### 4. Melhorias na API
- **Tratamento de Erros**: Melhorado com mensagens específicas
- **Validação**: Adicionada validação de dados
- **Timeout**: Configurado para evitar travamentos

## 🧪 Teste da API

Um arquivo `test-api.html` foi criado para testar a conectividade com a API. Abra este arquivo no navegador para verificar se a API está acessível.

## 🔒 Segurança

- **Autenticação**: Sistema de login com validação de credenciais
- **Autorização**: Controle de acesso baseado em roles
- **Tokens**: Validação de sessão com tokens
- **Validação**: Validação de dados em formulários

## 📝 Desenvolvimento

### Adicionando Novos Campos
1. Atualizar interfaces em `src/types/`
2. Modificar componentes relacionados
3. Atualizar contextos se necessário
4. Testar integração com API

### Debugging
- Console logs configurados para requisições API
- Tratamento de erros com mensagens específicas
- Fallback para dados locais em caso de erro

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.