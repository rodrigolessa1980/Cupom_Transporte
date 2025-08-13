import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Filter, 
  X, 
  Calendar,
  User,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { CupomFiscal, StatusCupom } from "@/types/cupom"

export interface FilterState {
  dataInicio: Date | undefined
  dataFim: Date | undefined
  status: StatusCupom | "todos"
  motorista: string
  cnpj: string
}

interface CuponsFiltersProps {
  cupons: CupomFiscal[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  isOpen: boolean
  onToggle: () => void
}

export function CuponsFilters({
  cupons,
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle
}: CuponsFiltersProps) {
  // Extrair valores únicos para os filtros
  const motoristas = React.useMemo(() => {
    const unique = new Set(cupons.map(c => c.dadosMotorista.celular))
    return Array.from(unique).sort()
  }, [cupons])

  const cnpjs = React.useMemo(() => {
    const unique = new Set(cupons.map(c => c.dadosEstabelecimento.cnpj))
    return Array.from(unique).sort()
  }, [cupons])

  const statusOptions = [
    { value: "todos", label: "Todos os Status", icon: Filter },
    { value: "PAGO", label: "PAGO", icon: CheckCircle },
    { value: "Pendente", label: "Pendente", icon: Clock },
    { value: "Cancelado", label: "Cancelado", icon: XCircle },
  ]

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.dataInicio ||
      filters.dataFim ||
      filters.status !== "todos" ||
      filters.motorista ||
      filters.cnpj
    )
  }, [filters])

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.dataInicio) count++
    if (filters.dataFim) count++
    if (filters.status !== "todos") count++
    if (filters.motorista) count++
    if (filters.cnpj) count++
    return count
  }, [filters])

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros Avançados
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros Avançados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Período */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Período
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Data Início</Label>
                      <DatePicker
                        date={filters.dataInicio}
                        onSelect={(date) => handleFilterChange('dataInicio', date)}
                        placeholder="Selecione a data inicial"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Data Fim</Label>
                      <DatePicker
                        date={filters.dataFim}
                        onSelect={(date) => handleFilterChange('dataFim', date)}
                        placeholder="Selecione a data final"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Status
                  </Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value: string) => handleFilterChange('status', value as StatusCupom | "todos")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Motorista */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Motorista
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite o celular do motorista..."
                      value={filters.motorista}
                      onChange={(e) => handleFilterChange('motorista', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {motoristas.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {motoristas.slice(0, 5).map((motorista) => (
                        <Badge
                          key={motorista}
                          variant={filters.motorista === motorista ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => handleFilterChange('motorista', motorista)}
                        >
                          {motorista}
                        </Badge>
                      ))}
                      {motoristas.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{motoristas.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* CNPJ */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    CNPJ do Estabelecimento
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite o CNPJ do estabelecimento..."
                      value={filters.cnpj}
                      onChange={(e) => handleFilterChange('cnpj', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {cnpjs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cnpjs.slice(0, 3).map((cnpj) => (
                        <Badge
                          key={cnpj}
                          variant={filters.cnpj === cnpj ? "default" : "outline"}
                          className="cursor-pointer text-xs font-mono"
                          onClick={() => handleFilterChange('cnpj', cnpj)}
                        >
                          {cnpj}
                        </Badge>
                      ))}
                      {cnpjs.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{cnpjs.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Filtros Ativos:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.dataInicio && (
                        <Badge variant="secondary" className="text-xs">
                          Início: {filters.dataInicio.toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                      {filters.dataFim && (
                        <Badge variant="secondary" className="text-xs">
                          Fim: {filters.dataFim.toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                      {filters.status !== "todos" && (
                        <Badge variant="secondary" className="text-xs">
                          Status: {filters.status}
                        </Badge>
                      )}
                      {filters.motorista && (
                        <Badge variant="secondary" className="text-xs">
                          Motorista: {filters.motorista}
                        </Badge>
                      )}
                      {filters.cnpj && (
                        <Badge variant="secondary" className="text-xs">
                          CNPJ: {filters.cnpj}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 