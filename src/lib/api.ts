import axios from 'axios'
import { CupomFiscal, CupomFiscalInput } from '@/types/cupom'

// Interface para itens proibidos
export interface ItemProibido {
  codigo: string
  descricao: string
  categoria?: string
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

// Interface para gerenciamento de usuários
export interface SystemUser {
  id: string
  username: string
  nome: string
  senha: string
  role: 'admin' | 'user'
  transportadora?: string
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export interface SystemUserInput {
  username: string
  nome: string
  senha: string
  role: 'admin' | 'user'
  transportadora?: string
  ativo: boolean
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

export const cupomApi = {
  async getAllCupons(): Promise<CupomFiscal[]> {
    try {
      console.log('Fazendo requisição para API...')
      const response = await axios.get<{data: ApiCupom[]}>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', {
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
      const response = await axios.get<{data: ApiCupom[]}>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', {
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
    // Como a API não suporta criação, vamos simular
    await delay(800)
    const newCupom: CupomFiscal = {
      id: Date.now().toString(),
      ...data,
      status: data.status || 'Pendente',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    }
    return newCupom
  },

  async updateCupom(id: string, data: Partial<CupomFiscalInput>): Promise<CupomFiscal> {
    // Como a API não suporta atualização, vamos simular
    await delay(600)
    const updatedCupom: CupomFiscal = {
      id,
      dadosEstabelecimento: data.dadosEstabelecimento || {
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        ie: '',
        im: '',
        endereco: '',
        cidade: '',
        telefone: ''
      },
      informacoesTransacao: data.informacoesTransacao || {
        numeroCupom: '',
        data: new Date(),
        hora: '',
        coo: '',
        ecf: '',
        numeroEcf: ''
      },
      dadosMotorista: data.dadosMotorista || {
        celular: '',
        nome: ''
      },
      itens: data.itens || [],
      totais: data.totais || {
        valorTotal: 0,
        formaPagamento: '',
        troco: 0,
        desconto: 0
      },
      observacoes: data.observacoes,
      status: data.status || 'Pendente',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    }
    return updatedCupom
  },

  async updateCupomStatus(id: string, newStatus: 'PAGO' | 'Pendente' | 'Cancelado'): Promise<CupomFiscal> {
    try {
      // Tentar enviar atualização para a API (se ela suportar)
      // Por enquanto, vamos simular uma requisição PUT/PATCH
      console.log(`Tentando atualizar status do cupom ${id} para ${newStatus} na API`)
      
      // Simular delay da API
      await delay(800)
      
      // Buscar o cupom atualizado da API para garantir que temos os dados mais recentes
      const response = await axios.get<{data: ApiCupom[]}>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', {
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
      const response = await axios.get<{data: ApiCupom[]}>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/cupom', {
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
  async saveItemProibido(item: ItemProibido): Promise<void> {
    try {
      const response = await axios.post('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/item_proibido', {
        codigo: parseInt(item.codigo),
        descricao: item.descricao,
        categoria: item.categoria || null
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 segundos de timeout
      })
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Erro ao salvar item proibido: ${response.status}`)
      }
      
      console.log('Item proibido salvo com sucesso na API')
    } catch (error) {
      console.error('Erro ao salvar item proibido:', error)
      throw new Error('Não foi possível salvar o item proibido na API')
    }
  },

  // Funções de autenticação
  async authenticate(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      await delay(1000) // Simular delay da API

      // Buscar usuários do sistema de gerenciamento
      const systemUsers = await this.getAllUsers()
      
      const user = systemUsers.find(
        u => u.username === credentials.username && 
             u.senha === credentials.password &&
             u.ativo // Só permitir login de usuários ativos
      )

      if (user) {
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            nome: user.nome,
            role: user.role
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
          const userId = parts[1]
          
          // Buscar dados do usuário pelo ID nos usuários do sistema
          const systemUsers = await this.getAllUsers()
          const user = systemUsers.find(u => u.id === userId && u.ativo)
          if (user) {
            return {
              success: true,
              user: {
                id: user.id,
                username: user.username,
                nome: user.nome,
                role: user.role
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

  // Funções de gerenciamento de usuários
  async getAllUsers(): Promise<SystemUser[]> {
    try {
      await delay(500)
      
      const savedUsers = localStorage.getItem('system_users')
      if (savedUsers) {
        return JSON.parse(savedUsers).map((user: any) => ({
          ...user,
          criadoEm: new Date(user.criadoEm),
          atualizadoEm: new Date(user.atualizadoEm)
        }))
      }
      
      return []
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      throw new Error('Não foi possível carregar os usuários')
    }
  },

  async createUser(userData: SystemUserInput): Promise<SystemUser> {
    try {
      await delay(800)
      
      // Verificar se username já existe
      const existingUsers = await this.getAllUsers()
      const duplicateUser = existingUsers.find(u => 
        u.username.toLowerCase() === userData.username.toLowerCase()
      )
      
      if (duplicateUser) {
        throw new Error('Nome de usuário já existe')
      }
      
      const newUser: SystemUser = {
        id: Date.now().toString(),
        ...userData,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }
      
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem('system_users', JSON.stringify(updatedUsers))
      
      return newUser
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      console.error('Erro ao criar usuário:', error)
      throw new Error('Não foi possível criar o usuário')
    }
  },

  async updateUser(id: string, userData: Partial<SystemUserInput>): Promise<SystemUser> {
    try {
      await delay(600)
      
      const existingUsers = await this.getAllUsers()
      const userIndex = existingUsers.findIndex(u => u.id === id)
      
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado')
      }
      
      // Verificar se username já existe (exceto para o próprio usuário)
      if (userData.username) {
        const duplicateUser = existingUsers.find(u => 
          u.id !== id && u.username.toLowerCase() === userData.username!.toLowerCase()
        )
        
        if (duplicateUser) {
          throw new Error('Nome de usuário já existe')
        }
      }
      
      const updatedUser: SystemUser = {
        ...existingUsers[userIndex],
        ...userData,
        atualizadoEm: new Date()
      }
      
      const updatedUsers = [...existingUsers]
      updatedUsers[userIndex] = updatedUser
      
      localStorage.setItem('system_users', JSON.stringify(updatedUsers))
      
      return updatedUser
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      console.error('Erro ao atualizar usuário:', error)
      throw new Error('Não foi possível atualizar o usuário')
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await delay(400)
      
      const existingUsers = await this.getAllUsers()
      const user = existingUsers.find(u => u.id === id)
      
      if (!user) {
        throw new Error('Usuário não encontrado')
      }
      
      // Não permitir excluir o último admin
      const activeAdmins = existingUsers.filter(u => u.role === 'admin' && u.id !== id)
      if (activeAdmins.length === 0) {
        throw new Error('Não é possível excluir o último administrador')
      }
      
      const updatedUsers = existingUsers.filter(u => u.id !== id)
      localStorage.setItem('system_users', JSON.stringify(updatedUsers))
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      console.error('Erro ao excluir usuário:', error)
      throw new Error('Não foi possível excluir o usuário')
    }
  },

  async toggleUserStatus(id: string): Promise<SystemUser> {
    try {
      await delay(400)
      
      const existingUsers = await this.getAllUsers()
      const userIndex = existingUsers.findIndex(u => u.id === id)
      
      if (userIndex === -1) {
        throw new Error('Usuário não encontrado')
      }
      
      const user = existingUsers[userIndex]
      
      // Não permitir desativar o último admin ativo
      if (user.role === 'admin' && user.ativo) {
        const activeAdmins = existingUsers.filter(u => 
          u.role === 'admin' && u.ativo && u.id !== id
        )
        if (activeAdmins.length === 0) {
          throw new Error('Não é possível desativar o último administrador ativo')
        }
      }
      
      const updatedUser: SystemUser = {
        ...user,
        ativo: !user.ativo,
        atualizadoEm: new Date()
      }
      
      const updatedUsers = [...existingUsers]
      updatedUsers[userIndex] = updatedUser
      
      localStorage.setItem('system_users', JSON.stringify(updatedUsers))
      
      return updatedUser
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      console.error('Erro ao alterar status do usuário:', error)
      throw new Error('Não foi possível alterar o status do usuário')
    }
  },
} 