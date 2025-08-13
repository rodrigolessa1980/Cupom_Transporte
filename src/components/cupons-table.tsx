import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import { motion } from "framer-motion"
import { 
  ArrowUpDown, 
  Eye, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  Building2,
  Phone,
  CreditCard,
  Plus,
  Clock,
  DollarSign,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  User,
  Truck,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { CupomFiscal } from "@/types/cupom"
import { formatCurrency, formatDate, calculateReembolsoValue, verificarCupomDuplicado } from "@/lib/utils"
import { useConfiguracoes } from "@/contexts/configuracoes-context"

interface CuponsTableProps {
  cupons: CupomFiscal[]
  onView: (cupom: CupomFiscal) => void
  onEdit: (cupom: CupomFiscal) => void
  onDelete: (cupom: CupomFiscal) => void
  onViewItems: (cupom: CupomFiscal) => void
  onBulkAction?: (selectedCupons: CupomFiscal[]) => void
  onUpdateStatus?: (cupom: CupomFiscal, newStatus: 'PAGO' | 'Pendente' | 'Cancelado') => void
  isLoading?: boolean
}

export function CuponsTable({ 
  cupons, 
  onView, 
  onEdit, 
  onDelete, 
  onViewItems, 
  onBulkAction,
  onUpdateStatus,
  isLoading 
}: CuponsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const { getMotoristaByTelefone } = useConfiguracoes()

  const columns: ColumnDef<CupomFiscal>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center p-1">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={() => {
              console.log('Header checkbox clicked, current state:', table.getIsAllPageRowsSelected())
              table.toggleAllPageRowsSelected()
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer hover:border-primary"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center p-1">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={() => {
              console.log('Checkbox clicked for row:', row.original.informacoesTransacao.numeroCupom)
              row.toggleSelected()
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer hover:border-primary"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "informacoesTransacao.numeroCupom",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            Nº Cupom
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const cupom = row.original
        const duplicataInfo = verificarCupomDuplicado(cupom, cupons)
        
        return (
          <div className="flex items-center gap-1">
            <div className="font-medium text-xs">{cupom.informacoesTransacao.numeroCupom}</div>
            {duplicataInfo.isDuplicado && (
              <div 
                className={`w-2 h-2 rounded-full ${
                  duplicataInfo.isPrimeiro ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                title={
                  duplicataInfo.isPrimeiro 
                    ? `Primeiro cupom duplicado (${duplicataInfo.totalDuplicatas} total)`
                    : `Cópia duplicada (${duplicataInfo.totalDuplicatas} total)`
                }
              />
            )}
          </div>
        )
      },
      size: 80,
    },
    {
      accessorKey: "dadosMotorista.nome",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            <Truck className="mr-1 h-3 w-3" />
            Transportadora
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate text-xs" title={row.original.dadosMotorista.nome || 'Transportadora não informada'}>
          {row.original.dadosMotorista.nome || '-'}
        </div>
      ),
      size: 120,
    },
    {
      id: "motorista",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            <User className="mr-1 h-3 w-3" />
            Motorista
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const telefone = row.original.dadosMotorista.celular
        const motoristaConfigurado = getMotoristaByTelefone(telefone)
        
        return (
          <div className="max-w-[100px] truncate text-xs" title={motoristaConfigurado || 'Motorista não configurado'}>
            {motoristaConfigurado || ''}
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: "dadosMotorista.celular",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            <Phone className="mr-1 h-3 w-3" />
            Telefone
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original.dadosMotorista.celular}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "dadosEstabelecimento.razaoSocial",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            <Building2 className="mr-1 h-3 w-3" />
            Estabelecimento
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate text-xs" title={row.original.dadosEstabelecimento.razaoSocial}>
          {row.original.dadosEstabelecimento.razaoSocial}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "dadosEstabelecimento.cnpj",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            CNPJ
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original.dadosEstabelecimento.cnpj}</div>
      ),
      size: 110,
    },
    {
      id: "dataHoraCompra",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            <Clock className="mr-1 h-3 w-3" />
            Data/Hora
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-xs">
          <div>{formatDate(row.original.informacoesTransacao.data)}</div>
          <div className="text-xs text-muted-foreground">{row.original.informacoesTransacao.hora}</div>
        </div>
      ),
      size: 85,
    },
    {
      accessorKey: "totais.valorTotal",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            <DollarSign className="mr-1 h-3 w-3" />
            Valor
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium text-green-600 text-xs">
          {formatCurrency(row.original.totais.valorTotal)}
        </div>
      ),
      size: 80,
    },
    {
      id: "valorReembolso",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Reembolso
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const valorReembolso = calculateReembolsoValue(row.original)
        return (
          <div className="font-medium text-blue-600 text-xs">
            {formatCurrency(valorReembolso)}
          </div>
        )
      },
      size: 90,
    },
    {
      accessorKey: "totais.formaPagamento",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            <CreditCard className="mr-1 h-3 w-3" />
            Pgto
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const pagamento = row.original.totais.formaPagamento
        const abrev = pagamento.includes('Cartão') ? 
          (pagamento.includes('Crédito') ? 'CC' : 'CD') :
          pagamento.includes('PIX') ? 'PIX' :
          pagamento.includes('Dinheiro') ? 'DIN' :
          pagamento.includes('Boleto') ? 'BOL' :
          pagamento.substring(0, 3).toUpperCase()
        
        return (
          <Badge variant="outline" className="text-xs px-1 py-0">
            {abrev}
          </Badge>
        )
      },
      size: 60,
    },
    {
      id: "itensIdentificados",
      header: "Itens",
      cell: ({ row }) => {
        const quantidadeItens = row.original.itens.length
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewItems(row.original)}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {quantidadeItens}
          </Button>
        )
      },
      size: 60,
    },
    {
      accessorKey: "observacoes",
      header: "Obs",
      cell: ({ row }) => {
        const observacoes = row.getValue("observacoes") as string
        return (
          <div className="max-w-[50px]">
            {observacoes ? (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                ✓
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">-</span>
            )}
          </div>
        )
      },
      size: 50,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent text-xs"
          >
            Status
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.original.status
        const getStatusConfig = (status: string) => {
          switch (status) {
            case 'PAGO':
              return {
                icon: CheckCircle,
                label: 'PAGO',
                variant: 'default' as const,
                className: 'text-green-700 font-bold'
              }
            case 'Pendente':
              return {
                icon: ClockIcon,
                label: 'Pendente',
                variant: 'secondary' as const,
                className: 'text-yellow-700 font-bold'
              }
            case 'Cancelado':
              return {
                icon: XCircle,
                label: 'Cancelado',
                variant: 'destructive' as const,
                className: 'text-red-700 font-bold'
              }
            default:
              return {
                icon: ClockIcon,
                label: 'Pendente',
                variant: 'secondary' as const,
                className: 'text-yellow-700 font-bold'
              }
          }
        }

        const config = getStatusConfig(status)
        const IconComponent = config.icon

        return (
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-1 border-2 font-medium ${config.className}`}
            style={{
              backgroundColor: status === 'PAGO' ? '#dcfce7' : 
                               status === 'Pendente' ? '#fef3c7' : 
                               status === 'Cancelado' ? '#fee2e2' : '#fef3c7',
              borderColor: status === 'PAGO' ? '#16a34a' : 
                          status === 'Pendente' ? '#ca8a04' : 
                          status === 'Cancelado' ? '#dc2626' : '#ca8a04',
              color: status === 'PAGO' ? '#15803d' : 
                     status === 'Pendente' ? '#a16207' : 
                     status === 'Cancelado' ? '#b91c1c' : '#a16207'
            }}
          >
            <IconComponent className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        )
      },
      size: 100,
    },
    {
      id: "actions",
      enableHiding: false,
      header: "",
      cell: ({ row }) => {
        const cupom = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(cupom)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(cupom)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              
              {/* Separador */}
              <DropdownMenuItem disabled className="opacity-50">
                <div className="w-full border-t border-gray-200 my-1"></div>
              </DropdownMenuItem>
              
              {/* Opções de Status */}
              <DropdownMenuItem 
                onClick={() => onUpdateStatus?.(cupom, 'PAGO')}
                className="text-green-700 focus:text-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como PAGO
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onUpdateStatus?.(cupom, 'Pendente')}
                className="text-yellow-700 focus:text-yellow-700"
              >
                <Clock className="mr-2 h-4 w-4" />
                Marcar como Pendente
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onUpdateStatus?.(cupom, 'Cancelado')}
                className="text-red-700 focus:text-red-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Marcar como Cancelado
              </DropdownMenuItem>
              
              {/* Separador */}
              <DropdownMenuItem disabled className="opacity-50">
                <div className="w-full border-t border-gray-200 my-1"></div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => onDelete(cupom)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
    },
  ]

  const table = useReactTable({
    data: cupons,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  // Get selected cupons
  const selectedCupons = table.getFilteredSelectedRowModel().rows.map(row => row.original)
  const hasSelectedCupons = selectedCupons.length > 0

  // Debug log
  console.log('Selected cupons:', selectedCupons.length, selectedCupons.map(c => c.informacoesTransacao.numeroCupom))

  // Handle bulk action
  const handleBulkAction = () => {
    if (onBulkAction && hasSelectedCupons) {
      onBulkAction(selectedCupons)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="h-12 bg-muted rounded-lg animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-md border w-full"
    >
      {/* Bulk Action Bar */}
      {hasSelectedCupons && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-primary/5 border-b px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedCupons.length} cupon{selectedCupons.length > 1 ? 's' : ''} selecionado{selectedCupons.length > 1 ? 's' : ''}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Valor total: {formatCurrency(selectedCupons.reduce((sum, cupom) => sum + cupom.totais.valorTotal, 0))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRowSelection({})}
              className="text-xs"
            >
              Limpar Seleção
            </Button>
            <Button
              onClick={handleBulkAction}
              size="sm"
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Realizar Baixa ({selectedCupons.length})
            </Button>
          </div>
        </motion.div>
      )}
      
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead 
                    key={header.id} 
                    className="px-2 py-2 text-xs"
                    style={{ width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : 'auto' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={`hover:bg-muted/50 ${row.getIsSelected() ? "bg-primary/10" : ""}`}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id} 
                    className="px-2 py-2 text-xs"
                    style={{ width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : 'auto' }}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-xs"
              >
                Nenhum cupom fiscal encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </motion.div>
  )
} 