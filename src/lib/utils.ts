import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  )
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  )
}

export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  
  if (cleaned.length !== 14) {
    return false
  }

  if (/^(\d)\1+$/.test(cleaned)) {
    return false
  }

  let sum = 0
  let weight = 2
  
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  if (parseInt(cleaned.charAt(12)) !== digit) {
    return false
  }
  
  sum = 0
  weight = 2
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  return parseInt(cleaned.charAt(13)) === digit
} 

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) {
    return false
  }

  if (/^(\d)\1+$/.test(cleaned)) {
    return false
  }

  let sum = 0
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  if (parseInt(cleaned.charAt(9)) !== digit) {
    return false
  }
  
  sum = 0
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  
  return parseInt(cleaned.charAt(10)) === digit
} 

export function formatTime(time: string): string {
  return time
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

import type { CupomFiscal } from '@/types/cupom'

export function createExampleCupom(): CupomFiscal {
  const now = new Date()
  
  return {
    id: generateId(),
    dadosEstabelecimento: {
      razaoSocial: "RAZAO SOCIAL",
      endereco: "Rua Shishima Hifumi - Urbanova",
      cidade: "Minha Cidade",
      telefone: "Meu Telefone",
      cnpj: "45.170.289/0001-25",
      ie: "688023460111",
      im: "363372",
      nomeFantasia: "Daruma Developer Community"
    },
    informacoesTransacao: {
      data: new Date("2014-10-11"),
      hora: "09:36:17",
      coo: "015601",
      ecf: "060467",
      numeroEcf: "001",
      numeroCupom: "016367"
    },
    dadosMotorista: {
      celular: "(11) 99999-0000",
      nome: "Motorista Exemplo"
    },
    dadosConsumidor: {
      cpf: "064.032.048-00"
    },
    itens: [
      {
        codigo: "001 001234",
        descricao: "Coca-Cola",
        quantidade: 1,
        unidade: "UND",
        valorUnitario: 5.50,
        valorTotal: 5.50,
        permiteReembolso: true
      }
    ],
    totais: {
      valorTotal: 5.50,
      formaPagamento: "Dinheiro"
    },
    observacoes: "",
    status: "Pendente",
    criadoEm: now,
    atualizadoEm: now
  }
} 

export function calculateReembolsoValue(cupom: CupomFiscal): number {
  return cupom.itens
    .filter(item => item.permiteReembolso === true)
    .reduce((total, item) => total + item.valorTotal, 0)
} 

// Função para detectar cupons duplicados
export function detectarCuponsDuplicados(cupons: CupomFiscal[]): Map<string, CupomFiscal[]> {
  const duplicatas = new Map<string, CupomFiscal[]>()
  
  cupons.forEach(cupom => {
    const chave = `${cupom.dadosEstabelecimento.cnpj}-${cupom.informacoesTransacao.numeroCupom}`
    
    if (!duplicatas.has(chave)) {
      duplicatas.set(chave, [])
    }
    
    duplicatas.get(chave)!.push(cupom)
  })
  
  // Remover entradas que não são duplicatas (apenas 1 cupom)
  for (const [chave, cuponsList] of duplicatas.entries()) {
    if (cuponsList.length <= 1) {
      duplicatas.delete(chave)
    }
  }
  
  return duplicatas
}

// Função para verificar se um cupom é duplicado
export function verificarCupomDuplicado(cupom: CupomFiscal, todosCupons: CupomFiscal[]): {
  isDuplicado: boolean
  isPrimeiro: boolean
  totalDuplicatas: number
} {
  const chave = `${cupom.dadosEstabelecimento.cnpj}-${cupom.informacoesTransacao.numeroCupom}`
  const cuponsComMesmaChave = todosCupons.filter(c => 
    `${c.dadosEstabelecimento.cnpj}-${c.informacoesTransacao.numeroCupom}` === chave
  )
  
  if (cuponsComMesmaChave.length <= 1) {
    return {
      isDuplicado: false,
      isPrimeiro: false,
      totalDuplicatas: 0
    }
  }
  
  // Ordenar por data de criação para determinar qual é o primeiro
  const cuponsOrdenados = cuponsComMesmaChave.sort((a, b) => 
    new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
  )
  
  const isPrimeiro = cuponsOrdenados[0].id === cupom.id
  
  return {
    isDuplicado: true,
    isPrimeiro,
    totalDuplicatas: cuponsComMesmaChave.length
  }
} 