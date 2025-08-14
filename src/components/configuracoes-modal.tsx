import * as React from "react"
import { motion } from "framer-motion"
import { X, Phone, User, Settings as SettingsIcon, Plus, Trash2, Edit, Save, X as XIcon, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useConfiguracoes } from "@/contexts/configuracoes-context"
import { UsersProvider } from "@/contexts/users-context"
import { UsersManagement } from "@/components/users-management"
import { useToast } from "@/hooks/use-toast"

interface ConfiguracoesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfiguracoesModal({ open, onOpenChange }: ConfiguracoesModalProps) {
  const [activeTab, setActiveTab] = React.useState("telefoneXmotorista")
  
  // Estados para empresas
  const [nomeEmpresa, setNomeEmpresa] = React.useState("")
  const [cnpjEmpresa, setCnpjEmpresa] = React.useState("")
  const [telefoneEmpresa, setTelefoneEmpresa] = React.useState("")
  const [editingEmpresaId, setEditingEmpresaId] = React.useState<number | null>(null)
  const [editNomeEmpresa, setEditNomeEmpresa] = React.useState("")
  const [editCnpjEmpresa, setEditCnpjEmpresa] = React.useState("")
  const [editTelefoneEmpresa, setEditTelefoneEmpresa] = React.useState("")
  const [isAddingEmpresa, setIsAddingEmpresa] = React.useState(false)
  
  // Estados para itens proibidos
  const [produto, setProduto] = React.useState("")
  const [grupo, setGrupo] = React.useState("")
  const [tipoItem, setTipoItem] = React.useState<"produto" | "grupo">("produto") // Novo estado para definir o tipo
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null)
  const [editProduto, setEditProduto] = React.useState("")
  const [editGrupo, setEditGrupo] = React.useState("")
  const [editTipoItem, setEditTipoItem] = React.useState<"produto" | "grupo">("produto")
  const [isAddingItem, setIsAddingItem] = React.useState(false)
  
  // Estados para vinculos telefone/motorista
  const [telefone, setTelefone] = React.useState("")
  const [motorista, setMotorista] = React.useState("")
  const [editingVinculoId, setEditingVinculoId] = React.useState<string | null>(null)
  const [editTelefone, setEditTelefone] = React.useState("")
  const [editMotorista, setEditMotorista] = React.useState("")
  const [isAddingVinculo, setIsAddingVinculo] = React.useState(false)

  const { 
    empresas,
    addEmpresa,
    removeEmpresa,
    updateEmpresa,
    telefoneMotoristaConfigs,
    addTelefoneMotoristaConfig,
    removeTelefoneMotoristaConfig,
    updateTelefoneMotoristaConfig,
    itensNaoReembolsaveis,
    addItemNaoReembolsavel,
    removeItemNaoReembolsavel,
    updateItemNaoReembolsavel
  } = useConfiguracoes()
  const { toast } = useToast()

  // Debug logs
  console.log("ConfiguracoesModal renderizando:", {
    telefoneMotoristaConfigs: telefoneMotoristaConfigs?.length,
    empresas: empresas?.length,
    isAddingVinculo
  })

  // Funções para gerenciar empresas
  const handleAddEmpresa = () => {
    if (!nomeEmpresa.trim() || !cnpjEmpresa.trim()) {
      toast({
        title: "Erro",
        description: "Nome e CNPJ são obrigatórios",
        variant: "destructive"
      })
      return
    }

    addEmpresa(nomeEmpresa.trim(), cnpjEmpresa.trim(), telefoneEmpresa.trim())
    setNomeEmpresa("")
    setCnpjEmpresa("")
    setTelefoneEmpresa("")
    setIsAddingEmpresa(false)
    
    toast({
      title: "Sucesso",
      description: "Empresa adicionada com sucesso"
    })
  }

  const handleUpdateEmpresa = (id: string) => {
    if (!editNomeEmpresa.trim() || !editCnpjEmpresa.trim()) {
      toast({
        title: "Erro",
        description: "Nome e CNPJ são obrigatórios",
        variant: "destructive"
      })
      return
    }

    updateEmpresa(id, editNomeEmpresa.trim(), editCnpjEmpresa.trim(), editTelefoneEmpresa.trim())
    setEditingEmpresaId(null)
    setEditNomeEmpresa("")
    setEditCnpjEmpresa("")
    setEditTelefoneEmpresa("")
    
    toast({
      title: "Sucesso",
      description: "Empresa atualizada com sucesso"
    })
  }

  const handleRemoveEmpresa = (id: number) => {
    removeEmpresa(id)
    toast({
      title: "Sucesso",
      description: "Empresa removida com sucesso"
    })
  }

  const startEditEmpresa = (empresa: any) => {
    setEditingEmpresaId(empresa.id)
    setEditNomeEmpresa(empresa.nome)
    setEditCnpjEmpresa(empresa.cnpj)
    setEditTelefoneEmpresa(empresa.telefone || "")
  }

  // Funções para gerenciar vínculos telefone/motorista/empresa
  const handleAddVinculo = () => {
    try {
      console.log("Iniciando handleAddVinculo...", { telefone, motorista })
      
      if (!telefone.trim() || !motorista.trim()) {
        toast({
          title: "Erro",
          description: "Telefone e nome do motorista são obrigatórios",
          variant: "destructive"
        })
        return
      }

      console.log("Chamando addTelefoneMotoristaConfig...")
      addTelefoneMotoristaConfig(telefone.trim(), motorista.trim())
      
      console.log("Limpando formulário...")
      setTelefone("")
      setMotorista("")
      setIsAddingVinculo(false)
      
      toast({
        title: "Sucesso",
        description: "Vínculo adicionado com sucesso"
      })
      console.log("handleAddVinculo finalizado com sucesso")
    } catch (error) {
      console.error("Erro em handleAddVinculo:", error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar vínculo",
        variant: "destructive"
      })
    }
  }

  const handleUpdateVinculo = (id: string) => {
    if (!editTelefone.trim() || !editMotorista.trim()) {
      toast({
        title: "Erro",
        description: "Telefone e nome do motorista são obrigatórios",
        variant: "destructive"
      })
      return
    }

    updateTelefoneMotoristaConfig(id, editTelefone.trim(), editMotorista.trim())
    setEditingVinculoId(null)
    setEditTelefone("")
    setEditMotorista("")
    
    toast({
      title: "Sucesso",
      description: "Vínculo atualizado com sucesso"
    })
  }

  const handleRemoveVinculo = (id: string) => {
    removeTelefoneMotoristaConfig(id)
    toast({
      title: "Sucesso",
      description: "Vínculo removido com sucesso"
    })
  }

  const startEditVinculo = (vinculo: any) => {
    setEditingVinculoId(vinculo.id)
    setEditTelefone(vinculo.telefone)
    setEditMotorista(vinculo.motorista)
  }

  // Função auxiliar para buscar nome da empresa pelo ID
  const getEmpresaName = (empresaId: number) => {
    if (!empresaId) return "-"
    const empresa = empresas.find(e => e.id === empresaId)
    return empresa ? empresa.nome : "Empresa não encontrada"
  }

  // Funções para gerenciar itens proibidos
  const handleAddItem = async () => {
    // Validação baseada no tipo selecionado
    if (tipoItem === "produto" && !produto.trim()) {
      toast({
        title: "Erro",
        description: "Nome do produto é obrigatório",
        variant: "destructive"
      })
      return
    }
    
    if (tipoItem === "grupo" && !grupo.trim()) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      })
      return
    }

    setIsAddingItem(true)
    try {
      // Salvar com a nova lógica: se for produto, salva no campo descricao; se for grupo, salva no campo categoria
      if (tipoItem === "produto") {
        await addItemNaoReembolsavel(produto.trim(), "PRODUTO") // Categoria especial para identificar que é produto específico
      } else {
        await addItemNaoReembolsavel(grupo.trim(), "GRUPO") // Categoria especial para identificar que é grupo
      }
      
      setProduto("")
      setGrupo("")
      setTipoItem("produto")
      toast({
        title: "Sucesso",
        description: `${tipoItem === "produto" ? "Produto" : "Grupo"} proibido adicionado com sucesso`
      })
    } catch (error) {
      console.error('Erro ao adicionar item proibido:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item proibido. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsAddingItem(false)
    }
  }

  const handleUpdateItem = (id: string) => {
    // Validação baseada no tipo selecionado
    if (editTipoItem === "produto" && !editProduto.trim()) {
      toast({
        title: "Erro",
        description: "Nome do produto é obrigatório",
        variant: "destructive"
      })
      return
    }
    
    if (editTipoItem === "grupo" && !editGrupo.trim()) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      })
      return
    }

    // Atualizar com a nova lógica
    if (editTipoItem === "produto") {
      updateItemNaoReembolsavel(id, editProduto.trim(), "PRODUTO")
    } else {
      updateItemNaoReembolsavel(id, editGrupo.trim(), "GRUPO")
    }
    
    setEditingItemId(null)
    setEditProduto("")
    setEditGrupo("")
    setEditTipoItem("produto")
    
    toast({
      title: "Sucesso",
      description: "Item proibido atualizado com sucesso"
    })
  }

  const handleRemoveItem = (id: string) => {
    removeItemNaoReembolsavel(id)
    toast({
      title: "Sucesso",
      description: "Item proibido removido com sucesso"
    })
  }

  const startEditItem = (item: any) => {
    setEditingItemId(item.id)
    
    // Determinar o tipo baseado na categoria
    if (item.categoria === "PRODUTO") {
      setEditTipoItem("produto")
      setEditProduto(item.descricao)
      setEditGrupo("")
    } else if (item.categoria === "GRUPO") {
      setEditTipoItem("grupo")
      setEditProduto("")
      setEditGrupo(item.descricao)
    } else {
      // Para compatibilidade com dados antigos
      setEditTipoItem("produto")
      setEditProduto(item.descricao)
      setEditGrupo(item.categoria || "")
    }
  }
  
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg border bg-background shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Configurações</h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie as configurações do sistema
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="telefoneXmotorista" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Vinculo de Motorista</span>
                  <span className="sm:hidden">Telefone</span>
                </TabsTrigger>
                <TabsTrigger value="empresa" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Transportadora</span>
                  <span className="sm:hidden">Transportadora</span>
                </TabsTrigger>
                <TabsTrigger value="itens-nao-reembolsaveis" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Itens Proibidos</span>
                  <span className="sm:hidden">Itens</span>
                </TabsTrigger>
                <TabsTrigger value="usuarios" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Usuários</span>
                  <span className="sm:hidden">Usuários</span>
                </TabsTrigger>
                <TabsTrigger value="sistema" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sistema</span>
                  <span className="sm:hidden">Sistema</span>
                </TabsTrigger>
              </TabsList>

                             {/* Aba Vinculo de Motorista */}
               <TabsContent value="telefoneXmotorista" className="mt-6">
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Phone className="h-5 w-5" />
                       Vinculo de Motorista
                     </CardTitle>
                                         <CardDescription>
                      Configure a relação entre telefone, motorista e transportadora
                    </CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     

                     {/* Lista de vínculos existentes */}
                     {telefoneMotoristaConfigs && telefoneMotoristaConfigs.length > 0 && (
                       <div className="border rounded-lg">
                         <div className="p-3 bg-gray-50 border-b">
                           <h4 className="font-medium">Vínculos Cadastrados</h4>
                         </div>
                         <div className="p-3 space-y-2">
                           {telefoneMotoristaConfigs.map((config) => (
                             <div key={config.id} className="flex justify-between items-center p-2 bg-white border rounded">
                               <div>
                                 <p className="font-medium">{config.motorista}</p>
                                 <p className="text-sm text-gray-600">{config.telefone}</p>
                                 {config.empresa && (
                                   <p className="text-xs text-blue-600">
                                     Transportadora: {empresas.find(e => e.id === config.empresa)?.nome || 'N/A'}
                                   </p>
                                 )}
                               </div>
                               <button 
                                 onClick={() => removeTelefoneMotoristaConfig(config.id)}
                                 className="text-red-500 hover:text-red-700"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                     {/* Botão para adicionar novo vínculo */}
                     {!isAddingVinculo && (
                       <Button
                         onClick={() => setIsAddingVinculo(true)}
                         className="w-full"
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         Adicionar Novo Vínculo
                       </Button>
                     )}

                     {/* Formulário para adicionar vínculo */}
                     {isAddingVinculo && (
                       <Card>
                         <CardHeader>
                           <CardTitle className="text-lg">Novo Vínculo Telefone/Motorista</CardTitle>
                                                     <CardDescription>
                            Vincule um número de telefone a um motorista e transportadora
                          </CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                               <Label htmlFor="motorista">Nome do Motorista</Label>
                               <Input
                                 id="motorista"
                                 value={motorista}
                                 onChange={(e) => setMotorista(e.target.value)}
                                 placeholder="Nome completo do motorista"
                               />
                             </div>
                             <div>
                               <Label htmlFor="telefone">Telefone</Label>
                               <Input
                                 id="telefone"
                                 value={telefone}
                                 onChange={(e) => setTelefone(e.target.value)}
                                 placeholder="(11) 99999-9999"
                                 type="tel"
                               />
                             </div>
                             <div>
                               <Label htmlFor="empresaVinculo">Transportadora (Opcional)</Label>
                               <select 
                                 value={""} 
                                 onChange={(e) => {}}
                                 className="w-full p-2 border rounded"
                               >
                                 <option value="">Nenhuma transportadora</option>
                                 {empresas.map((empresa) => (
                                   <option key={empresa.id} value={empresa.id}>
                                     {empresa.nome}
                                   </option>
                                 ))}
                               </select>
                               {empresas.length === 0 && (
                                 <p className="text-xs text-muted-foreground mt-1">
                                   Cadastre transportadoras na aba "Transportadora" para vinculá-las
                                 </p>
                               )}
                             </div>
                           </div>
                           <div className="flex gap-2 justify-end">
                             <Button
                               variant="outline"
                               onClick={() => {
                                 setIsAddingVinculo(false)
                                 setTelefone("")
                                 setMotorista("")
                               }}
                             >
                               <XIcon className="h-4 w-4 mr-2" />
                               Cancelar
                             </Button>
                             <Button onClick={handleAddVinculo}>
                               <Save className="h-4 w-4 mr-2" />
                               Salvar
                             </Button>
                           </div>
                         </CardContent>
                       </Card>
                     )}

                     {/* Lista de vínculos */}
                     {telefoneMotoristaConfigs.length > 0 && (
                       <div className="space-y-2">
                         <h3 className="text-lg font-medium">Vínculos Cadastrados</h3>
                         <div className="border rounded-lg">
                           <div className="p-4 border-b bg-muted/50">
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm font-medium">
                               <span>Motorista</span>
                               <span>Telefone</span>
                               <span>Transportadora</span>
                               <span>Ações</span>
                             </div>
                           </div>
                           <div className="divide-y">
                             {telefoneMotoristaConfigs.map((vinculo) => (
                               <div key={vinculo.id} className="p-4">
                                 {editingVinculoId === vinculo.id ? (
                                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                     <Input
                                       value={editMotorista}
                                       onChange={(e) => setEditMotorista(e.target.value)}
                                       placeholder="Nome do motorista"
                                     />
                                     <Input
                                       value={editTelefone}
                                       onChange={(e) => setEditTelefone(e.target.value)}
                                       placeholder="Telefone"
                                       type="tel"
                                     />
                                     <Select value={""} onValueChange={() => {}}>
                                       <SelectTrigger>
                                         <SelectValue placeholder="Selecione uma transportadora" />
                                       </SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="">Nenhuma transportadora</SelectItem>
                                         {empresas.map((empresa) => (
                                           <SelectItem key={empresa.id} value={empresa.id}>
                                             {empresa.nome}
                                           </SelectItem>
                                         ))}
                                       </SelectContent>
                                     </Select>
                                     <div className="flex gap-2">
                                       <Button
                                         size="sm"
                                         onClick={() => handleUpdateVinculo(vinculo.id)}
                                       >
                                         <Save className="h-3 w-3 mr-1" />
                                         Salvar
                                       </Button>
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         onClick={() => {
                                           setEditingVinculoId(null)
                                           setEditTelefone("")
                                           setEditMotorista("")
                                         }}
                                       >
                                         <XIcon className="h-3 w-3 mr-1" />
                                         Cancelar
                                       </Button>
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                     <div className="text-sm font-medium">{vinculo.motorista}</div>
                                     <div className="font-mono text-sm">{vinculo.telefone}</div>
                                     <div className="text-sm">{getEmpresaName(vinculo.empresa)}</div>
                                     <div className="flex gap-2">
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => startEditVinculo(vinculo)}
                                       >
                                         <Edit className="h-4 w-4" />
                                       </Button>
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => handleRemoveVinculo(vinculo.id)}
                                       >
                                         <Trash2 className="h-4 w-4" />
                                       </Button>
                                     </div>
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     )}

                     {telefoneMotoristaConfigs.length === 0 && !isAddingVinculo && (
                       <div className="text-center text-muted-foreground py-8">
                         <p>Nenhum vínculo cadastrado</p>
                         <p className="text-sm">Clique no botão acima para adicionar um vínculo</p>
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </TabsContent>

              {/* Aba Empresa */}
              <TabsContent value="empresa" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      Transportadoras
                    </CardTitle>
                    <CardDescription>
                      Configure as transportadoras do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Botão para adicionar nova transportadora */}
                    {!isAddingEmpresa && (
                      <Button
                        onClick={() => setIsAddingEmpresa(true)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Nova Transportadora
                      </Button>
                    )}

                    {/* Formulário para adicionar transportadora */}
                    {isAddingEmpresa && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Nova Transportadora</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="nomeEmpresa">Nome da Transportadora</Label>
                            <Input
                              id="nomeEmpresa"
                              value={nomeEmpresa}
                              onChange={(e) => setNomeEmpresa(e.target.value)}
                              placeholder="Digite o nome da transportadora"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cnpjEmpresa">CNPJ</Label>
                            <Input
                              id="cnpjEmpresa"
                              value={cnpjEmpresa}
                              onChange={(e) => setCnpjEmpresa(e.target.value)}
                              placeholder="Digite o CNPJ"
                            />
                          </div>
                          <div>
                            <Label htmlFor="telefoneEmpresa">Telefone</Label>
                            <Input
                              id="telefoneEmpresa"
                              value={telefoneEmpresa}
                              onChange={(e) => setTelefoneEmpresa(e.target.value)}
                              placeholder="Digite o telefone"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddingEmpresa(false)
                                setNomeEmpresa("")
                                setCnpjEmpresa("")
                                setTelefoneEmpresa("")
                              }}
                            >
                              <XIcon className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button onClick={handleAddEmpresa}>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Lista de transportadoras */}
                    {empresas.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Transportadoras Cadastradas</h3>
                        {empresas.map((empresa) => (
                          <Card key={empresa.id}>
                            <CardContent className="p-4">
                              {editingEmpresaId === empresa.id ? (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor={`editNome-${empresa.id}`}>Nome da Transportadora</Label>
                                    <Input
                                      id={`editNome-${empresa.id}`}
                                      value={editNomeEmpresa}
                                      onChange={(e) => setEditNomeEmpresa(e.target.value)}
                                      placeholder="Digite o nome da transportadora"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`editCnpj-${empresa.id}`}>CNPJ</Label>
                                    <Input
                                      id={`editCnpj-${empresa.id}`}
                                      value={editCnpjEmpresa}
                                      onChange={(e) => setEditCnpjEmpresa(e.target.value)}
                                      placeholder="Digite o CNPJ"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`editTelefone-${empresa.id}`}>Telefone</Label>
                                    <Input
                                      id={`editTelefone-${empresa.id}`}
                                      value={editTelefoneEmpresa}
                                      onChange={(e) => setEditTelefoneEmpresa(e.target.value)}
                                      placeholder="Digite o telefone"
                                    />
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setEditingEmpresaId(null)
                                        setEditNomeEmpresa("")
                                        setEditCnpjEmpresa("")
                                        setEditTelefoneEmpresa("")
                                      }}
                                    >
                                      <XIcon className="h-4 w-4 mr-2" />
                                      Cancelar
                                    </Button>
                                    <Button onClick={() => handleUpdateEmpresa(empresa.id)}>
                                      <Save className="h-4 w-4 mr-2" />
                                      Salvar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <h4 className="font-medium">{empresa.nome}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      CNPJ: {empresa.cnpj}
                                    </p>
                                    {empresa.telefone && (
                                      <p className="text-sm text-muted-foreground">
                                        Telefone: {empresa.telefone}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => startEditEmpresa(empresa)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRemoveEmpresa(empresa.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {empresas.length === 0 && !isAddingEmpresa && (
                      <div className="text-center text-muted-foreground py-8">
                        <p>Nenhuma transportadora cadastrada</p>
                        <p className="text-sm">Clique no botão acima para adicionar uma transportadora</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

                             {/* Aba Itens Proibidos */}
               <TabsContent value="itens-nao-reembolsaveis" className="mt-6">
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Package className="h-5 w-5" />
                       Itens Proibidos
                     </CardTitle>
                     <CardDescription>
                       Configure produtos que não podem ser reembolsados
                     </CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     {/* Botão para adicionar novo item */}
                     {!isAddingItem && (
                       <Button
                         onClick={() => setIsAddingItem(true)}
                         className="w-full"
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         Adicionar Novo Item Proibido
                       </Button>
                     )}

                     {/* Formulário para adicionar item */}
                     {isAddingItem && (
                       <Card>
                         <CardHeader>
                           <CardTitle className="text-lg">Novo Item Proibido</CardTitle>
                           <CardDescription>
                             Escolha se deseja bloquear um produto específico ou um grupo inteiro de produtos
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-4">
                           <div>
                             <Label htmlFor="tipoItem">Tipo de Bloqueio</Label>
                             <Select value={tipoItem} onValueChange={(value: "produto" | "grupo") => setTipoItem(value)}>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecione o tipo" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="produto">Produto Específico</SelectItem>
                                 <SelectItem value="grupo">Grupo de Produtos</SelectItem>
                               </SelectContent>
                             </Select>
                             <p className="text-xs text-muted-foreground mt-1">
                               {tipoItem === "produto" 
                                 ? "Bloqueia apenas o produto específico (ex: Coca-Cola)" 
                                 : "Bloqueia TODOS os produtos do grupo (ex: todos os refrigerantes)"
                               }
                             </p>
                           </div>
                           
                           {tipoItem === "produto" ? (
                             <div>
                               <Label htmlFor="produto">Nome do Produto</Label>
                               <Input
                                 id="produto"
                                 value={produto}
                                 onChange={(e) => setProduto(e.target.value)}
                                 placeholder="Ex: Coca-Cola, Pepsi, Doritos..."
                               />
                             </div>
                           ) : (
                             <div>
                               <Label htmlFor="grupo">Nome do Grupo</Label>
                               <Input
                                 id="grupo"
                                 value={grupo}
                                 onChange={(e) => setGrupo(e.target.value)}
                                 placeholder="Ex: Refrigerante, Salgadinho, Bebida Alcoólica..."
                               />
                             </div>
                           )}
                           
                           <div className="flex gap-2 justify-end">
                             <Button
                               variant="outline"
                               onClick={() => {
                                 setIsAddingItem(false)
                                 setProduto("")
                                 setGrupo("")
                                 setTipoItem("produto")
                               }}
                             >
                               <XIcon className="h-4 w-4 mr-2" />
                               Cancelar
                             </Button>
                             <Button onClick={handleAddItem} disabled={isAddingItem}>
                               <Save className="h-4 w-4 mr-2" />
                               Salvar
                             </Button>
                           </div>
                         </CardContent>
                       </Card>
                     )}

                     {/* Lista de itens proibidos */}
                     {itensNaoReembolsaveis.length > 0 && (
                       <div className="space-y-2">
                         <h3 className="text-lg font-medium">Itens Proibidos Cadastrados</h3>
                         <div className="border rounded-lg">
                           <div className="p-4 border-b bg-muted/50">
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm font-medium">
                               <span>Código</span>
                               <span>Nome</span>
                               <span>Tipo</span>
                               <span>Ações</span>
                             </div>
                           </div>
                           <div className="divide-y">
                             {itensNaoReembolsaveis.map((item) => (
                               <div key={item.id} className="p-4">
                                 {editingItemId === item.id ? (
                                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                     <div className="font-mono text-sm text-muted-foreground">
                                       {item.codigo}
                                     </div>
                                     <div className="space-y-2">
                                       <Select value={editTipoItem} onValueChange={(value: "produto" | "grupo") => setEditTipoItem(value)}>
                                         <SelectTrigger>
                                           <SelectValue />
                                         </SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="produto">Produto Específico</SelectItem>
                                           <SelectItem value="grupo">Grupo de Produtos</SelectItem>
                                         </SelectContent>
                                       </Select>
                                       {editTipoItem === "produto" ? (
                                         <Input
                                           value={editProduto}
                                           onChange={(e) => setEditProduto(e.target.value)}
                                           placeholder="Nome do produto"
                                         />
                                       ) : (
                                         <Input
                                           value={editGrupo}
                                           onChange={(e) => setEditGrupo(e.target.value)}
                                           placeholder="Nome do grupo"
                                         />
                                       )}
                                     </div>
                                     <div className="text-sm text-muted-foreground">
                                       {editTipoItem === "produto" ? "Produto Específico" : "Grupo de Produtos"}
                                     </div>
                                     <div className="flex gap-2">
                                       <Button
                                         size="sm"
                                         onClick={() => handleUpdateItem(item.id)}
                                       >
                                         <Save className="h-3 w-3 mr-1" />
                                         Salvar
                                       </Button>
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         onClick={() => {
                                           setEditingItemId(null)
                                           setEditProduto("")
                                           setEditGrupo("")
                                           setEditTipoItem("produto")
                                         }}
                                       >
                                         <XIcon className="h-3 w-3 mr-1" />
                                         Cancelar
                                       </Button>
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                     <div className="font-mono text-sm">{item.codigo}</div>
                                     <div className="text-sm font-medium">{item.descricao}</div>
                                     <div className="text-sm">
                                       {item.categoria === "PRODUTO" ? (
                                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                           Produto Específico
                                         </span>
                                       ) : item.categoria === "GRUPO" ? (
                                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                           Grupo de Produtos
                                         </span>
                                       ) : (
                                         <span className="text-muted-foreground">-</span>
                                       )}
                                     </div>
                                     <div className="flex gap-2">
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => startEditItem(item)}
                                       >
                                         <Edit className="h-4 w-4" />
                                       </Button>
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => handleRemoveItem(item.id)}
                                       >
                                         <Trash2 className="h-4 w-4" />
                                       </Button>
                                     </div>
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     )}

                     {itensNaoReembolsaveis.length === 0 && !isAddingItem && (
                       <div className="text-center text-muted-foreground py-8">
                         <p>Nenhum item proibido cadastrado</p>
                         <p className="text-sm">Clique no botão acima para adicionar um item</p>
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </TabsContent>



              <TabsContent value="usuarios" className="mt-6">
                <UsersProvider>
                  <UsersManagement />
                </UsersProvider>
              </TabsContent>

              <TabsContent value="sistema" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Conteúdo em desenvolvimento...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
