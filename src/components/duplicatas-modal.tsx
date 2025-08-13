import { motion } from "framer-motion"
import { AlertTriangle, Info } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CupomFiscal } from "@/types/cupom"
import { formatCurrency, formatDate } from "@/lib/utils"

interface DuplicatasModalProps {
  cuponsDuplicados: Map<string, CupomFiscal[]>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DuplicatasModal({ cuponsDuplicados, open, onOpenChange }: DuplicatasModalProps) {
  const totalDuplicatas = Array.from(cuponsDuplicados.values()).reduce((sum, cuponsList) => sum + cuponsList.length, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Cupons Duplicados
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                {cuponsDuplicados.size} grupos de duplicatas encontrados
              </span>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {totalDuplicatas} cupons duplicados
            </Badge>
          </div>

          <div className="space-y-4">
            {Array.from(cuponsDuplicados.entries()).map(([chave, cuponsList], index) => {
              const [cnpj, numeroCupom] = chave.split('-')
              const cuponsOrdenados = cuponsList.sort((a, b) => 
                new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
              )
              
              return (
                <motion.div
                  key={chave}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">CNPJ: {cnpj}</h3>
                      <p className="text-xs text-muted-foreground">Número do Cupom: {numeroCupom}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {cuponsList.length} duplicatas
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {cuponsOrdenados.map((cupom, cupomIndex) => (
                      <div
                        key={cupom.id}
                        className={`flex items-center justify-between p-3 rounded border-l-4 ${
                          cupomIndex === 0 
                            ? 'bg-yellow-50 border-yellow-400' 
                            : 'bg-red-50 border-red-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            cupomIndex === 0 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">
                              {cupomIndex === 0 ? 'Primeiro cupom' : `Cópia ${cupomIndex + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Criado em: {formatDate(cupom.criadoEm)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(cupom.totais.valorTotal)}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              cupom.status === 'PAGO' ? 'text-green-700 border-green-300' :
                              cupom.status === 'Pendente' ? 'text-yellow-700 border-yellow-300' :
                              'text-red-700 border-red-300'
                            }`}
                          >
                            {cupom.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 