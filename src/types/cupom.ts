// Dados do Estabelecimento
export interface DadosEstabelecimento {
  razaoSocial: string
  endereco: string
  cidade: string
  telefone: string
  cnpj: string
  ie: string // Inscrição Estadual
  im: string // Inscrição Municipal
  nomeFantasia: string
}

// Informações da Transação
export interface InformacoesTransacao {
  data: Date
  hora: string // Formato HH:mm:ss
  coo: string // Código de Operação do Cupom
  ecf: string // Equipamento de Cupom Fiscal
  numeroEcf: string
  numeroCupom: string
}

// Dados do Consumidor
export interface DadosConsumidor {
  cpf?: string
  nome?: string
}

// Dados do Motorista
export interface DadosMotorista {
  celular: string
  nome?: string
}

// Item da Compra
export interface ItemCompra {
  codigo: string
  descricao: string
  quantidade: number
  unidade: string
  valorUnitario: number
  valorTotal: number
  permiteReembolso?: boolean // Indica se este item pode ser reembolsado
}

// Totais e Pagamento
export interface TotaisPagamento {
  valorTotal: number
  formaPagamento: string
  troco?: number
  desconto?: number
}

// Status do Cupom Fiscal
export type StatusCupom = 'PAGO' | 'Pendente' | 'Cancelado'

// Interface para Empresa
export interface Empresa {
  id: number
  nome: string
  cnpj: string
  telefone: string
  criadoEm: Date
  atualizadoEm: Date
}

// Interface principal do Cupom Fiscal
export interface CupomFiscal {
  id: string
  dadosEstabelecimento: DadosEstabelecimento
  informacoesTransacao: InformacoesTransacao
  dadosConsumidor?: DadosConsumidor
  dadosMotorista: DadosMotorista
  itens: ItemCompra[]
  totais: TotaisPagamento
  observacoes?: string
  status: StatusCupom
  criadoEm: Date
  atualizadoEm: Date
}

// Interface para input/criação de cupom
export interface CupomFiscalInput {
  dadosEstabelecimento: DadosEstabelecimento
  informacoesTransacao: Omit<InformacoesTransacao, 'data'> & { data: Date }
  dadosConsumidor?: DadosConsumidor
  dadosMotorista: DadosMotorista
  itens: ItemCompra[]
  totais: TotaisPagamento
  observacoes?: string
  status?: StatusCupom
  // ID do usuário dono do cupom (opcional)
  dono_cupom_id?: number | string
}

// Interface para exibição resumida
export interface CupomFiscalResumo {
  id: string
  numeroCupom: string
  razaoSocial: string
  dataEmissao: Date
  valorTotal: number
}

// Interface para configuração de telefone x motorista
export interface TelefoneMotoristaConfig {
  telefone?: string | null
  motorista: string
  id: string
  empresa_id?: number | null
  criadoEm: Date
  atualizadoEm: Date
}
// (file ends)