import React from 'react'
import { motion } from "framer-motion"
import { LogOut, User, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const UserHeader: React.FC = () => {
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema.",
    })
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      <div className="text-sm text-muted-foreground text-right">
        <div className="font-medium text-foreground">{user.nome}</div>
        <div className="flex items-center gap-1">
          {user.role === 'admin' ? (
            <Shield className="w-3 h-3 text-blue-600" />
          ) : (
            <User className="w-3 h-3 text-gray-600" />
          )}
          <span className="capitalize">
            {user.role === 'admin' ? 'Administrador' : 'Operador'}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            {user.username}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-muted-foreground">
            {user.role === 'admin' ? (
              <Shield className="mr-2 h-4 w-4" />
            ) : (
              <User className="mr-2 h-4 w-4" />
            )}
            {user.role === 'admin' ? 'Administrador' : 'Operador'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
