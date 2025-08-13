import { motion } from "framer-motion"
import { 
  Building2, 
  DollarSign, 
  FileText, 
  Clock,
  Phone,
  CreditCard,
  MapPin,
  User,
  Hash,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CupomFiscal } from "@/types/cupom"
import { formatCurrency, formatDate } from "@/lib/utils"

interface CupomDetailsModalProps {
  cupom: CupomFiscal | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CupomDetailsModal({ cupom, open, onOpenChange }: CupomDetailsModalProps) {
  if (!cupom) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes do Cupom Fiscal - {cupom.informacoesTransacao.numeroCupom}
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Informações do Cupom */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Cupom</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Número do Cupom
                  </span>
                </div>
                <p className="text-lg font-semibold">{cupom.informacoesTransacao.numeroCupom}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Data e Hora da Compra
                  </span>
                </div>
                <div>
                  <p className="text-lg">{formatDate(cupom.informacoesTransacao.data)}</p>
                  <p className="text-sm text-muted-foreground">{cupom.informacoesTransacao.hora}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Motorista */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Motorista</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Celular
                  </span>
                </div>
                <p className="text-lg font-mono">{cupom.dadosMotorista.celular}</p>
              </div>

              {cupom.dadosMotorista.nome && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-muted-foreground">
                      Nome
                    </span>
                  </div>
                  <p className="text-lg">{cupom.dadosMotorista.nome}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Estabelecimento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estabelecimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-muted-foreground">
                      Razão Social
                    </span>
                  </div>
                  <p className="text-lg font-medium">{cupom.dadosEstabelecimento.razaoSocial}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-muted-foreground">
                      Nome Fantasia
                    </span>
                  </div>
                  <p className="text-lg">{cupom.dadosEstabelecimento.nomeFantasia}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-muted-foreground">
                      CNPJ
                    </span>
                  </div>
                  <p className="text-lg font-mono">{cupom.dadosEstabelecimento.cnpj}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-muted-foreground">
                      Telefone
                    </span>
                  </div>
                  <p className="text-lg font-mono">{cupom.dadosEstabelecimento.telefone}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Endereço
                  </span>
                </div>
                <p className="text-base">{cupom.dadosEstabelecimento.endereco}</p>
                <p className="text-sm text-muted-foreground">{cupom.dadosEstabelecimento.cidade}</p>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Valor Total
                  </span>
                </div>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(cupom.totais.valorTotal)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Forma de Pagamento
                  </span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {cupom.totais.formaPagamento}
                </Badge>
              </div>

              {cupom.totais.troco && cupom.totais.troco > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-muted-foreground">
                      Troco
                    </span>
                  </div>
                  <p className="text-lg font-mono">{formatCurrency(cupom.totais.troco)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Consumidor */}
          {cupom.dadosConsumidor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consumidor</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cupom.dadosConsumidor.nome && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm text-muted-foreground">
                        Nome
                      </span>
                    </div>
                    <p className="text-lg">{cupom.dadosConsumidor.nome}</p>
                  </div>
                )}

                {cupom.dadosConsumidor.cpf && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm text-muted-foreground">
                        CPF
                      </span>
                    </div>
                    <p className="text-lg font-mono">{cupom.dadosConsumidor.cpf}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resumo dos Itens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo dos Itens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg">Total de itens:</span>
                <Badge variant="secondary" className="text-base">
                  {cupom.itens.length} {cupom.itens.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {cupom.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cupom.observacoes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Criado em: {formatDate(cupom.criadoEm)}</span>
            </div>
            {cupom.atualizadoEm.getTime() !== cupom.criadoEm.getTime() && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Atualizado em: {formatDate(cupom.atualizadoEm)}</span>
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 