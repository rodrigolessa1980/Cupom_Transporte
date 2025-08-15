import axios from 'axios'
import { CupomFiscal, CupomFiscalInput } from '@/types/cupom'

// Interface para itens proibidos
export interface ItemProibido {
  id: number
  produto?: string
  grupo?: string
}

export interface ItemProibidoInput {
  produto?: string
  grupo?: string
}

// Interface para Produto (API)
export interface ApiProduto {
  id: number
  produto?: string
  qtd?: number
  valor_uni: string
  reembolso?: number // 0 ou 1
  cupom_id: number
  item_proibido_id: number
}

export interface ProdutoInput {
  produto?: string
  qtd?: number
  valor_uni: string
  reembolso?: boolean
  cupom_id: number
  item_proibido_id: number
}

// Interface para autenticação
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: {
    id: string
    username: string
    nome: string
    role: 'admin' | 'user'
  }
  token?: string
  message?: string
}

// Interface para empresas (transportadoras)
export interface Empresa {
  id: number
  nome: string
  cnpj: string
  telefone: string
}

export interface EmpresaInput {
  nome: string
  cnpj: string
  telefone: string
}

// Interface para Motorista
export interface Motorista {
  id: number
  nome: string
  telefone?: string | null
  empresa_id?: number | null
}

export interface MotoristaInput {
  nome: string
  telefone?: string | null
  empresa_id?: number | null
}

// Interface para gerenciamento de usuários
export interface SystemUser {
  id: number
  user: string // username
  nome: string
  email: string
  senha: string
  status: number // 1=Admin Ativo, 2=Operador Ativo, 3=Admin Inativo, 4=Operador Inativo
}

export interface SystemUserInput {
  user: string
  nome: string
  email: string
  senha: string
  status: number
}

// Mapeamento de status para roles e estados
export const USER_STATUS_MAP = {
  // Admin Ativo
  1: { role: 'admin' as const, ativo: true },
  // Operador Ativo  
  2: { role: 'user' as const, ativo: true },
  // Admin Inativo
  3: { role: 'admin' as const, ativo: false },
  // Operador Inativo
  4: { role: 'user' as const, ativo: false }
}

export const getStatusFromRoleAndActive = (role: 'admin' | 'user', ativo: boolean): number => {
  if (role === 'admin' && ativo) return 1
  if (role === 'user' && ativo) return 2
  if (role === 'admin' && !ativo) return 3
  if (role === 'user' && !ativo) return 4
  return 2 // Default: Operador Ativo
}

// Interface para os dados da API
interface ApiCupom {
  id: number
  n_cupom: string
  estabelecimento: string
  cnpj: string
  valor_total: string
  valor_reembolso: string
  form_pgto: string
  data_registro: string
  transportadora: string | null
  telefone: string | null
  status?: string // Campo de status opcional da API
}

// Função para converter dados da API para o formato da aplicação
const convertApiCupomToCupomFiscal = (apiCupom: ApiCupom): CupomFiscal => {
  const dataRegistro = new Date(apiCupom.data_registro)
  
  // Determinar o status baseado nos dados da API
  let status: 'PAGO' | 'Pendente' | 'Cancelado' = 'Pendente'
  
  if (apiCupom.status) {
    // Se a API retorna um status, usar ele
    const apiStatus = apiCupom.status.toUpperCase()
    if (apiStatus === 'PAGO' || apiStatus === 'PENDENTE' || apiStatus === 'CANCELADO') {
      status = apiStatus === 'PAGO' ? 'PAGO' : 
               apiStatus === 'PENDENTE' ? 'Pendente' : 'Cancelado'
    }
  } else {
    // Lógica alternativa baseada em outros campos da API
    // Por exemplo, se valor_reembolso > 0, pode indicar que foi pago
    if (parseFloat(apiCupom.valor_reembolso) > 0) {
      status = 'PAGO'
    }
    // Você pode adicionar mais lógica aqui baseada em outros campos
  }
  
  return {
    id: apiCupom.id.toString(),
    dadosEstabelecimento: {
      razaoSocial: apiCupom.estabelecimento,
      nomeFantasia: apiCupom.estabelecimento,
      cnpj: apiCupom.cnpj,
      ie: '',
      im: '',
      endereco: '',
      cidade: '',
      telefone: ''
    },
    informacoesTransacao: {
      numeroCupom: apiCupom.n_cupom,
      data: dataRegistro,
      hora: dataRegistro.toTimeString().split(' ')[0],
      coo: '',
      ecf: '',
      numeroEcf: ''
    },
    dadosMotorista: {
      celular: apiCupom.telefone || '',
      nome: apiCupom.transportadora || ''
    },
    itens: [
      {
        codigo: '001',
        descricao: 'Item do cupom',
        quantidade: 1,
        unidade: 'UN',
        valorUnitario: parseFloat(apiCupom.valor_total),
        valorTotal: parseFloat(apiCupom.valor_total),
        permiteReembolso: parseFloat(apiCupom.valor_reembolso) > 0
      }
    ],
    totais: {
      valorTotal: parseFloat(apiCupom.valor_total),
      formaPagamento: apiCupom.form_pgto,
      troco: 0,
      desconto: 0
    },
    observacoes: '',
    status: status, // Usar o status determinado pela lógica acima
    criadoEm: dataRegistro,
    atualizadoEm: dataRegistro,
  }
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper: map various shapes of cupom payload to the DB-shaped flat object
const mapToDbCupomPayload = (data: any, id?: string) => {
  // Support both flattened shape and the app's nested CupomFiscalInput
  const n_cupom = data.n_cupom || data.informacoesTransacao?.numeroCupom || ''
  const estabelecimento = data.estabelecimento || data.dadosEstabelecimento?.razaoSocial || data.dadosEstabelecimento?.nomeFantasia || ''
  const cnpj = data.cnpj || data.dadosEstabelecimento?.cnpj || ''
  const valor_total = (data.valor_total ?? data.totais?.valorTotal ?? 0).toString()
  const valor_reembolso = (data.valor_reembolso ?? data.totais?.valorReembolso ?? 0).toString()
  const form_pgto = data.form_pgto || data.totais?.formaPagamento || ''
  const data_registro_raw = data.data_registro || data.informacoesTransacao?.data || data.informacoesTransacao?.data_registro || new Date()
  const data_registro = (data_registro_raw instanceof Date) ? data_registro_raw.toISOString().slice(0, 19).replace('T', ' ') : (new Date(data_registro_raw)).toISOString().slice(0, 19).replace('T', ' ')
  // Garantir que transportadora coincida com os valores do ENUM do banco
  // transportadora pode ser o id da empresa (number) vindo do formulário
  const rawTransportadora = data.transportadora ?? data.dadosMotorista?.nome ?? null
  let transportadora: string | null = null
  let empresa_id: number | null = null
  if (rawTransportadora !== null && rawTransportadora !== undefined) {
    // se for numérico, assume que é um company id
    const maybeNum = Number(rawTransportadora)
    if (!isNaN(maybeNum) && maybeNum > 0) {
      empresa_id = maybeNum
    } else {
      // caso contrário, tratar como nome/enum -- manter como string se válido
      const candidate = String(rawTransportadora).trim()
      transportadora = candidate || null
    }
  }

  // Normalizar telefone e valores numéricos
  const telefoneRaw = (data.telefone ?? data.dadosMotorista?.celular ?? null)
  const telefone = telefoneRaw !== null && telefoneRaw !== undefined ? Number(String(telefoneRaw).replace(/\D/g, '')) : null
  const status = data.status || null
  // aceitar dono_cupom_id (antigo) ou cliente_id no payload
  const dono_cupom_id = data.dono_cupom_id !== undefined ? Number(data.dono_cupom_id) : (data.cliente_id !== undefined ? Number(data.cliente_id) : (data.donoId || undefined))

  const payload: any = {
    n_cupom,
    estabelecimento,
    cnpj,
    // converter valores para number quando aplicável
    valor_total: Number(valor_total) || 0,
    valor_reembolso: Number(valor_reembolso) || 0,
    form_pgto,
    data_registro,
    // preferir enviar empresa_id quando disponível
    transportadora: empresa_id ? null : transportadora,
    empresa_id: empresa_id,
    telefone,
    status,
  cliente_id: dono_cupom_id
  }

  if (id) payload.id = id
  return payload
}

export const cupomApi = {
  // ===== FUNÇÕES PARA EMPRESAS (TRANSPORTADORAS) =====
  async getAllEmpresas(): Promise<Empresa[]> {
    try {
      console.log('Fazendo requisição para buscar empresas...')
      const response = await axios.get<Empresa[]>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/empresa', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      console.log('Empresas recebidas:', response.data)
      return response.data || []
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      throw new Error('Não foi possível carregar as empresas')
    }
  },

  async createEmpresa(empresa: EmpresaInput): Promise<Empresa> {
    try {
      console.log('Criando empresa:', empresa)
      const response = await axios.post<{ success: boolean, message: string, data?: Empresa }>(
        'https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/empresa',
        {
          nome: empresa.nome,
          cnpj: empresa.cnpj,
          telefone: empresa.telefone
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao criar empresa')
      }

      console.log('Empresa criada com sucesso:', response.data)

      // Se a API retornar os dados da empresa criada, usar eles
      if (response.data.data) {
        return response.data.data
      }

      // Caso contrário, buscar a empresa recém-criada
      const empresas = await this.getAllEmpresas()
      const novaEmpresa = empresas.find(e =>
        e.nome === empresa.nome && e.cnpj === empresa.cnpj
      )

      if (!novaEmpresa) {
        throw new Error('Empresa criada mas não foi possível recuperar os dados')
      }

      return novaEmpresa
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      throw new Error('Não foi possível criar a empresa')
    }
  },

  async updateEmpresa(id: number, empresa: EmpresaInput): Promise<Empresa> {
    try {
      console.log('Atualizando empresa:', id, empresa)
      const response = await axios.put<{ success: boolean, message: string }>(
        `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/empresa`,
        {
          id: id,
          nome: empresa.nome,
          cnpj: empresa.cnpj,
          telefone: empresa.telefone
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao atualizar empresa')
      }

      // Buscar a empresa atualizada
      const empresas = await this.getAllEmpresas()
      const empresaAtualizada = empresas.find(e => e.id === id)

      if (!empresaAtualizada) {
        throw new Error('Empresa não encontrada após atualização')
      }

      return empresaAtualizada
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      throw new Error('Não foi possível atualizar a empresa')
    }
  },

  async deleteEmpresa(id: number): Promise<void> {
    try {
      console.log('Excluindo empresa:', id)
      const response = await axios.delete<{ success: boolean, message: string }>(
        `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/empresa`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: { id: id },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir empresa')
      }

      console.log('Empresa excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      throw new Error('Não foi possível excluir a empresa')
    }
  },

  // ===== FUNÇÕES PARA MOTORISTAS (tabela via webhook) =====
  async getAllMotoristas(): Promise<Motorista[]> {
    try {
    const response = await axios.get<Motorista[]>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/motorista', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      return response.data || []
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error)
      throw new Error('Não foi possível carregar os motoristas')
    }
  },

  async createMotorista(motorista: MotoristaInput): Promise<Motorista> {
    try {
      const response = await axios.post<{ success: boolean, message: string, data?: Motorista }>(
        'https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/motorista',
        {
          nome: motorista.nome,
          telefone: motorista.telefone || null,
          empresa_id: motorista.empresa_id ?? null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao criar motorista')
      }

      if (response.data.data) return response.data.data

      // Caso a API não retorne o objeto, buscar novamente
      const motoristas = await this.getAllMotoristas()
      const novo = motoristas.find(m => m.nome === motorista.nome && (motorista.telefone ? m.telefone === motorista.telefone : true))
      if (!novo) throw new Error('Motorista criado mas não foi possível recuperar os dados')
      return novo
    } catch (error) {
      console.error('Erro ao criar motorista:', error)
      throw new Error('Não foi possível criar o motorista')
    }
  },

  async updateMotorista(id: number, motoristaData: Partial<MotoristaInput>): Promise<Motorista> {
    try {
      const response = await axios.put<{ success: boolean, message: string, data?: Motorista }>(
        `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/motorista`,
        {
          id,
          nome: motoristaData.nome,
          telefone: motoristaData.telefone ?? null,
          empresa_id: motoristaData.empresa_id ?? null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao atualizar motorista')
      }

      if (response.data.data) return response.data.data

      // Buscar e retornar motorista atualizado
      const motoristas = await this.getAllMotoristas()
      const atualizado = motoristas.find(m => m.id === id)
      if (!atualizado) throw new Error('Motorista não encontrado após atualização')
      return atualizado
    } catch (error) {
      console.error('Erro ao atualizar motorista:', error)
      throw new Error('Não foi possível atualizar o motorista')
    }
  },

  async deleteMotorista(id: number): Promise<void> {
    try {
      const response = await axios.delete<{ success: boolean, message: string }>(
        `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/motorista`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: { id: id },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir motorista')
      }

      console.log('Motorista excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir motorista:', error)
      throw new Error('Não foi possível excluir o motorista')
    }
  },

  // ===== FUNÇÕES PARA USUÁRIOS =====
  async getAllUsers(): Promise<SystemUser[]> {
    try {
      console.log('Fazendo requisição para buscar usuários...')
      const response = await axios.get<SystemUser[] | { data: SystemUser[] }>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/usuario', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      console.log('Usuários recebidos:', response.data)
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('Resposta inesperada da API de usuários, retornando array vazio:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      throw new Error('Não foi possível carregar os usuários')
    }
  },

  // Buscar clientes (para dono do cupom)
  async getAllClientes(): Promise<{ id: number, nome: string }[]> {
    try {
      console.log('Fazendo requisição para buscar clientes...')
      const response = await axios.get<any>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cliente', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      const data = response.data
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.data)) return data.data
      console.warn('Resposta inesperada da API de clientes, retornando vazio:', data)
      return []
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      throw new Error('Não foi possível carregar os clientes')
    }
  },

  async createUser(userData: SystemUserInput): Promise<SystemUser> {
    try {
      console.log('Criando usuário:', userData)
      const response = await axios.post<{ success: boolean, message: string, data?: SystemUser }>(
        'https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/usuario',
        {
          user: userData.user,
          nome: userData.nome,
          email: userData.email,
          senha: userData.senha,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao criar usuário')
      }

      console.log('Usuário criado com sucesso:', response.data)

      // Se a API retornar os dados do usuário criado, usar eles
      if (response.data.data) {
        return response.data.data
      }

      // Caso contrário, buscar o usuário recém-criado
      const usuarios = await this.getAllUsers()
      const novoUsuario = usuarios.find(u =>
        u.user === userData.user && u.nome === userData.nome
      )

      if (!novoUsuario) {
        throw new Error('Usuário criado mas não foi possível recuperar os dados')
      }

      return novoUsuario
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw new Error('Não foi possível criar o usuário')
    }
  },

  async updateUser(id: number, userData: Partial<SystemUserInput>): Promise<SystemUser> {
    try {
      console.log('Atualizando usuário:', id, userData)
      const response = await axios.put<{ success: boolean, message: string }>(
        `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/usuario`,
        {
          id: id,
          ...userData
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao atualizar usuário')
      }

      // Buscar o usuário atualizado
      const usuarios = await this.getAllUsers()
      const usuarioAtualizado = usuarios.find(u => u.id === id)

      if (!usuarioAtualizado) {
        throw new Error('Usuário não encontrado após atualização')
      }

      return usuarioAtualizado
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw new Error('Não foi possível atualizar o usuário')
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      console.log('Excluindo usuário:', id)
      const response = await axios.delete<{ success: boolean, message: string }>(
        `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/usuario`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: { id: id },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir usuário')
      }

      console.log('Usuário excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      throw new Error('Não foi possível excluir o usuário')
    }
  },

  async toggleUserStatus(id: number): Promise<SystemUser> {
    try {
      // Primeiro buscar o usuário atual
      const usuarios = await this.getAllUsers()
      const usuario = usuarios.find(u => u.id === id)

      if (!usuario) {
        throw new Error('Usuário não encontrado')
      }

      // Determinar o novo status baseado no status atual
      let novoStatus: number
      switch (usuario.status) {
        case 1: // Admin Ativo -> Admin Inativo
          novoStatus = 3
          break
        case 2: // Operador Ativo -> Operador Inativo
          novoStatus = 4
          break
        case 3: // Admin Inativo -> Admin Ativo
          novoStatus = 1
          break
        case 4: // Operador Inativo -> Operador Ativo
          novoStatus = 2
          break
        default:
          novoStatus = 2 // Default para Operador Ativo
      }

      // Atualizar o status com todos os dados do usuário
      return await this.updateUser(id, { ...usuario, status: novoStatus })
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
      throw new Error('Não foi possível alterar o status do usuário')
    }
  },

  // ===== FUNÇÕES PARA CUPONS (mantidas como estavam) =====
  async getAllCupons(): Promise<CupomFiscal[]> {
    try {
      console.log('Fazendo requisição para API...')
      const response = await axios.get<{ data: ApiCupom[] }>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 segundos de timeout
      })
      
      console.log('Resposta da API recebida:', response.status)
      
      if (!response.data || !response.data.data) {
        console.warn('Resposta da API não contém dados esperados')
        return []
      }
      
      const cupons = response.data.data.map(convertApiCupomToCupomFiscal)
      console.log('Cupons convertidos:', cupons.length)
      return cupons
    } catch (error) {
      console.error('Erro ao carregar cupons:', error)
      
      // Se for erro de rede/timeout, retornar array vazio ao invés de quebrar
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
          console.warn('Problema de conexão - retornando dados vazios')
          return []
        }
      }
      
      throw new Error('Não foi possível carregar os cupons da API')
    }
  },

  async getCupomById(id: string): Promise<CupomFiscal | null> {
    try {
      const response = await axios.get<{ data: ApiCupom[] }>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      const apiCupom = response.data.data.find(cupom => cupom.id.toString() === id)
      return apiCupom ? convertApiCupomToCupomFiscal(apiCupom) : null
    } catch (error) {
      console.error('Erro ao buscar cupom:', error)
      throw new Error('Não foi possível buscar o cupom')
    }
  },

  async createCupom(data: CupomFiscalInput): Promise<CupomFiscal> {
    // Tentar enviar criação para a API; se não suportar, fallback para simulação
    try {
  const dbPayload = mapToDbCupomPayload(data)
  console.log('Tentando criar cupom na API (db payload)...', dbPayload)
  const response = await axios.post<any>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', dbPayload, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        timeout: 10000
      })

      const respData = response.data
      // API pode retornar envelope { data: ApiCupom } ou ApiCupom diretamente
      const apiCupom: ApiCupom | undefined = Array.isArray(respData) ? respData[0] : (respData && respData.data) ? respData.data : respData
      if (apiCupom) {
        console.log('Cupom criado na API:', apiCupom)
        return convertApiCupomToCupomFiscal(apiCupom)
      }

      // Se não obteve apiCupom, tratar como erro
      throw new Error('Resposta inesperada ao criar cupom: ' + JSON.stringify(respData))
    } catch (error) {
      console.error('Criação de cupom via API falhou', error)
      throw error
    }
  },

  async updateCupom(id: string, data: Partial<CupomFiscalInput>): Promise<CupomFiscal> {
    // Tentar enviar atualização para a API; se não suportar, fallback para simulação
    try {
  const dbPayload = mapToDbCupomPayload(data, id)
  console.log(`Tentando atualizar cupom ${id} na API (db payload)...`, dbPayload)
  const response = await axios.put<any>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', dbPayload, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        timeout: 10000
      })

      const respData = response.data
      const apiCupom: ApiCupom | undefined = Array.isArray(respData) ? respData[0] : (respData && respData.data) ? respData.data : respData
      if (apiCupom) {
        console.log('Cupom atualizado na API:', apiCupom)
        return convertApiCupomToCupomFiscal(apiCupom)
      }

      throw new Error('Resposta inesperada ao atualizar cupom: ' + JSON.stringify(respData))
    } catch (error) {
      console.error('Atualização de cupom via API falhou', error)
      throw error
    }
  },

  async updateCupomStatus(id: string, newStatus: 'PAGO' | 'Pendente' | 'Cancelado'): Promise<CupomFiscal> {
    try {
      // Tentar enviar atualização para a API (se ela suportar)
      // Por enquanto, vamos simular uma requisição PUT/PATCH
      console.log(`Tentando atualizar status do cupom ${id} para ${newStatus} na API`)
      
      // Simular delay da API
      await delay(800)
      
      // Buscar o cupom atualizado da API para garantir que temos os dados mais recentes
      const response = await axios.get<{ data: ApiCupom[] }>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      
      const apiCupom = response.data.data.find(cupom => cupom.id.toString() === id)
      if (!apiCupom) {
        throw new Error('Cupom não encontrado na API')
      }
      
      // Converter e retornar com o novo status
      const cupomFiscal = convertApiCupomToCupomFiscal(apiCupom)
      return {
        ...cupomFiscal,
        status: newStatus,
        atualizadoEm: new Date()
      }
    } catch (error) {
      console.error('Erro ao atualizar status do cupom:', error)
      // Se a API não suportar atualização, retornar erro
      throw new Error('Não foi possível atualizar o status do cupom na API')
    }
  },

  async deleteCupom(id: string): Promise<void> {
    try {
      const response = await axios.delete(`https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/excluir`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: { id: id }, // Enviar o ID do cupom no corpo da requisição
        timeout: 10000 // 10 segundos de timeout
      })
      
      if (response.status !== 200) {
        throw new Error(`Erro na exclusão: ${response.status}`)
      }
      
      console.log(`Cupom ${id} excluído com sucesso`)
    } catch (error) {
      console.error('Erro ao excluir cupom:', error)
      throw new Error('Não foi possível excluir o cupom da API')
    }
  },

  async searchCupons(query: string): Promise<CupomFiscal[]> {
    try {
      const response = await axios.get<{ data: ApiCupom[] }>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      const cupons = response.data.data.map(convertApiCupomToCupomFiscal)
      
      const lowerQuery = query.toLowerCase()
      return cupons.filter(cupom => 
        cupom.informacoesTransacao.numeroCupom.toLowerCase().includes(lowerQuery) ||
        cupom.dadosEstabelecimento.cnpj.toLowerCase().includes(lowerQuery) ||
        cupom.dadosEstabelecimento.razaoSocial.toLowerCase().includes(lowerQuery) ||
        cupom.dadosMotorista.celular.toLowerCase().includes(lowerQuery) ||
        cupom.observacoes?.toLowerCase().includes(lowerQuery)
      )
    } catch (error) {
      console.error('Erro ao pesquisar cupons:', error)
      throw new Error('Não foi possível pesquisar os cupons')
    }
  },

  // Função para salvar item proibido no banco de dados
  async saveItemProibido(item: ItemProibidoInput): Promise<ItemProibido> {
    try {
      const response = await axios.post<{ success: boolean, message: string, data?: ItemProibido }>(
  'https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/item_proibido',
        {
          produto: item.produto || null,
          grupo: item.grupo || null
        },
        {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
          timeout: 10000
        }
      )
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao salvar item proibido')
      }
      
      console.log('Item proibido salvo com sucesso na API')
      if (response.data.data) {
        return response.data.data
      }
      throw new Error('Item proibido criado mas não foi possível recuperar os dados')
    } catch (error) {
      console.error('Erro ao salvar item proibido:', error)
      throw new Error('Não foi possível salvar o item proibido na API')
    }
  },

  async getAllItensProibidos(): Promise<ItemProibido[]> {
    try {
      console.log('Buscando itens proibidos na API...')
      const response = await axios.get<any>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/item_proibido', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      // API pode retornar diretamente um array ou um envelope { data: [...] }
      const data = response.data
      if (Array.isArray(data)) {
        console.log('Itens proibidos recebidos (array):', data.length)
        return data
      }

      if (data && Array.isArray(data.data)) {
        console.log('Itens proibidos recebidos (envelope.data):', data.data.length)
        return data.data
      }

      console.warn('Resposta inesperada ao buscar itens proibidos:', data)
      return []
    } catch (error) {
      console.error('Erro ao carregar itens proibidos:', error)
      throw new Error('Não foi possível carregar os itens proibidos')
    }
  },

  async updateItemProibido(id: number, itemData: ItemProibidoInput): Promise<ItemProibido> {
    try {
      const response = await axios.put<{ success: boolean, message: string, data?: ItemProibido }>(
  `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/item_proibido`,
        {
          id: id,
          produto: itemData.produto || null,
          grupo: itemData.grupo || null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao atualizar item proibido')
      }

      if (response.data.data) {
        return response.data.data
      }
      throw new Error('Item proibido atualizado mas não foi possível recuperar os dados')
    } catch (error) {
      console.error('Erro ao atualizar item proibido:', error)
      throw new Error('Não foi possível atualizar o item proibido')
    }
  },

  async deleteItemProibido(id: number): Promise<void> {
    try {
      const response = await axios.delete<{ success: boolean, message: string }>(
  `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/item_proibido`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: { id: id },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir item proibido')
      }
      console.log('Item proibido excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir item proibido:', error)
      throw new Error('Não foi possível excluir o item proibido')
    }
  },

  // ===== FUNÇÕES PARA PRODUTOS =====
  async getAllProdutos(): Promise<ApiProduto[]> {
    try {
  const response = await axios.get<ApiProduto[]>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/produto', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      return response.data || []
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      throw new Error('Não foi possível carregar os produtos')
    }
  },

  async createProduto(produto: ProdutoInput): Promise<ApiProduto> {
    try {
      const response = await axios.post<{ success: boolean, message: string, data?: ApiProduto }>(
  'https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/produto',
        {
          produto: produto.produto || null,
          qtd: produto.qtd || null,
          valor_uni: produto.valor_uni,
          reembolso: produto.reembolso ? 1 : 0,
          cupom_id: produto.cupom_id,
          item_proibido_id: produto.item_proibido_id
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao criar produto')
      }
      if (response.data.data) {
        return response.data.data
      }
      throw new Error('Produto criado mas não foi possível recuperar os dados')
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      throw new Error('Não foi possível criar o produto')
    }
  },

  async updateProduto(id: number, produtoData: Partial<ProdutoInput>): Promise<ApiProduto> {
    try {
      const response = await axios.put<{ success: boolean, message: string, data?: ApiProduto }>(
  `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/produto`,
        {
          id: id,
          produto: produtoData.produto || null,
          qtd: produtoData.qtd || null,
          valor_uni: produtoData.valor_uni,
          reembolso: produtoData.reembolso !== undefined ? (produtoData.reembolso ? 1 : 0) : undefined,
          cupom_id: produtoData.cupom_id,
          item_proibido_id: produtoData.item_proibido_id
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao atualizar produto')
      }

      if (response.data.data) {
        return response.data.data
      }
      throw new Error('Produto atualizado mas não foi possível recuperar os dados')
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      throw new Error('Não foi possível atualizar o produto')
    }
  },

  async deleteProduto(id: number): Promise<void> {
    try {
      const response = await axios.delete<{ success: boolean, message: string }>(
  `https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/produto`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: { id: id },
          timeout: 10000
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao excluir produto')
      }
      console.log('Produto excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      throw new Error('Não foi possível excluir o produto')
    }
  },

  // ===== FUNÇÕES DE AUTENTICAÇÃO =====
  async authenticate(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      await delay(1000) // Simular delay da API

      // Buscar usuários do sistema de gerenciamento
      const systemUsers = await this.getAllUsers()
      
      const user = systemUsers.find(
        u => u.user === credentials.username &&
             u.senha === credentials.password &&
          (u.status === 1 || u.status === 2) // Só permitir login de usuários ativos
      )

      if (user) {
        const { role } = USER_STATUS_MAP[user.status as keyof typeof USER_STATUS_MAP]
        return {
          success: true,
          user: {
            id: user.id.toString(),
            username: user.user,
            nome: user.nome,
            role: role
          },
          token: `token_${user.id}_${Date.now()}`, // Token simulado
        }
      }

      return {
        success: false,
        message: 'Credenciais inválidas'
      }

    } catch (error) {
      console.error('Erro na autenticação:', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  },

  async validateToken(token: string): Promise<LoginResponse> {
    try {
      // Em produção, isso validaria o token no servidor
      await delay(500)
      
      // Verificar se o token tem o formato esperado
      if (token.startsWith('token_')) {
        const parts = token.split('_')
        if (parts.length >= 2) {
          const userId = parseInt(parts[1])
          
          // Buscar dados do usuário pelo ID nos usuários do sistema
          const systemUsers = await this.getAllUsers()
          const user = systemUsers.find(u => u.id === userId && (u.status === 1 || u.status === 2))
          if (user) {
            const { role } = USER_STATUS_MAP[user.status as keyof typeof USER_STATUS_MAP]
            return {
              success: true,
              user: {
                id: user.id.toString(),
                username: user.user,
                nome: user.nome,
                role: role
              },
              token
            }
          }
        }
      }
      
      return {
        success: false,
        message: 'Token inválido'
      }
    } catch (error) {
      console.error('Erro na validação do token:', error)
      return {
        success: false,
        message: 'Erro na validação'
      }
    }
  },
} 