import React, { createContext, useContext, useState, ReactNode } from 'react'
import { cupomApi } from '@/lib/api'

// Tipos para usuários
export interface User {
  id: string
  username: string
  nome: string
  senha: string // Para exibição, normalmente seria omitida
  role: 'admin' | 'user'
  transportadora?: string
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export interface UserInput {
  username: string
  nome: string
  senha: string
  role: 'admin' | 'user'
  transportadora?: string
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

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar usuários do localStorage (simula API)
  const loadUsers = () => {
    try {
      const savedUsers = localStorage.getItem('system_users')
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers).map((user: any) => ({
          ...user,
          criadoEm: new Date(user.criadoEm),
          atualizadoEm: new Date(user.atualizadoEm)
        }))
        setUsers(parsedUsers)
      } else {
        // Carregar usuários padrão se não existir nenhum
        const defaultUsers: User[] = [
          {
            id: '1',
            username: 'admin',
            nome: 'Administrador',
            senha: 'admin123',
            role: 'admin',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date()
          },
          {
            id: '2',
            username: 'operador',
            nome: 'Operador',
            senha: 'op123',
            role: 'user',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date()
          },
          {
            id: '3',
            username: 'transportadora',
            nome: 'Transportadora',
            senha: 'trans123',
            role: 'user',
            transportadora: 'Transportadora ABC',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date()
          }
        ]
        setUsers(defaultUsers)
        localStorage.setItem('system_users', JSON.stringify(defaultUsers))
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  // Salvar usuários no localStorage
  const saveUsers = (updatedUsers: User[]) => {
    try {
      localStorage.setItem('system_users', JSON.stringify(updatedUsers))
      setUsers(updatedUsers)
    } catch (error) {
      console.error('Erro ao salvar usuários:', error)
      throw new Error('Não foi possível salvar os dados')
    }
  }

  // Carregar usuários na inicialização
  React.useEffect(() => {
    loadUsers()
  }, [])

  const refreshUsers = async (): Promise<void> => {
    setIsLoading(true)
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500))
      loadUsers()
    } finally {
      setIsLoading(false)
    }
  }

  const addUser = async (userInput: UserInput): Promise<void> => {
    setIsLoading(true)
    try {
      // Verificar se username já existe
      const existingUser = users.find(u => u.username.toLowerCase() === userInput.username.toLowerCase())
      if (existingUser) {
        throw new Error('Nome de usuário já existe')
      }

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800))

      const newUser: User = {
        id: Date.now().toString(),
        ...userInput,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }

      const updatedUsers = [...users, newUser]
      saveUsers(updatedUsers)

      // Em produção, aqui você chamaria a API
      // await cupomApi.createUser(userInput)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (id: string, userInput: Partial<UserInput>): Promise<void> => {
    setIsLoading(true)
    try {
      // Verificar se username já existe (exceto para o próprio usuário)
      if (userInput.username) {
        const existingUser = users.find(u => 
          u.id !== id && u.username.toLowerCase() === userInput.username.toLowerCase()
        )
        if (existingUser) {
          throw new Error('Nome de usuário já existe')
        }
      }

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 600))

      const updatedUsers = users.map(user => 
        user.id === id 
          ? { 
              ...user, 
              ...userInput, 
              atualizadoEm: new Date() 
            }
          : user
      )

      saveUsers(updatedUsers)

      // Em produção, aqui você chamaria a API
      // await cupomApi.updateUser(id, userInput)
    } finally {
      setIsLoading(false)
    }
  }

  const removeUser = async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      // Não permitir excluir o último admin
      const admins = users.filter(u => u.role === 'admin' && u.id !== id)
      if (admins.length === 0) {
        throw new Error('Não é possível excluir o último administrador')
      }

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500))

      const updatedUsers = users.filter(user => user.id !== id)
      saveUsers(updatedUsers)

      // Em produção, aqui você chamaria a API
      // await cupomApi.deleteUser(id)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      const user = users.find(u => u.id === id)
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Não permitir desativar o último admin ativo
      if (user.role === 'admin' && user.ativo) {
        const activeAdmins = users.filter(u => u.role === 'admin' && u.ativo && u.id !== id)
        if (activeAdmins.length === 0) {
          throw new Error('Não é possível desativar o último administrador ativo')
        }
      }

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 400))

      const updatedUsers = users.map(u => 
        u.id === id 
          ? { ...u, ativo: !u.ativo, atualizadoEm: new Date() }
          : u
      )

      saveUsers(updatedUsers)

      // Em produção, aqui você chamaria a API
      // await cupomApi.toggleUserStatus(id)
    } finally {
      setIsLoading(false)
    }
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
