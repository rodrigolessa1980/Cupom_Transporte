import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cupomFiscalSchema } from "@/schemas/cupom"
import { CupomFiscal, CupomFiscalInput } from "@/types/cupom"
import { formatCNPJ, verificarCupomDuplicado } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface CupomFormProps {
  cupom?: CupomFiscal
  onSave: (data: CupomFiscalInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  cuponsExistentes?: CupomFiscal[]
}

export function CupomForm({ cupom, onSave, onCancel, isLoading, cuponsExistentes = [] }: CupomFormProps) {
  const { toast } = useToast()
  const isEditing = !!cupom

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CupomFiscalInput>({
    resolver: zodResolver(cupomFiscalSchema),
    defaultValues: {
      dadosEstabelecimento: {
        razaoSocial: cupom?.dadosEstabelecimento.razaoSocial || "",
        endereco: cupom?.dadosEstabelecimento.endereco || "",
        cidade: cupom?.dadosEstabelecimento.cidade || "",
        telefone: cupom?.dadosEstabelecimento.telefone || "",
        cnpj: cupom?.dadosEstabelecimento.cnpj || "",
        ie: cupom?.dadosEstabelecimento.ie || "",
        im: cupom?.dadosEstabelecimento.im || "",
        nomeFantasia: cupom?.dadosEstabelecimento.nomeFantasia || "",
      },
      informacoesTransacao: {
        data: cupom?.informacoesTransacao.data || new Date(),
        hora: cupom?.informacoesTransacao.hora || "",
        coo: cupom?.informacoesTransacao.coo || "",
        ecf: cupom?.informacoesTransacao.ecf || "",
        numeroEcf: cupom?.informacoesTransacao.numeroEcf || "",
        numeroCupom: cupom?.informacoesTransacao.numeroCupom || "",
      },
      dadosMotorista: {
        celular: cupom?.dadosMotorista.celular || "",
        nome: cupom?.dadosMotorista.nome || "",
      },
      itens: cupom?.itens || [],
      totais: {
        valorTotal: cupom?.totais.valorTotal || 0,
        formaPagamento: cupom?.totais.formaPagamento || "",
        troco: cupom?.totais.troco || 0,
        desconto: cupom?.totais.desconto || 0,
      },
      observacoes: cupom?.observacoes || "",
      status: cupom?.status || "Pendente",
    },
  })

  const watchedDataEmissao = watch("informacoesTransacao.data")
  const watchedCnpj = watch("dadosEstabelecimento.cnpj")

  // Format CNPJ as user types
  React.useEffect(() => {
    if (watchedCnpj) {
      const formatted = formatCNPJ(watchedCnpj)
      if (formatted !== watchedCnpj) {
        setValue("dadosEstabelecimento.cnpj", formatted)
      }
    }
  }, [watchedCnpj, setValue])

  const onSubmit = async (data: CupomFiscalInput) => {
    try {
      // Verificar duplicatas antes de salvar
      if (!isEditing && cuponsExistentes.length > 0) {
        const cupomTemporario: CupomFiscal = {
          id: 'temp',
          ...data,
          status: data.status || 'Pendente',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        }
        
        const duplicataInfo = verificarCupomDuplicado(cupomTemporario, cuponsExistentes)
        
        if (duplicataInfo.isDuplicado) {
          toast({
            title: "Cupom Duplicado Detectado",
            description: `Já existe um cupom com o mesmo CNPJ (${data.dadosEstabelecimento.cnpj}) e número (${data.informacoesTransacao.numeroCupom}). Verifique os dados antes de continuar.`,
            variant: "destructive",
          })
          return
        }
      }
      
      await onSave(data)
      toast({
        title: isEditing ? "Cupom atualizado!" : "Cupom criado!",
        description: isEditing 
          ? "O cupom foi atualizado com sucesso." 
          : "O cupom foi cadastrado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cupom. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? "Editar Cupom Fiscal" : "Novo Cupom Fiscal"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numeroCupom">Número do Cupom</Label>
                <Input
                  id="numeroCupom"
                  {...register("informacoesTransacao.numeroCupom")}
                  placeholder="Ex: CF-001"
                  disabled={isSubmitting || isLoading}
                />
                {errors.informacoesTransacao?.numeroCupom && (
                  <p className="text-sm text-destructive">{errors.informacoesTransacao.numeroCupom.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpjEmitente">CNPJ Emitente</Label>
                <Input
                  id="cnpjEmitente"
                  {...register("dadosEstabelecimento.cnpj")}
                  placeholder="00.000.000/0000-00"
                  disabled={isSubmitting || isLoading}
                />
                {errors.dadosEstabelecimento?.cnpj && (
                  <p className="text-sm text-destructive">{errors.dadosEstabelecimento.cnpj.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEmissao">Data de Emissão</Label>
                <DatePicker
                  date={watchedDataEmissao}
                  onSelect={(date) => setValue("informacoesTransacao.data", date || new Date())}
                  disabled={isSubmitting || isLoading}
                />
                {errors.informacoesTransacao?.data && (
                  <p className="text-sm text-destructive">{errors.informacoesTransacao.data.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("totais.valorTotal", { valueAsNumber: true })}
                  placeholder="0,00"
                  disabled={isSubmitting || isLoading}
                />
                {errors.totais?.valorTotal && (
                  <p className="text-sm text-destructive">{errors.totais.valorTotal.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...register("observacoes")}
                placeholder="Observações adicionais sobre o cupom fiscal (opcional)"
                rows={4}
                disabled={isSubmitting || isLoading}
              />
              {errors.observacoes && (
                <p className="text-sm text-destructive">{errors.observacoes.message}</p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isEditing ? "Atualizar" : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
} 