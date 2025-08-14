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

  // ===== FUNÇÕES PARA USUÁRIOS =====
  async getAllUsers(): Promise<SystemUser[]> {
    try {
      console.log('Fazendo requisição para buscar usuários...')
      const response = await axios.get<SystemUser[]>('https://dadosbi.monkeybranch.com.br/webhook/trans_cupom/usuario', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })

      console.log('Usuários recebidos:', response.data)
      return response.data || []
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      throw new Error('Não foi possível carregar os usuários')
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

      // Atualizar o status
      return await this.updateUser(id, { status: novoStatus })
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
        'https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/item_proibido',
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
      const response = await axios.get<ItemProibido[]>('https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/item_proibido', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      return response.data || []
    } catch (error) {
      console.error('Erro ao carregar itens proibidos:', error)
      throw new Error('Não foi possível carregar os itens proibidos')
    }
  },

  async updateItemProibido(id: number, itemData: ItemProibidoInput): Promise<ItemProibido> {
    try {
      const response = await axios.put<{ success: boolean, message: string, data?: ItemProibido }>(
        `https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/item_proibido`,
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
        `https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/item_proibido`,
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
      const response = await axios.get<ApiProduto[]>('https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/produto', {
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
        'https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/produto',
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
        `https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/produto`,
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
        `https://dadosbi.monkeybranch.com.br/webhook-test/trans_cupom/produto`,
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