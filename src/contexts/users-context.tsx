import React, { createContext, useContext, useState, ReactNode } from 'react'
import { cupomApi, SystemUser, SystemUserInput, USER_STATUS_MAP, getStatusFromRoleAndActive } from '@/lib/api'

// Tipos para usuários (interface local para compatibilidade)
export interface User {
  id: string
  username: string
  nome: string
  email: string
  senha: string
  role: 'admin' | 'user'
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export interface UserInput {
  username: string
  nome: string
  email: string
  senha: string
  role: 'admin' | 'user'
  ativo: boolean
}

export interface UsersContextType {
  users: User[]
  isLoading: boolean
  addUser: (user: UserInput) => Promise<void>
  updateUser: (id: string, user: Partial<UserInput>) => Promise<void>
  removeUser: (id: string) => Promise<void>
  toggleUserStatus: (id: string) => Promise<void>
  refreshUsers: () => Promise<void>
}

// Criar contexto
const UsersContext = createContext<UsersContextType | undefined>(undefined)

// Hook para usar o contexto
export const useUsers = () => {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error('useUsers deve ser usado dentro de um UsersProvider')
  }
  return context
}

interface UsersProviderProps {
  children: ReactNode
}

// Função para converter SystemUser para User (interface local)
const convertSystemUserToUser = (systemUser: SystemUser): User => {
  // Fornecer um valor padrão se systemUser.status for null ou undefined
  const statusValue = systemUser.status !== null && systemUser.status !== undefined ? systemUser.status : 2; // 2 = Operador Ativo
  const { role, ativo } = USER_STATUS_MAP[statusValue as keyof typeof USER_STATUS_MAP];
  return {
    id: systemUser.id.toString(),
    username: systemUser.user,
    nome: systemUser.nome,
    email: systemUser.email,
    senha: systemUser.senha,
    role: role,
    ativo: ativo,
    criadoEm: new Date(),
    atualizadoEm: new Date()
  };
};

// Função para converter UserInput para SystemUserInput
const convertUserInputToSystemUserInput = (userInput: UserInput): SystemUserInput => {
  return {
    user: userInput.username,
    nome: userInput.nome,
    email: userInput.email,
    senha: userInput.senha,
    status: getStatusFromRoleAndActive(userInput.role, userInput.ativo)
  }
}

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar usuários da API
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const systemUsers = await cupomApi.getAllUsers()
      const convertedUsers = systemUsers.map(convertSystemUserToUser)
      setUsers(convertedUsers)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      // Em caso de erro, manter usuários existentes ou definir array vazio
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar usuários na inicialização
  React.useEffect(() => {
    loadUsers()
  }, [])

  const addUser = async (userData: UserInput): Promise<void> => {
    setIsLoading(true)
    try {
      // Garante que o status seja enviado, padrão para 2 (Operador Ativo) se não definido ou for null
      const systemUserInput: SystemUserInput = {
        user: userData.username,
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        status: getStatusFromRoleAndActive(userData.role, userData.ativo)
      };
      await cupomApi.createUser(systemUserInput)
      await loadUsers() // Recarregar lista de usuários
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (id: string, userData: Partial<UserInput>): Promise<void> => {
    setIsLoading(true)
    try {
      // Buscar o usuário atual para manter dados não alterados
      const currentUser = users.find(u => u.id === id)
      if (!currentUser) {
        throw new Error('Usuário não encontrado')
      }

      // Mesclar dados atuais com novos dados
      const updatedUserData: UserInput = {
        username: userData.username ?? currentUser.username,
        nome: userData.nome ?? currentUser.nome,
        email: userData.email ?? '', // Campo obrigatório para API
        senha: userData.senha ?? currentUser.senha,
        role: userData.role ?? currentUser.role,
        ativo: userData.ativo ?? currentUser.ativo
      }

      const systemUserInput = convertUserInputToSystemUserInput(updatedUserData)
      await cupomApi.updateUser(parseInt(id), systemUserInput)
      await loadUsers() // Recarregar lista de usuários
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeUser = async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      await cupomApi.deleteUser(parseInt(id))
      await loadUsers() // Recarregar lista de usuários
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      await cupomApi.toggleUserStatus(parseInt(id))
      await loadUsers() // Recarregar lista de usuários
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUsers = async (): Promise<void> => {
    await loadUsers()
  }

  const value: UsersContextType = {
    users,
    isLoading,
    addUser,
    updateUser,
    removeUser,
    toggleUserStatus,
    refreshUsers
  }

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  )
}
