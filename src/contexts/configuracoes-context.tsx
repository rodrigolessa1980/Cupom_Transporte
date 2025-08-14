import * as React from "react"
import { TelefoneMotoristaConfig } from "@/types/cupom"
import { cupomApi, Empresa, EmpresaInput } from "@/lib/api"

// Interface para itens não reembolsáveis
export interface ItemNaoReembolsavel {
  id: string
  codigo: string
  descricao: string
  categoria?: string
  criadoEm: Date
  atualizadoEm: Date
}

interface ConfiguracoesContextType {
  telefoneMotoristaConfigs: TelefoneMotoristaConfig[]
  addTelefoneMotoristaConfig: (telefone: string, motorista: string) => void
  removeTelefoneMotoristaConfig: (id: string) => void
  updateTelefoneMotoristaConfig: (id: string, telefone: string, motorista: string) => void
  getMotoristaByTelefone: (telefone: string | null | undefined) => string | null
  
  // Funcionalidades para empresas
  empresas: Empresa[]
  isLoadingEmpresas: boolean
  addEmpresa: (nome: string, cnpj: string, telefone: string) => Promise<void>
  removeEmpresa: (id: number) => Promise<void>
  updateEmpresa: (id: number, nome: string, cnpj: string, telefone: string) => Promise<void>
  refreshEmpresas: () => Promise<void>
  
  // Funcionalidades para itens não reembolsáveis
  itensNaoReembolsaveis: ItemNaoReembolsavel[]
  addItemNaoReembolsavel: (descricao: string, categoria?: string) => Promise<void>
  removeItemNaoReembolsavel: (id: string) => void
  updateItemNaoReembolsavel: (id: string, descricao: string, categoria?: string) => void
  isItemNaoReembolsavel: (codigo: string) => boolean
  isProdutoProibido: (nomeProduto: string) => boolean
}

const ConfiguracoesContext = React.createContext<ConfiguracoesContextType | undefined>(undefined)

export function ConfiguracoesProvider({ children }: { children: React.ReactNode }) {
  const [telefoneMotoristaConfigs, setTelefoneMotoristaConfigs] = React.useState<TelefoneMotoristaConfig[]>([])
  const [empresas, setEmpresas] = React.useState<Empresa[]>([])
  const [isLoadingEmpresas, setIsLoadingEmpresas] = React.useState(false)
  const [itensNaoReembolsaveis, setItensNaoReembolsaveis] = React.useState<ItemNaoReembolsavel[]>([])

  // Carregar configurações do localStorage na inicialização
  React.useEffect(() => {
    const savedConfigs = localStorage.getItem('telefoneMotoristaConfigs')
    if (savedConfigs) {
      try {
        const configs = JSON.parse(savedConfigs)
        // Converter as datas de volta para objetos Date
        const configsWithDates = configs.map((config: any) => ({
          ...config,
          criadoEm: new Date(config.criadoEm),
          atualizadoEm: new Date(config.atualizadoEm)
        }))
        setTelefoneMotoristaConfigs(configsWithDates)
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }

    // Carregar itens não reembolsáveis
    const savedItens = localStorage.getItem('itensNaoReembolsaveis')
    if (savedItens) {
      try {
        const itens = JSON.parse(savedItens)
        const itensWithDates = itens.map((item: any) => ({
          ...item,
          criadoEm: new Date(item.criadoEm),
          atualizadoEm: new Date(item.atualizadoEm)
        }))
        setItensNaoReembolsaveis(itensWithDates)
      } catch (error) {
        console.error('Erro ao carregar itens não reembolsáveis:', error)
      }
    }

    // Carregar empresas da API
    refreshEmpresas()
  }, [])

  // Salvar configurações no localStorage sempre que mudarem
  React.useEffect(() => {
    localStorage.setItem('telefoneMotoristaConfigs', JSON.stringify(telefoneMotoristaConfigs))
  }, [telefoneMotoristaConfigs])

  // Salvar itens não reembolsáveis no localStorage sempre que mudarem
  React.useEffect(() => {
    localStorage.setItem('itensNaoReembolsaveis', JSON.stringify(itensNaoReembolsaveis))
  }, [itensNaoReembolsaveis])

  // Função para recarregar empresas da API
  const refreshEmpresas = async () => {
    setIsLoadingEmpresas(true)
    try {
      const empresasData = await cupomApi.getAllEmpresas()
      setEmpresas(empresasData)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      // Em caso de erro, manter as empresas existentes
    } finally {
      setIsLoadingEmpresas(false)
    }
  }

  const addTelefoneMotoristaConfig = (telefone: string, motorista: string) => {
    try {
      const newConfig: TelefoneMotoristaConfig = {
        id: Date.now().toString(),
        telefone,
        motorista,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }
      console.log("Adicionando nova configuração:", newConfig)
      setTelefoneMotoristaConfigs(prev => {
        const updated = [...prev, newConfig]
        // Salvar no localStorage
        localStorage.setItem('telefoneMotoristaConfigs', JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error("Erro ao adicionar configuração:", error)
    }
  }

  const removeTelefoneMotoristaConfig = (id: string) => {
    setTelefoneMotoristaConfigs(prev => prev.filter(config => config.id !== id))
  }

  const updateTelefoneMotoristaConfig = (id: string, telefone: string, motorista: string) => {
    setTelefoneMotoristaConfigs(prev => 
      prev.map(config => 
        config.id === id 
          ? { ...config, telefone, motorista, atualizadoEm: new Date() }
          : config
      )
    )
  }

  const getMotoristaByTelefone = (telefone: string | null | undefined): string | null => {
    if (!telefone) return null
    
    const config = telefoneMotoristaConfigs.find(
      config => config.telefone.replace(/\D/g, '') === telefone.replace(/\D/g, '')
    )
    
    return config ? config.motorista : null
  }

  // Funções para empresas
  const addEmpresa = async (nome: string, cnpj: string, telefone: string) => {
    try {
      const novaEmpresa: EmpresaInput = { nome, cnpj, telefone }
      await cupomApi.createEmpresa(novaEmpresa)
      await refreshEmpresas() // Recarregar lista de empresas
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error)
      throw error
    }
  }

  const removeEmpresa = async (id: number) => {
    try {
      await cupomApi.deleteEmpresa(id)
      await refreshEmpresas() // Recarregar lista de empresas
    } catch (error) {
      console.error('Erro ao remover empresa:', error)
      throw error
    }
  }

  const updateEmpresa = async (id: number, nome: string, cnpj: string, telefone: string) => {
    try {
      const empresaData: EmpresaInput = { nome, cnpj, telefone }
      await cupomApi.updateEmpresa(id, empresaData)
      await refreshEmpresas() // Recarregar lista de empresas
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      throw error
    }
  }

  // Funções para itens não reembolsáveis
  const addItemNaoReembolsavel = async (descricao: string, categoria?: string) => {
    try {
      const newItem: ItemNaoReembolsavel = {
        id: Date.now().toString(),
        codigo: `PROD_${Date.now()}`,
        descricao,
        categoria,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }
      
      // Salvar no banco de dados via API
      await cupomApi.saveItemProibido({
        codigo: newItem.codigo,
        descricao: newItem.descricao,
        categoria: newItem.categoria
      })
      
      setItensNaoReembolsaveis(prev => [...prev, newItem])
    } catch (error) {
      console.error('Erro ao adicionar item não reembolsável:', error)
      throw error
    }
  }

  const removeItemNaoReembolsavel = (id: string) => {
    setItensNaoReembolsaveis(prev => prev.filter(item => item.id !== id))
  }

  const updateItemNaoReembolsavel = (id: string, descricao: string, categoria?: string) => {
    setItensNaoReembolsaveis(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, descricao, categoria, atualizadoEm: new Date() }
          : item
      )
    )
  }

  const isItemNaoReembolsavel = (codigo: string): boolean => {
    return itensNaoReembolsaveis.some(item => item.codigo === codigo)
  }

  const isProdutoProibido = (nomeProduto: string): boolean => {
    if (!nomeProduto) return false
    
    const nomeNormalizado = nomeProduto.toLowerCase().trim()
    
    return itensNaoReembolsaveis.some(item => {
      if (item.categoria === "PRODUTO") {
        // Para produtos específicos, comparação exata
        return item.descricao.toLowerCase().trim() === nomeNormalizado
      } else if (item.categoria === "GRUPO") {
        // Para grupos, verifica se o nome do produto contém o grupo
        const grupoNormalizado = item.descricao.toLowerCase().trim()
        return nomeNormalizado.includes(grupoNormalizado) || grupoNormalizado.includes(nomeNormalizado)
      }
      return false
    })
  }

  const value: ConfiguracoesContextType = {
    telefoneMotoristaConfigs,
    addTelefoneMotoristaConfig,
    removeTelefoneMotoristaConfig,
    updateTelefoneMotoristaConfig,
    getMotoristaByTelefone,
    empresas,
    isLoadingEmpresas,
    addEmpresa,
    removeEmpresa,
    updateEmpresa,
    refreshEmpresas,
    itensNaoReembolsaveis,
    addItemNaoReembolsavel,
    removeItemNaoReembolsavel,
    updateItemNaoReembolsavel,
    isItemNaoReembolsavel,
    isProdutoProibido
  }

  return (
    <ConfiguracoesContext.Provider value={value}>
      {children}
    </ConfiguracoesContext.Provider>
  )
}

export function useConfiguracoes() {
  const context = React.useContext(ConfiguracoesContext)
  if (context === undefined) {
    throw new Error('useConfiguracoes deve ser usado dentro de um ConfiguracoesProvider')
  }
  return context
} 