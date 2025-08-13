
import { motion } from "framer-motion"
import { Package, Hash, DollarSign, Scale, RefreshCw } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CupomFiscal, ItemCompra } from "@/types/cupom"
import { formatCurrency, calculateReembolsoValue } from "@/lib/utils"

interface CupomItemsModalProps {
  cupom: CupomFiscal | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CupomItemsModal({ cupom, open, onOpenChange }: CupomItemsModalProps) {
  if (!cupom) return null

  const totalItens = cupom.itens.reduce((total, item) => total + item.valorTotal, 0)
  const totalReembolso = calculateReembolsoValue(cupom)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Itens do Cupom Fiscal - {cupom.informacoesTransacao.numeroCupom}
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Resumo do Cupom */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo do Cupom</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estabelecimento</p>
                <p className="font-medium">{cupom.dadosEstabelecimento.razaoSocial}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-mono text-sm">{cupom.dadosEstabelecimento.cnpj}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                <Badge variant="outline">{cupom.totais.formaPagamento}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Reembolso</p>
                <p className="font-medium text-blue-600">{formatCurrency(totalReembolso)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Itens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Itens Identificados ({cupom.itens.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Código
                        </div>
                      </TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Scale className="h-3 w-3" />
                          Qtd
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Unidade</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-3 w-3" />
                          Valor Unit.
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-3 w-3" />
                          Valor Total
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Reembolso
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cupom.itens.map((item: ItemCompra, index: number) => (
                      <motion.tr
                        key={`${item.codigo}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <TableCell className="font-mono text-xs">
                          {item.codigo}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="text-sm font-medium truncate" title={item.descricao}>
                              {item.descricao}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {item.quantidade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {item.unidade}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(item.valorUnitario)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.permiteReembolso ? (
                            <Badge variant="default" className="text-xs bg-blue-600">
                              ✓ Sim
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              ✗ Não
                            </Badge>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totais */}
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal dos itens:</span>
                  <span className="font-mono">{formatCurrency(totalItens)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Valor para reembolso:</span>
                  <span className="font-mono text-blue-600 font-medium">{formatCurrency(totalReembolso)}</span>
                </div>
                
                {cupom.totais.desconto && cupom.totais.desconto > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span className="font-mono text-red-600">
                      -{formatCurrency(cupom.totais.desconto)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-base font-medium border-t pt-2">
                  <span>Total Final:</span>
                  <span className="font-mono text-green-600 text-lg">
                    {formatCurrency(cupom.totais.valorTotal)}
                  </span>
                </div>

                {cupom.totais.troco && cupom.totais.troco > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Troco:</span>
                    <span className="font-mono">{formatCurrency(cupom.totais.troco)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 