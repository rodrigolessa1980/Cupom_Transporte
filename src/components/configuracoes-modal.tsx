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
  const [editingItemId, setEditingItemId] = React.useState<number | null>(null)
  const [editProduto, setEditProduto] = React.useState("")
  const [editGrupo, setEditGrupo] = React.useState("")
  const [editTipoItem, setEditTipoItem] = React.useState<"produto" | "grupo">("produto")
  const [isAddingItem, setIsAddingItem] = React.useState(false)
  // separa o estado de visibilidade do formulário do estado de salvamento
  const [isSavingItem, setIsSavingItem] = React.useState(false)
  
  // Estados para vinculos telefone/motorista
  const [telefone, setTelefone] = React.useState("")
  const [motorista, setMotorista] = React.useState("")
  const [empresaVinculoId, setEmpresaVinculoId] = React.useState<string>("__none")
  const [editingVinculoId, setEditingVinculoId] = React.useState<string | null>(null)
  const [editTelefone, setEditTelefone] = React.useState("")
  const [editMotorista, setEditMotorista] = React.useState("")
  const [editEmpresaVinculoId, setEditEmpresaVinculoId] = React.useState<string>("__none")
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
    updateItemNaoReembolsavel,
    refreshItensNaoReembolsaveis
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

  const handleUpdateEmpresa = (id: number) => {
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
  const handleAddVinculo = async () => {
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
  const empresaId = empresaVinculoId === '__none' ? undefined : (empresaVinculoId ? parseInt(empresaVinculoId) : undefined)
  await addTelefoneMotoristaConfig(motorista.trim(), telefone.trim(), empresaId)
      
      console.log("Limpando formulário...")
  setTelefone("")
  setMotorista("")
  setEmpresaVinculoId("__none")
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

  const handleUpdateVinculo = async (id: string) => {
    if (!editMotorista.trim()) {
      toast({
        title: "Erro",
        description: "Telefone e nome do motorista são obrigatórios",
        variant: "destructive"
      })
      return
    }
  const empresaId = editEmpresaVinculoId === '__none' ? undefined : (editEmpresaVinculoId ? parseInt(editEmpresaVinculoId) : undefined)
  await updateTelefoneMotoristaConfig(id, editMotorista.trim(), editTelefone.trim(), empresaId)
    setEditingVinculoId(null)
    setEditTelefone("")
    setEditMotorista("")
  setEditEmpresaVinculoId("__none")
    
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
  setEditEmpresaVinculoId(vinculo.empresa_id ? vinculo.empresa_id.toString() : "__none")
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

  console.log('handleAddItem called', { tipoItem, produto, grupo })
  // marcar início do fluxo de salvamento (estado separado da visibilidade do formulário)
  setIsSavingItem(true)
  console.log('isSavingItem -> true')
  try {
      if (tipoItem === "produto") {
        await addItemNaoReembolsavel(produto.trim(), undefined)
      } else {
        await addItemNaoReembolsavel(undefined, grupo.trim())
      }

      // limpar campos
      setProduto("")
      setGrupo("")
      setTipoItem("produto")

      // fechar formulário e resetar estado de salvamento
      setIsAddingItem(false)
      setIsSavingItem(false)
      console.log('isSavingItem -> false (success)')

      toast({
        title: "Sucesso",
        description: `${tipoItem === "produto" ? "Produto" : "Grupo"} proibido adicionado com sucesso`
      })

      // Recarregar itens em background
      refreshItensNaoReembolsaveis()
  } catch (error) {
      console.error('Erro ao adicionar item proibido:', error)
      // garantir que o estado de salvamento seja desfeito em caso de erro
      setIsSavingItem(false)
      console.log('isSavingItem -> false (error)')
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item proibido. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateItem = async (id: number) => {
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

    try {
      if (editTipoItem === "produto") {
        await updateItemNaoReembolsavel(id, editProduto.trim(), undefined)
      } else {
        await updateItemNaoReembolsavel(id, undefined, editGrupo.trim())
      }
      
      setEditingItemId(null)
      setEditProduto("")
      setEditGrupo("")
      setEditTipoItem("produto")
      
      toast({
        title: "Sucesso",
        description: "Item proibido atualizado com sucesso"
      })
      refreshItensNaoReembolsaveis()
    } catch (error) {
      console.error('Erro ao atualizar item proibido:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item proibido. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleRemoveItem = async (id: number) => {
    try {
      await removeItemNaoReembolsavel(id)
      toast({
        title: "Sucesso",
        description: "Item proibido removido com sucesso"
      })
      refreshItensNaoReembolsaveis()
    } catch (error) {
      console.error('Erro ao remover item proibido:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o item proibido. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const startEditItem = (item: any) => {
    setEditingItemId(item.id)
    
    if (item.produto) {
      setEditTipoItem("produto")
      setEditProduto(item.produto)
      setEditGrupo("")
    } else if (item.grupo) {
      setEditTipoItem("grupo")
      setEditProduto("")
      setEditGrupo(item.grupo)
    } else {
      // Fallback para dados antigos se não tiver produto nem grupo
      setEditTipoItem("produto")
      setEditProduto(item.descricao || "")
      setEditGrupo("")
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
                               <Select value={empresaVinculoId} onValueChange={(val) => setEmpresaVinculoId(val)}>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Selecione uma transportadora" />
                                 </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">Nenhuma transportadora</SelectItem>
                                   {empresas.map((empresa) => (
                                     <SelectItem key={empresa.id} value={empresa.id.toString()}>
                                       {empresa.nome}
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
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
                                    <Select value={editEmpresaVinculoId} onValueChange={(val) => setEditEmpresaVinculoId(val)}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma transportadora" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__none">Nenhuma transportadora</SelectItem>
                                        {empresas.map((empresa) => (
                                          <SelectItem key={empresa.id} value={empresa.id.toString()}>
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
                                     <div className="text-sm">{vinculo.empresa_id ? (empresas.find(e => e.id === Number(vinculo.empresa_id))?.nome || '-') : '-'}</div>
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

                             {/* Aba Itens Proibidos (refatorada) */}
                             <TabsContent value="itens-nao-reembolsaveis" className="mt-6">
                               <Card>
                                 <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                     <Package className="h-5 w-5" />
                                     Itens Proibidos
                                   </CardTitle>
                                   <CardDescription>Configure produtos que não podem ser reembolsados</CardDescription>
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                   {/* Add / Form */}
                                   {!isAddingItem ? (
                                     <div className="flex gap-2">
                                       <Button className="w-full" onClick={() => setIsAddingItem(true)}>
                                         <Plus className="h-4 w-4 mr-2" />
                                         Novo Item Proibido
                                       </Button>
                                     </div>
                                   ) : (
                                     <div className="space-y-3 border rounded p-4 bg-background">
                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                         <div>
                                           <Label htmlFor="tipoItem">Tipo de Bloqueio</Label>
                                           <Select value={tipoItem} onValueChange={(v: "produto" | "grupo") => setTipoItem(v)}>
                                             <SelectTrigger>
                                               <SelectValue placeholder="Selecione o tipo" />
                                             </SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="produto">Produto Específico</SelectItem>
                                               <SelectItem value="grupo">Grupo de Produtos</SelectItem>
                                             </SelectContent>
                                           </Select>
                                         </div>
                                         <div className="md:col-span-2">
                                           <Label htmlFor="valorItem">{tipoItem === 'produto' ? 'Nome do Produto' : 'Nome do Grupo'}</Label>
                                           <Input
                                             id="valorItem"
                                             value={tipoItem === 'produto' ? produto : grupo}
                                             onChange={(e) => {
                                               if (tipoItem === 'produto') setProduto(e.target.value)
                                               else setGrupo(e.target.value)
                                             }}
                                             placeholder={tipoItem === 'produto' ? 'Ex: Coca-Cola' : 'Ex: Refrigerante'}
                                           />
                                         </div>
                                       </div>

                                       <div className="flex justify-end gap-2">
                                         <Button
                                           variant="outline"
                                           onClick={() => {
                                             setIsAddingItem(false)
                                             setProduto("")
                                             setGrupo("")
                                             setTipoItem('produto')
                                           }}
                                         >
                                           Cancelar
                                         </Button>
                                         <Button
                                           onClick={handleAddItem}
                                           disabled={isSavingItem || ((tipoItem === 'produto' && !produto.trim()) || (tipoItem === 'grupo' && !grupo.trim()))}
                                         >
                                           {isSavingItem ? 'Salvando...' : 'Salvar'}
                                         </Button>
                                       </div>
                                     </div>
                                   )}

                                   {/* Lista simplificada */}
                                   <div>
                                     <h3 className="text-lg font-medium mb-2">Itens Cadastrados</h3>
                                     {itensNaoReembolsaveis.length === 0 ? (
                                       <div className="text-muted-foreground">Nenhum item proibido cadastrado</div>
                                     ) : (
                                       <div className="space-y-2">
                                         {itensNaoReembolsaveis.map(item => (
                                           <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                                             <div>
                                               <div className="font-medium">{item.produto || item.grupo}</div>
                                               <div className="text-xs text-muted-foreground">ID: {item.id}</div>
                                             </div>
                                             <div className="flex gap-2">
                                               <Button size="sm" variant="outline" onClick={() => startEditItem(item)}>
                                                 Editar
                                               </Button>
                                               <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(item.id)}>
                                                 Remover
                                               </Button>
                                             </div>
                                           </div>
                                         ))}
                                       </div>
                                     )}
                                   </div>
                                 </CardContent>
                               </Card>
                             </TabsContent>



              <TabsContent value="usuarios" className="mt-6">
                <UsersManagement />
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
