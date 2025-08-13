import * as React from "react"
import { TelefoneMotoristaConfig, Empresa } from "@/types/cupom"
import { cupomApi } from "@/lib/api"

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
  addTelefoneMotoristaConfig: (telefone: string, motorista: string, empresa?: string) => void
  removeTelefoneMotoristaConfig: (id: string) => void
  updateTelefoneMotoristaConfig: (id: string, telefone: string, motorista: string, empresa?: string) => void
  getMotoristaByTelefone: (telefone: string | null | undefined) => string | null
  
  // Funcionalidades para empresas
  empresas: Empresa[]
  addEmpresa: (nome: string, cnpj: string, telefone: string) => void
  removeEmpresa: (id: string) => void
  updateEmpresa: (id: string, nome: string, cnpj: string, telefone: string) => void
  
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

    // Carregar empresas
    const savedEmpresas = localStorage.getItem('empresas')
    if (savedEmpresas) {
      try {
        const empresas = JSON.parse(savedEmpresas)
        const empresasWithDates = empresas.map((empresa: any) => ({
          ...empresa,
          criadoEm: new Date(empresa.criadoEm),
          atualizadoEm: new Date(empresa.atualizadoEm)
        }))
        setEmpresas(empresasWithDates)
      } catch (error) {
        console.error('Erro ao carregar empresas:', error)
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
  }, [])

  // Salvar configurações no localStorage sempre que mudarem
  React.useEffect(() => {
    localStorage.setItem('telefoneMotoristaConfigs', JSON.stringify(telefoneMotoristaConfigs))
  }, [telefoneMotoristaConfigs])

  // Salvar empresas no localStorage sempre que mudarem
  React.useEffect(() => {
    localStorage.setItem('empresas', JSON.stringify(empresas))
  }, [empresas])

  // Salvar itens não reembolsáveis no localStorage sempre que mudarem
  React.useEffect(() => {
    localStorage.setItem('itensNaoReembolsaveis', JSON.stringify(itensNaoReembolsaveis))
  }, [itensNaoReembolsaveis])

  const addTelefoneMotoristaConfig = (telefone: string, motorista: string, empresa?: string) => {
    try {
      const newConfig: TelefoneMotoristaConfig = {
        id: Date.now().toString(),
        telefone,
        motorista,
        empresa: empresa || undefined,
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

  const updateTelefoneMotoristaConfig = (id: string, telefone: string, motorista: string, empresa?: string) => {
    setTelefoneMotoristaConfigs(prev => 
      prev.map(config => 
        config.id === id 
          ? { ...config, telefone, motorista, empresa, atualizadoEm: new Date() }
          : config
      )
    )
  }

  const getMotoristaByTelefone = (telefone: string | null | undefined): string | null => {
    // Verificar se telefone é válido
    if (!telefone || typeof telefone !== 'string') {
      return null
    }
    
    // Normalizar o telefone para comparação (remover formatação)
    const normalizedTelefone = telefone.replace(/\D/g, '')
    
    // Se não há telefone após normalização, retornar null
    if (!normalizedTelefone) {
      return null
    }
    
    const config = telefoneMotoristaConfigs.find(config => {
      const configTelefone = config.telefone.replace(/\D/g, '')
      return configTelefone === normalizedTelefone
    })
    
    return config ? config.motorista : null
  }

  // Funcionalidades para empresas
  const addEmpresa = (nome: string, cnpj: string, telefone: string) => {
    const newEmpresa: Empresa = {
      id: Date.now().toString(),
      nome,
      cnpj,
      telefone,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    }
    setEmpresas(prev => [...prev, newEmpresa])
  }

  const removeEmpresa = (id: string) => {
    setEmpresas(prev => prev.filter(empresa => empresa.id !== id))
  }

  const updateEmpresa = (id: string, nome: string, cnpj: string, telefone: string) => {
    setEmpresas(prev => 
      prev.map(empresa => 
        empresa.id === id 
          ? { ...empresa, nome, cnpj, telefone, atualizadoEm: new Date() }
          : empresa
      )
    )
  }

  // Funcionalidades para itens não reembolsáveis
  const addItemNaoReembolsavel = async (descricao: string, categoria?: string) => {
    // Gerar código auto incrementado
    let nextCode = 1
    if (itensNaoReembolsaveis.length > 0) {
      const maxCode = Math.max(...itensNaoReembolsaveis.map(item => parseInt(item.codigo)))
      nextCode = maxCode + 1
    }
    
    const codigo = nextCode.toString().padStart(3, '0') // Formato 001, 002, etc.
    
    // Salvar no banco de dados primeiro
    try {
      await cupomApi.saveItemProibido({
        codigo,
        descricao,
        categoria
      })
      
      // Se salvou com sucesso no banco, adicionar ao estado local
      const newItem: ItemNaoReembolsavel = {
        id: Date.now().toString(),
        codigo,
        descricao,
        categoria,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }
      setItensNaoReembolsaveis(prev => [...prev, newItem])
    } catch (error) {
      console.error('Erro ao salvar item proibido:', error)
      throw error // Re-throw para que o componente possa tratar o erro
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

  // Nova função para verificar se um produto deve ser bloqueado baseado na nova lógica
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
    addEmpresa,
    removeEmpresa,
    updateEmpresa,
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