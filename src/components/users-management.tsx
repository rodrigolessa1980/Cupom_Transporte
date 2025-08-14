import React, { useState } from 'react'
import { motion } from "framer-motion"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  User, 
  Shield, 
  UserCheck, 
  UserX,
  RefreshCw,
  Mail
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useUsers, UserInput } from "@/contexts/users-context"
import { useToast } from "@/hooks/use-toast"

export const UsersManagement: React.FC = () => {
  const { users, isLoading, addUser, updateUser, removeUser, toggleUserStatus, refreshUsers } = useUsers()
  const { toast } = useToast()

  // Estados do formulário
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Estados para novo usuário
  const [newUser, setNewUser] = useState<UserInput>({
    username: '',
    nome: '',
    email: '',
    senha: '',
    role: 'user',
    ativo: true
  })

  // Estados para edição
  const [editUser, setEditUser] = useState<Partial<UserInput>>({})

  // Reset form
  const resetNewUserForm = () => {
    setNewUser({
      username: '',
      nome: '',
      email: '',
      senha: '',
      role: 'user',
      ativo: true
    })
    setShowPassword(false)
  }

  const resetEditForm = () => {
    setEditUser({})
    setShowEditPassword(false)
    setEditingUserId(null)
  }

  // Validações
  const validateUserForm = (user: UserInput | Partial<UserInput>, isEdit = false): string | null => {
    if (!isEdit) {
      if (!user.username?.trim()) return 'Nome de usuário é obrigatório'
      if (!user.nome?.trim()) return 'Nome completo é obrigatório'
      if (!user.email?.trim()) return 'Email é obrigatório'
      if (!user.senha?.trim()) return 'Senha é obrigatória'
    } else {
      if (user.username !== undefined && !user.username?.trim()) return 'Nome de usuário não pode ser vazio'
      if (user.nome !== undefined && !user.nome?.trim()) return 'Nome completo não pode ser vazio'
      if (user.email !== undefined && !user.email?.trim()) return 'Email não pode ser vazio'
      if (user.senha !== undefined && user.senha !== '' && !user.senha?.trim()) return 'Senha não pode ser vazia'
    }

    if (user.username && user.username.length < 3) return 'Nome de usuário deve ter pelo menos 3 caracteres'
    if (user.senha && user.senha.length < 4) return 'Senha deve ter pelo menos 4 caracteres'
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) return 'Email deve ter um formato válido'

    return null
  }

  // Handlers
  const handleAddUser = async () => {
    const validation = validateUserForm(newUser)
    if (validation) {
      toast({
        title: "Erro de validação",
        description: validation,
        variant: "destructive"
      })
      return
    }

    try {
      await addUser(newUser)
      resetNewUserForm()
      setIsAddingUser(false)
      toast({
        title: "Usuário criado",
        description: `Usuário ${newUser.nome} foi criado com sucesso.`
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o usuário",
        variant: "destructive"
      })
    }
  }

  const handleUpdateUser = async (id: string) => {
    const validation = validateUserForm(editUser, true)
    if (validation) {
      toast({
        title: "Erro de validação",
        description: validation,
        variant: "destructive"
      })
      return
    }

    try {
      const updateData: Partial<UserInput> = {};

      if (editUser.username !== undefined && editUser.username.trim() !== '') {
        updateData.username = editUser.username;
      }
      if (editUser.nome !== undefined && editUser.nome.trim() !== '') {
        updateData.nome = editUser.nome;
      }
      if (editUser.email !== undefined && editUser.email.trim() !== '') {
        updateData.email = editUser.email;
      }
      if (editUser.senha !== undefined && editUser.senha !== null && editUser.senha.trim() !== '') {
        updateData.senha = editUser.senha;
      }
      if (editUser.role !== undefined) {
        updateData.role = editUser.role;
      }
      if (editUser.ativo !== undefined) {
        updateData.ativo = editUser.ativo;
      }

      await updateUser(id, updateData)
      resetEditForm()
      
      const user = users.find(u => u.id === id)
      toast({
        title: "Usuário atualizado",
        description: `Usuário ${user?.nome} foi atualizado com sucesso.`
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o usuário",
        variant: "destructive"
      })
    }
  }

  const handleRemoveUser = async (id: string) => {
    const user = users.find(u => u.id === id)
    if (!user) return

    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await removeUser(id)
      toast({
        title: "Usuário excluído",
        description: `Usuário ${user.nome} foi excluído com sucesso.`
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível excluir o usuário",
        variant: "destructive"
      })
    }
  }

  const handleToggleStatus = async (id: string) => {
    const user = users.find(u => u.id === id)
    if (!user) return

    try {
      await toggleUserStatus(id)
      toast({
        title: "Status alterado",
        description: `Usuário ${user.nome} foi ${user.ativo ? 'desativado' : 'ativado'}.`
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível alterar o status",
        variant: "destructive"
      })
    }
  }

  const startEditUser = (user: any) => {
    setEditingUserId(user.id)
    setEditUser({
      username: user.username,
      nome: user.nome,
      email: user.email || '',
      senha: '', // Não pré-popular senha por segurança
      role: user.role,
      ativo: user.ativo
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Cadastre e gerencie usuários do sistema
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Botão Adicionar Usuário */}
        {!isAddingUser && (
          <Button
            onClick={() => setIsAddingUser(true)}
            className="w-full"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Usuário
          </Button>
        )}

        {/* Formulário para Novo Usuário */}
        {isAddingUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Novo Usuário</CardTitle>
                <CardDescription>
                  Preencha os dados do novo usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-username">Nome de Usuário *</Label>
                    <Input
                      id="new-username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="usuario123"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-nome">Nome Completo *</Label>
                    <Input
                      id="new-nome"
                      value={newUser.nome}
                      onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                      placeholder="João da Silva"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-email">Email *</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="joao@exemplo.com"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-senha">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="new-senha"
                        type={showPassword ? "text" : "password"}
                        value={newUser.senha}
                        onChange={(e) => setNewUser({...newUser, senha: e.target.value})}
                        placeholder="Mínimo 4 caracteres"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new-role">Tipo de Usuário *</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value: 'admin' | 'user') => setNewUser({...newUser, role: value})}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Operador
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrador
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingUser(false)
                      resetNewUserForm()
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddUser}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Criar Usuário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lista de Usuários */}
        {users.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Usuários Cadastrados ({users.length})</h3>
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm font-medium">
                  <span>Usuário</span>
                  <span>Nome</span>
                  <span>Email</span>
                  <span>Tipo</span>
                  <span>Status</span>
                  <span>Ações</span>
                </div>
              </div>
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="p-4">
                    {editingUserId === user.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <Input
                          value={editUser.username || ''}
                          onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                          placeholder="Nome de usuário"
                          disabled={isLoading}
                        />
                        <Input
                          value={editUser.nome || ''}
                          onChange={(e) => setEditUser({...editUser, nome: e.target.value})}
                          placeholder="Nome completo"
                          disabled={isLoading}
                        />
                        <Input
                          type="email"
                          value={editUser.email || ''}
                          onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                          placeholder="Email"
                          disabled={isLoading}
                        />
                        <Select 
                          value={editUser.role || 'user'} 
                          onValueChange={(value: 'admin' | 'user') => setEditUser({...editUser, role: value})}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Operador</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        <div>
                          <Label htmlFor="edit-ativo">Status *</Label>
                          <Select
                            value={editUser.ativo === true ? "true" : "false"}
                            onValueChange={(value) => setEditUser({...editUser, ativo: value === "true"})}
                            disabled={isLoading}
                          >
                            <SelectTrigger id="edit-ativo">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4" />
                                  Ativo
                                </div>
                              </SelectItem>
                              <SelectItem value="false">
                                <div className="flex items-center gap-2">
                                  <UserX className="h-4 w-4" />
                                  Inativo
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="relative">
                          <Input
                            type={showEditPassword ? "text" : "password"}
                            value={editUser.senha || ''}
                            onChange={(e) => setEditUser({...editUser, senha: e.target.value})}
                            placeholder="Nova senha (opcional)"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowEditPassword(!showEditPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            disabled={isLoading}
                          >
                            {showEditPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateUser(user.id)}
                            disabled={isLoading}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={resetEditForm}
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div className="font-mono text-sm">{user.username}</div>
                        <div className="text-sm font-medium">{user.nome}</div>
                        <div className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email || '-'}
                        </div>
                        <div className="text-sm">
                          {user.role === 'admin' ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <User className="h-3 w-3 mr-1" />
                              Operador
                            </Badge>
                          )}
                        </div>
                        <div>
                          {user.ativo ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <UserX className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditUser(user)}
                            disabled={isLoading}
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={isLoading}
                            title={user.ativo ? "Desativar usuário" : "Ativar usuário"}
                          >
                            {user.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id)}
                            disabled={isLoading}
                            title="Excluir usuário"
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

        {users.length === 0 && !isAddingUser && (
          <div className="text-center text-muted-foreground py-8">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário cadastrado</p>
            <p className="text-sm">Clique no botão acima para adicionar um usuário</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
