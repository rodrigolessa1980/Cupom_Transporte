import * as React from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  Search, 
  FileText, 
  Moon, 
  Sun,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  X,
  Settings,
  AlertTriangle,
  Trash2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { CupomForm } from "@/components/cupom-form"
import { CuponsTable } from "@/components/cupons-table"
import { FilterState } from "@/components/cupons-filters"
import { CupomDetailsModal } from "@/components/cupom-details-modal"
import { CupomItemsModal } from "@/components/cupom-items-modal"
import { ConfiguracoesModal } from "@/components/configuracoes-modal"
import { DuplicatasModal } from "@/components/duplicatas-modal"
import { ConfiguracoesProvider } from "@/contexts/configuracoes-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { UserHeader } from "@/components/user-header"
import { cupomApi } from "@/lib/api"
import { CupomFiscal, CupomFiscalInput } from "@/types/cupom"
import { useToast } from "@/hooks/use-toast"
import { calculateReembolsoValue, detectarCuponsDuplicados } from "@/lib/utils"

export default function App() {
  const [cupons, setCupons] = React.useState<CupomFiscal[]>([])
  const [filteredCupons, setFilteredCupons] = React.useState<CupomFiscal[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasApiError, setHasApiError] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'form'>('dashboard')
  const [editingCupom, setEditingCupom] = React.useState<CupomFiscal | undefined>(undefined)
  const [viewingCupom, setViewingCupom] = React.useState<CupomFiscal | undefined>(undefined)
  const [viewingItemsCupom, setViewingItemsCupom] = React.useState<CupomFiscal | undefined>(undefined)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)
  const [isItemsModalOpen, setIsItemsModalOpen] = React.useState(false)
  const [isConfiguracoesModalOpen, setIsConfiguracoesModalOpen] = React.useState(false)
  const [isDuplicatasModalOpen, setIsDuplicatasModalOpen] = React.useState(false)
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deletingCupom, setDeletingCupom] = React.useState<CupomFiscal | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)

  const [filters, setFilters] = React.useState<FilterState>({
    dataInicio: undefined,
    dataFim: undefined,
    status: "todos",
    motorista: "",
    cnpj: ""
  })

  const { toast } = useToast()

  // Load cupons on mount
  React.useEffect(() => {
    loadCupons()
  }, [])

  // Filter cupons based on search query and advanced filters
  React.useEffect(() => {
    let filtered = cupons

    // Apply search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cupom => 
        cupom.informacoesTransacao.numeroCupom.toLowerCase().includes(query) ||
        cupom.dadosEstabelecimento.cnpj.toLowerCase().includes(query) ||
        cupom.dadosEstabelecimento.razaoSocial.toLowerCase().includes(query) ||
        cupom.dadosMotorista.celular.toLowerCase().includes(query) ||
        cupom.observacoes?.toLowerCase().includes(query)
      )
    }

    // Apply advanced filters
    if (filters.dataInicio) {
      filtered = filtered.filter(cupom => 
        new Date(cupom.informacoesTransacao.data) >= filters.dataInicio!
      )
    }

    if (filters.dataFim) {
      filtered = filtered.filter(cupom => 
        new Date(cupom.informacoesTransacao.data) <= filters.dataFim!
      )
    }

    if (filters.status !== "todos") {
      filtered = filtered.filter(cupom => cupom.status === filters.status)
    }

    if (filters.motorista) {
      filtered = filtered.filter(cupom => 
        cupom.dadosMotorista.celular.toLowerCase().includes(filters.motorista.toLowerCase())
      )
    }

    if (filters.cnpj) {
      filtered = filtered.filter(cupom => 
        cupom.dadosEstabelecimento.cnpj.toLowerCase().includes(filters.cnpj.toLowerCase())
      )
    }

    setFilteredCupons(filtered)
  }, [searchQuery, filters, cupons])

  const loadCupons = async () => {
    try {
      setIsLoading(true)
      setHasApiError(false)
      console.log('Iniciando carregamento dos cupons...')
      const data = await cupomApi.getAllCupons()
      console.log('Cupons carregados:', data.length)
      setCupons(data)
      setFilteredCupons(data)
    } catch (error) {
      console.error('Erro ao carregar cupons:', error)
      setHasApiError(true)
      // Definir dados vazios em caso de erro para evitar tela branca
      setCupons([])
      setFilteredCupons([])
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível carregar os cupons fiscais. A aplicação funcionará offline.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCupom = async (data: CupomFiscalInput) => {
    try {
      setIsSubmitting(true)
      const newCupom = await cupomApi.createCupom(data)
      setCupons(prev => [newCupom, ...prev])
      setCurrentView('dashboard')
      setEditingCupom(undefined)
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCupom = async (data: CupomFiscalInput) => {
    if (!editingCupom) return

    try {
      setIsSubmitting(true)
      const updatedCupom = await cupomApi.updateCupom(editingCupom.id, data)
      setCupons(prev => prev.map(c => c.id === editingCupom.id ? updatedCupom : c))
      setCurrentView('dashboard')
      setEditingCupom(undefined)
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewCupom = (cupom: CupomFiscal) => {
    setViewingCupom(cupom)
    setIsDetailModalOpen(true)
  }

  const handleViewItems = (cupom: CupomFiscal) => {
    setViewingItemsCupom(cupom)
    setIsItemsModalOpen(true)
  }

  const handleEditCupom = (cupom: CupomFiscal) => {
    setEditingCupom(cupom)
    setCurrentView('form')
  }

  const handleDeleteCupom = (cupom: CupomFiscal) => {
    setDeletingCupom(cupom)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteCupom = async () => {
    if (!deletingCupom) return

    try {
      await cupomApi.deleteCupom(deletingCupom.id)
      setCupons(prev => prev.filter(c => c.id !== deletingCupom.id))
      toast({
        title: "Cupom excluído",
        description: "O cupom foi removido com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cupom.",
        variant: "destructive",
      })
    } finally {
      setDeletingCupom(null)
      setIsDeleteModalOpen(false)
    }
  }

  const handleUpdateStatus = async (cupom: CupomFiscal, newStatus: 'PAGO' | 'Pendente' | 'Cancelado') => {
    try {
      // Tentar atualizar o status na API
      const updatedCupom = await cupomApi.updateCupomStatus(cupom.id, newStatus)
      
      // Atualizar o estado local com os dados atualizados da API
      setCupons(prev => prev.map(c => 
        c.id === cupom.id 
          ? updatedCupom
          : c
      ))
      
      toast({
        title: "Status atualizado",
        description: `Status do cupom ${cupom.informacoesTransacao.numeroCupom} alterado para ${newStatus}.`,
      })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do cupom na API.",
        variant: "destructive",
      })
    }
  }

  const handleBulkAction = async (selectedCupons: CupomFiscal[]) => {
    try {
      // Atualizar o status de todos os cupons selecionados para 'PAGO' na API
      const updatePromises = selectedCupons.map(cupom => 
        cupomApi.updateCupomStatus(cupom.id, 'PAGO')
      )
      
      const updatedCupons = await Promise.all(updatePromises)
      
      // Atualizar o estado local com os dados atualizados da API
      setCupons(prev => {
        const updatedMap = new Map(updatedCupons.map(cupom => [cupom.id, cupom]))
        return prev.map(c => updatedMap.get(c.id) || c)
      })
      
      toast({
        title: "Baixa realizada",
        description: `${selectedCupons.length} cupon${selectedCupons.length > 1 ? 's' : ''} marcado${selectedCupons.length > 1 ? 's' : ''} como PAGO.`,
      })
    } catch (error) {
      console.error('Erro ao processar baixa em lote:', error)
      toast({
        title: "Erro",
        description: "Não foi possível processar a baixa dos cupons selecionados na API.",
        variant: "destructive",
      })
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleClearFilters = () => {
    setFilters({
      dataInicio: undefined,
      dataFim: undefined,
      status: "todos",
      motorista: "",
      cnpj: ""
    })
  }

  const totalValue = cupons.reduce((sum, cupom) => sum + cupom.totais.valorTotal, 0)
  const totalReembolso = cupons.reduce((sum, cupom) => sum + calculateReembolsoValue(cupom), 0)
  
  // Calcular cupons duplicados
  const cuponsDuplicados = detectarCuponsDuplicados(cupons)
  const totalDuplicatas = Array.from(cuponsDuplicados.values()).reduce((sum, cuponsList) => sum + cuponsList.length, 0)

  return (
    <AuthProvider>
      <ProtectedRoute>
        <ConfiguracoesProvider>
          <div className={isDarkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-background text-foreground">
              <div className="container mx-auto p-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Gestão de Cupons Fiscais
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema para cadastro e consulta de cupons fiscais
                {hasApiError && (
                  <span className="ml-2 text-orange-600 font-medium">
                    (Modo Offline)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {hasApiError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCupons}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Reconectar API
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              {currentView === 'dashboard' && (
                <>
                  <Button onClick={() => setCurrentView('form')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cupom
                  </Button>
                  <Button variant="outline" onClick={() => setIsConfiguracoesModalOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </>
              )}
              
              <UserHeader />
            </div>
          </motion.header>

          {currentView === 'dashboard' ? (
            <>
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Cupons
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold">{cupons.length}</div>
                    <p className="text-xs text-muted-foreground">
                      cupons cadastrados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Valor Total
                    </CardTitle>
                    <div className="text-green-600">R$</div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(totalValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      soma de todos os cupons
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Valor Reembolso
                    </CardTitle>
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(totalReembolso)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      total disponível para reembolso
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Com Observações
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold">
                      {cupons.filter(c => c.observacoes && c.observacoes.trim() !== '').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      cupons com observações
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={totalDuplicatas > 0 ? "cursor-pointer hover:bg-orange-50 transition-colors" : ""}
                  onClick={() => totalDuplicatas > 0 && setIsDuplicatasModalOpen(true)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cupons Duplicados
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {totalDuplicatas}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cuponsDuplicados.size > 0 ? `${cuponsDuplicados.size} grupos de duplicatas` : 'nenhuma duplicata encontrada'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

                            {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 mb-4"
              >
                {/* Search Bar and Status Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar por número, CNPJ, estabelecimento, celular ou observações..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <Select
                    value={filters.status}
                    onValueChange={(value: string) => {
                      const newFilters = { ...filters, status: value as any }
                      setFilters(newFilters)
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      {filters.status === "todos" ? (
                        <Filter className="w-4 h-4 mr-2" />
                      ) : filters.status === "PAGO" ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      ) : filters.status === "Pendente" ? (
                        <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                      )}
                      <SelectValue 
                        placeholder="Status"
                        className={filters.status === "PAGO" ? "text-green-700 font-medium" : 
                                  filters.status === "Pendente" ? "text-yellow-700 font-medium" : 
                                  filters.status === "Cancelado" ? "text-red-700 font-medium" : ""}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          Todos os Status
                        </div>
                      </SelectItem>
                      <SelectItem value="PAGO">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-medium">PAGO</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Pendente">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-700 font-medium">Pendente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Cancelado">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-700 font-medium">Cancelado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Period Filters */}
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Período:</span>
                  </div>
                  <DatePicker
                    date={filters.dataInicio}
                    onSelect={(date) => {
                      const newFilters = { ...filters, dataInicio: date }
                      setFilters(newFilters)
                    }}
                    placeholder="Data Início"
                  />
                  <span className="text-sm text-muted-foreground">até</span>
                  <DatePicker
                    date={filters.dataFim}
                    onSelect={(date) => {
                      const newFilters = { ...filters, dataFim: date }
                      setFilters(newFilters)
                    }}
                    placeholder="Data Fim"
                  />
                  {(filters.dataInicio || filters.dataFim || filters.status !== "todos") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CuponsTable
                  cupons={filteredCupons}
                  onView={handleViewCupom}
                  onEdit={handleEditCupom}
                  onDelete={handleDeleteCupom}
                  onViewItems={handleViewItems}
                  onBulkAction={handleBulkAction}
                  onUpdateStatus={handleUpdateStatus}
                  isLoading={isLoading}
                />
              </motion.div>
            </>
          ) : (
            <CupomForm
              cupom={editingCupom}
              onSave={editingCupom ? handleUpdateCupom : handleCreateCupom}
              onCancel={() => {
                setCurrentView('dashboard')
                setEditingCupom(undefined)
              }}
              isLoading={isSubmitting}
              cuponsExistentes={cupons}
            />
          )}

          {/* Detail Modal */}
          <CupomDetailsModal
            cupom={viewingCupom || undefined}
            open={isDetailModalOpen}
            onOpenChange={(open) => {
              setIsDetailModalOpen(open)
              if (!open) setViewingCupom(undefined)
            }}
          />

          {/* Items Modal */}
          <CupomItemsModal
            cupom={viewingItemsCupom || undefined}
            open={isItemsModalOpen}
            onOpenChange={(open) => {
              setIsItemsModalOpen(open)
              if (!open) setViewingItemsCupom(undefined)
            }}
          />

          {/* Configurações Modal */}
          <ConfiguracoesModal
            open={isConfiguracoesModalOpen}
            onOpenChange={setIsConfiguracoesModalOpen}
          />

          {/* Duplicatas Modal */}
          <DuplicatasModal
            cuponsDuplicados={cuponsDuplicados}
            open={isDuplicatasModalOpen}
            onOpenChange={setIsDuplicatasModalOpen}
          />

          {/* Delete Confirmation Modal */}
          {deletingCupom && isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Confirmar Exclusão</h3>
                    <p className="text-sm text-muted-foreground">
                      Esta ação não pode ser desfeita.
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Você está prestes a excluir o cupom:
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium text-sm">
                      Nº {deletingCupom.informacoesTransacao.numeroCupom}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {deletingCupom.dadosEstabelecimento.razaoSocial} - {deletingCupom.dadosEstabelecimento.cnpj}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Valor: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(deletingCupom.totais.valorTotal)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeletingCupom(null)
                      setIsDeleteModalOpen(false)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDeleteCupom}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Cupom
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          <Toaster />
              </div>
            </div>
          </div>
        </ConfiguracoesProvider>
      </ProtectedRoute>
    </AuthProvider>
  )
} 