import React, { createContext, useContext, useState, ReactNode } from 'react'
import { cupomApi } from '@/lib/api'

// Tipos para autenticação
export interface User {
  id: string
  username: string
  nome: string
  role: 'admin' | 'user'
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}



interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se há sessão salva ao carregar
  React.useEffect(() => {
    const checkExistingSession = async () => {
      const savedUser = localStorage.getItem('auth_user')
      const savedToken = localStorage.getItem('auth_token')
      
      if (savedUser && savedToken) {
        try {
          // Validar token na API
          const response = await cupomApi.validateToken(savedToken)
          
          if (response.success && response.user) {
            setUser(response.user)
          } else {
            // Token inválido, limpar dados salvos
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_token')
          }
        } catch (error) {
          console.error('Erro ao validar sessão salva:', error)
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_token')
        }
      }
      
      setIsLoading(false)
    }

    checkExistingSession()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await cupomApi.authenticate({ username, password })
      
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem('auth_user', JSON.stringify(response.user))
        localStorage.setItem('auth_token', response.token)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
