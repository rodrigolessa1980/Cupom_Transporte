import * as React from "react"
import { TelefoneMotoristaConfig } from "@/types/cupom"
import { cupomApi, Empresa, EmpresaInput } from "@/lib/api"

// Interface para itens não reembolsáveis
export interface ItemNaoReembolsavel {
  id: number
  produto?: string
  grupo?: string
  criadoEm: Date
  atualizadoEm: Date
}

interface ConfiguracoesContextType {
  telefoneMotoristaConfigs: TelefoneMotoristaConfig[]
  addTelefoneMotoristaConfig: (motorista: string, telefone?: string | undefined, empresa_id?: number | null) => Promise<void>
  removeTelefoneMotoristaConfig: (id: string) => Promise<void>
  updateTelefoneMotoristaConfig: (id: string, motorista: string, telefone?: string | undefined, empresa_id?: number | null) => Promise<void>
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
  isLoadingItensNaoReembolsaveis: boolean
  addItemNaoReembolsavel: (produto?: string, grupo?: string) => Promise<void>
  removeItemNaoReembolsavel: (id: number) => Promise<void>
  updateItemNaoReembolsavel: (id: number, produto?: string, grupo?: string) => Promise<void>
  refreshItensNaoReembolsaveis: () => Promise<void>
  isItemNaoReembolsavel: (id: number) => boolean
  isProdutoProibido: (nomeProduto: string) => boolean
}

const ConfiguracoesContext = React.createContext<ConfiguracoesContextType | undefined>(undefined)

export function ConfiguracoesProvider({ children }: { children: React.ReactNode }) {
  const [telefoneMotoristaConfigs, setTelefoneMotoristaConfigs] = React.useState<TelefoneMotoristaConfig[]>([])
  const [empresas, setEmpresas] = React.useState<Empresa[]>([])
  const [isLoadingEmpresas, setIsLoadingEmpresas] = React.useState(false)
  const [itensNaoReembolsaveis, setItensNaoReembolsaveis] = React.useState<ItemNaoReembolsavel[]>([])
  const [isLoadingItensNaoReembolsaveis, setIsLoadingItensNaoReembolsaveis] = React.useState(false)

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

    // Carregar itens não reembolsáveis da API
    refreshItensNaoReembolsaveis()

    // Carregar empresas da API
    refreshEmpresas()
      
      // Sincronizar motoristas do servidor com o que temos localmente
      ;(async () => {
        try {
          const serverMotoristas = await cupomApi.getAllMotoristas()
          // Mapear para o formato TelefoneMotoristaConfig
          const serverConfigs: TelefoneMotoristaConfig[] = serverMotoristas.map(m => ({
            id: m.id.toString(),
            telefone: m.telefone ?? null,
            motorista: m.nome,
            empresa_id: m.empresa_id ?? null,
            criadoEm: new Date(),
            atualizadoEm: new Date()
          }))
          
          setTelefoneMotoristaConfigs(prev => {
            // Prev contem os configs carregados do localStorage (fallbacks locais tambem)
            // Mesclar: manter todos serverConfigs (autoridade), e adicionar prev que NAO existem no servidor (ids nao numericos ou ids locais)
            const serverIds = new Set(serverConfigs.map(s => s.id))
            const merged = [ ...serverConfigs ]
            prev.forEach(p => {
              // se o registro local tiver id numerico e existir no servidor, pular (server vence)
              const numeric = parseInt(p.id)
              if (!isNaN(numeric)) {
                if (!serverIds.has(p.id)) {
                  merged.push(p)
                }
              } else {
                // id local (fallback) -> manter
                merged.push(p)
              }
            })
            
            // Salvar mesclado no localStorage para manter consistencia local
            try {
              localStorage.setItem('telefoneMotoristaConfigs', JSON.stringify(merged))
            } catch (e) {
              console.warn('Nao foi possivel salvar telefoneMotoristaConfigs no localStorage:', e)
            }
            
            return merged
          })
        } catch (err) {
          console.warn('Falha ao sincronizar motoristas do servidor:', err)
        }
      })()
  }, [])

  // Salvar configurações no localStorage sempre que mudarem
  React.useEffect(() => {
    localStorage.setItem('telefoneMotoristaConfigs', JSON.stringify(telefoneMotoristaConfigs))
  }, [telefoneMotoristaConfigs])

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

  // Função para recarregar itens não reembolsáveis da API
  const refreshItensNaoReembolsaveis = async () => {
    setIsLoadingItensNaoReembolsaveis(true)
    try {
      const itensData = await cupomApi.getAllItensProibidos()
      // Adicionar campos criadoEm e atualizadoEm se necessário, pois a API pode não retorná-los
      const itensWithDates = itensData.map(item => ({
        ...item,
        criadoEm: new Date(), // Ou usar uma data default se a API não fornecer
        atualizadoEm: new Date() // Idem
      }))
      setItensNaoReembolsaveis(itensWithDates)
    } catch (error) {
      console.error('Erro ao carregar itens não reembolsáveis:', error)
    } finally {
      setIsLoadingItensNaoReembolsaveis(false)
    }
  }

  const addTelefoneMotoristaConfig = async (motorista: string, telefone?: string | undefined, empresa_id?: number | null) => {
      try {
        // Tentar criar o motorista na API e usar o ID retornado
        try {
          const created = await cupomApi.createMotorista({ nome: motorista, telefone: telefone ?? null, empresa_id: empresa_id ?? null })
          const newConfig: TelefoneMotoristaConfig = {
            id: created.id.toString(),
            telefone: created.telefone || telefone || null,
            motorista: created.nome,
            empresa_id: created.empresa_id ?? null,
            criadoEm: new Date(),
            atualizadoEm: new Date()
          }
          setTelefoneMotoristaConfigs(prev => {
            const updated = [...prev, newConfig]
            localStorage.setItem('telefoneMotoristaConfigs', JSON.stringify(updated))
            return updated
          })
          return
        } catch (err) {
          console.warn('Falha ao criar motorista na API, fallback para armazenamento local', err)
        }

        // Fallback: persistir localmente
        const newConfig: TelefoneMotoristaConfig = {
          id: Date.now().toString(),
          telefone: telefone ?? null,
          motorista,
          empresa_id: empresa_id ?? null,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        }
        setTelefoneMotoristaConfigs(prev => {
          const updated = [...prev, newConfig]
          localStorage.setItem('telefoneMotoristaConfigs', JSON.stringify(updated))
          return updated
        })
      } catch (error) {
        console.error('Erro ao adicionar configuração:', error)
        throw error
      }
    }

  const removeTelefoneMotoristaConfig = async (id: string) => {
      try {
        // Se o ID for numérico, tentar remover o motorista na API
        const numericId = parseInt(id)
        if (!isNaN(numericId)) {
          try {
            await cupomApi.deleteMotorista(numericId)
          } catch (err) {
            console.warn('Falha ao remover motorista na API, removendo localmente', err)
          }
        }
        setTelefoneMotoristaConfigs(prev => prev.filter(config => config.id !== id))
      } catch (error) {
        console.error('Erro ao remover configuração:', error)
        throw error
      }
    }

  const updateTelefoneMotoristaConfig = async (id: string, motorista: string, telefone?: string | undefined, empresa_id?: number | null) => {
      try {
        const numericId = parseInt(id)
        if (!isNaN(numericId)) {
          try {
            await cupomApi.updateMotorista(numericId, { nome: motorista, telefone: telefone ?? null, empresa_id: empresa_id ?? null })
          } catch (err) {
            console.warn('Falha ao atualizar motorista na API, atualizando localmente', err)
          }
        }

        setTelefoneMotoristaConfigs(prev => 
          prev.map(config => 
            config.id === id 
              ? { ...config, telefone: telefone ?? null, motorista, empresa_id: empresa_id ?? null, atualizadoEm: new Date() }
              : config
          )
        )
      } catch (error) {
        console.error('Erro ao atualizar configuração:', error)
        throw error
      }
    }

  const getMotoristaByTelefone = (telefone: string | null | undefined): string | null => {
    if (!telefone) return null
    
    const config = telefoneMotoristaConfigs.find(
      config => config.telefone && telefone && config.telefone.replace(/\D/g, '') === telefone.replace(/\D/g, '')
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
  const addItemNaoReembolsavel = async (produto?: string, grupo?: string) => {
    try {
      const newItem: ItemNaoReembolsavel = {
        id: Date.now(), // Usar Date.now() para gerar um ID único
        produto,
        grupo,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }
      
      // Salvar no banco de dados via API (API espera produto/grupo)
      console.log('addItemNaoReembolsavel: salvando item na API', { produto: newItem.produto, grupo: newItem.grupo })
      const saved = await cupomApi.saveItemProibido({
        produto: newItem.produto || undefined,
        grupo: newItem.grupo || undefined
      })
      console.log('addItemNaoReembolsavel: resposta da API', saved)
      
      setItensNaoReembolsaveis(prev => [...prev, newItem])
    } catch (error) {
      console.error('Erro ao adicionar item não reembolsável:', error)
      throw error
    }
  }

  const removeItemNaoReembolsavel = async (id: number) => {
    try {
      await cupomApi.deleteItemProibido(id)
      setItensNaoReembolsaveis(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Erro ao remover item não reembolsável:', error)
      throw error
    }
  }

  const updateItemNaoReembolsavel = async (id: number, produto?: string, grupo?: string) => {
    try {
      await cupomApi.updateItemProibido(id, {
        produto: produto || undefined,
        grupo: grupo || undefined
      })
      setItensNaoReembolsaveis(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, produto, grupo, atualizadoEm: new Date() }
            : item
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar item não reembolsável:', error)
      throw error
    }
  }

  const isItemNaoReembolsavel = (id: number): boolean => {
    return itensNaoReembolsaveis.some(item => item.id === id)
  }

  const isProdutoProibido = (nomeProduto: string): boolean => {
    if (!nomeProduto) return false
    
    const nomeNormalizado = nomeProduto.toLowerCase().trim()
    
    return itensNaoReembolsaveis.some(item => {
      if (item.produto) { // Verifica se é um produto específico
        return item.produto.toLowerCase().trim() === nomeNormalizado
      } else if (item.grupo) { // Verifica se é um grupo
        const grupoNormalizado = item.grupo.toLowerCase().trim()
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
    isLoadingItensNaoReembolsaveis,
    addItemNaoReembolsavel,
    removeItemNaoReembolsavel,
    updateItemNaoReembolsavel,
    refreshItensNaoReembolsaveis,
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