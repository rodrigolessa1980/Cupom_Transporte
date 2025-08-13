import { z } from "zod"
import { validateCNPJ, validateCPF } from "@/lib/utils"

// Schema para validar CPF
const cpfSchema = z.string()
  .min(1, "CPF é obrigatório")
  .refine((value) => validateCPF(value), {
    message: "CPF inválido"
  })

// Schema para validar celular
const celularSchema = z.string()
  .min(10, "Celular deve ter pelo menos 10 dígitos")
  .max(15, "Celular não pode ter mais de 15 dígitos")
  .regex(/^[\d\(\)\s\+\-\.]+$/, {
    message: "Celular deve conter apenas números e símbolos de formatação"
  })

// Schema para dados do estabelecimento
const dadosEstabelecimentoSchema = z.object({
  razaoSocial: z.string()
    .min(1, "Razão Social é obrigatória")
    .max(200, "Razão Social não pode ter mais de 200 caracteres"),
  
  endereco: z.string()
    .min(1, "Endereço é obrigatório")
    .max(300, "Endereço não pode ter mais de 300 caracteres"),
  
  cidade: z.string()
    .min(1, "Cidade é obrigatória")
    .max(100, "Cidade não pode ter mais de 100 caracteres"),
  
  telefone: z.string()
    .min(1, "Telefone é obrigatório")
    .max(20, "Telefone não pode ter mais de 20 caracteres"),
  
  cnpj: z.string()
    .min(1, "CNPJ é obrigatório")
    .refine((value) => validateCNPJ(value), {
      message: "CNPJ inválido"
    }),
  
  ie: z.string()
    .min(1, "Inscrição Estadual é obrigatória")
    .max(20, "Inscrição Estadual não pode ter mais de 20 caracteres"),
  
  im: z.string()
    .min(1, "Inscrição Municipal é obrigatória")
    .max(20, "Inscrição Municipal não pode ter mais de 20 caracteres"),
  
  nomeFantasia: z.string()
    .min(1, "Nome Fantasia é obrigatório")
    .max(200, "Nome Fantasia não pode ter mais de 200 caracteres"),
})

// Schema para informações da transação
const informacoesTransacaoSchema = z.object({
  data: z.date({
    required_error: "Data é obrigatória",
  }),
  
  hora: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
      message: "Hora deve estar no formato HH:mm:ss"
    }),
  
  coo: z.string()
    .min(1, "COO é obrigatório")
    .max(10, "COO não pode ter mais de 10 caracteres"),
  
  ecf: z.string()
    .min(1, "ECF é obrigatório")
    .max(10, "ECF não pode ter mais de 10 caracteres"),
  
  numeroEcf: z.string()
    .min(1, "Número do ECF é obrigatório")
    .max(10, "Número do ECF não pode ter mais de 10 caracteres"),
  
  numeroCupom: z.string()
    .min(1, "Número do cupom é obrigatório")
    .max(20, "Número do cupom não pode ter mais de 20 caracteres"),
})

// Schema para dados do consumidor
const dadosConsumidorSchema = z.object({
  cpf: cpfSchema.optional(),
  nome: z.string()
    .max(200, "Nome não pode ter mais de 200 caracteres")
    .optional(),
}).optional()

// Schema para dados do motorista
const dadosMotoristaSchema = z.object({
  celular: celularSchema,
  nome: z.string()
    .max(200, "Nome não pode ter mais de 200 caracteres")
    .optional(),
})

// Schema para item da compra
const itemCompraSchema = z.object({
  codigo: z.string()
    .min(1, "Código do item é obrigatório")
    .max(50, "Código não pode ter mais de 50 caracteres"),
  
  descricao: z.string()
    .min(1, "Descrição do item é obrigatória")
    .max(200, "Descrição não pode ter mais de 200 caracteres"),
  
  quantidade: z.number()
    .min(0.01, "Quantidade deve ser maior que 0"),
  
  unidade: z.string()
    .min(1, "Unidade é obrigatória")
    .max(10, "Unidade não pode ter mais de 10 caracteres"),
  
  valorUnitario: z.number()
    .min(0.01, "Valor unitário deve ser maior que R$ 0,00"),
  
  valorTotal: z.number()
    .min(0.01, "Valor total do item deve ser maior que R$ 0,00"),

  permiteReembolso: z.boolean().optional(),
})

// Schema para totais e pagamento
const totaisPagamentoSchema = z.object({
  valorTotal: z.number({
    required_error: "Valor total é obrigatório",
  }).min(0.01, "Valor total deve ser maior que R$ 0,00"),
  
  formaPagamento: z.string()
    .min(1, "Forma de pagamento é obrigatória")
    .max(50, "Forma de pagamento não pode ter mais de 50 caracteres"),
  
  troco: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
})

// Schema principal do cupom fiscal
export const cupomFiscalSchema = z.object({
  dadosEstabelecimento: dadosEstabelecimentoSchema,
  
  informacoesTransacao: informacoesTransacaoSchema,
  
  dadosConsumidor: dadosConsumidorSchema,
  
  dadosMotorista: dadosMotoristaSchema,
  
  itens: z.array(itemCompraSchema)
    .min(1, "Pelo menos um item é obrigatório"),
  
  totais: totaisPagamentoSchema,
  
  observacoes: z.string()
    .max(1000, "Observações não podem ter mais de 1000 caracteres")
    .optional(),
}).refine((data) => {
  // Validar se o valor total bate com a soma dos itens
  const somaItens = data.itens.reduce((total, item) => total + item.valorTotal, 0)
  const diferenca = Math.abs(somaItens - data.totais.valorTotal)
  return diferenca < 0.01 // Tolerância para diferenças de centavos por arredondamento
}, {
  message: "O valor total deve ser igual à soma dos itens",
  path: ["totais", "valorTotal"]
}) 