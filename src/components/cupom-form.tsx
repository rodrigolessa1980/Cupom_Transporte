import * as React from 'react'
import { useForm } from 'react-hook-form'
// (no resolver for simplified DB-only form)
import { motion } from 'framer-motion'
import { Loader2, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
// ...existing code...
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// schema intentionally not used here; form is simplified to DB fields
import { CupomFiscal, CupomFiscalInput } from '@/types/cupom'
import { formatCNPJ } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { cupomApi } from '@/lib/api'
import { useConfiguracoes } from '@/contexts/configuracoes-context'
// ...existing code...

interface CupomFormProps {
  cupom?: CupomFiscal
  onSave: (data: CupomFiscalInput) => Promise<any>
  onCancel: () => void
  isLoading?: boolean
  cuponsExistentes?: CupomFiscal[]
}

export function CupomForm({ cupom, onSave, onCancel, isLoading, cuponsExistentes = [] }: CupomFormProps) {
  const { toast } = useToast()
  const isEditing = !!cupom
  const { empresas, refreshEmpresas } = useConfiguracoes()
  const { register, handleSubmit, setValue, watch, trigger, formState: { errors, isSubmitting } } = useForm<any>({
    shouldFocusError: false,
    defaultValues: {
      n_cupom: (cupom as any)?.n_cupom || '',
      estabelecimento: (cupom as any)?.estabelecimento || '',
      cnpj: (cupom as any)?.cnpj || '',
      valor_total: (cupom as any)?.valor_total || 0,
      valor_reembolso: (cupom as any)?.valor_reembolso || null,
      form_pgto: (cupom as any)?.form_pgto || '',
      data_registro: (cupom as any)?.data_registro || undefined,
  // Se o cupom carregar empresa_id, usar ele; caso contrário, usar transportadora string
  transportadora: (cupom as any)?.empresa_id ?? (cupom as any)?.transportadora ?? null,
      telefone: (cupom as any)?.telefone || null,
      status: (cupom as any)?.status || null,
      dono_cupom_id: (cupom as any)?.dono_cupom_id || undefined,
    }
  })

  // usuarios removed - using clientes for dono do cupom
  // const [usuarios, setUsuarios] = React.useState<any[]>([])
  const [clientes, setClientes] = React.useState<any[]>([])

  // Não formatar enquanto o usuário digita para evitar travamentos;
  // formatamos apenas quando o campo perde o foco (onBlur abaixo).

  React.useEffect(() => {
  // cupomApi.getAllUsers().then(u => setUsuarios(u)).catch(e => console.warn('erro usuarios', e))
  cupomApi.getAllClientes().then(c => setClientes(c)).catch(e => console.warn('erro clientes', e))
  }, [])

  // Se não houver transportadoras carregadas, tentar carregar uma vez ao montar o formulário
  React.useEffect(() => {
    if (empresas.length === 0 && typeof refreshEmpresas === 'function') {
      refreshEmpresas().catch((err: any) => console.warn('Erro ao carregar transportadoras no formulário', err))
    }
    // no cleanup necessary
  }, [empresas.length, refreshEmpresas])

  // produtos UI removed — form now only uses the DB fields

  const onSubmit = async (data: any) => {
    try {
      // basic duplicate check by n_cupom if provided
      if (!isEditing && cuponsExistentes.length > 0 && data.n_cupom) {
        const exists = cuponsExistentes.some(c => (c as any).n_cupom === data.n_cupom)
        if (exists) {
          toast({ title: 'Cupom Duplicado', description: 'Já existe um cupom com esse número', variant: 'destructive' })
          return
        }
      }

  // Map the simplified fields into the original CupomFiscalInput shape expected by the app/backend
      // garantir que data_registro esteja preenchida com o momento do salvamento
      if (!data.data_registro) {
        data.data_registro = new Date()
      }

      const payload: any = {
        dadosEstabelecimento: {
          razaoSocial: data.estabelecimento || '',
          endereco: '',
          cidade: '',
          telefone: data.telefone ? String(data.telefone) : '',
          cnpj: data.cnpj || '',
          ie: '',
          im: '',
          nomeFantasia: data.estabelecimento || ''
        },
        informacoesTransacao: {
          data: data.data_registro ? new Date(data.data_registro) : new Date(),
          hora: new Date().toTimeString().split(' ')[0],
          coo: '',
          ecf: '',
          numeroEcf: '',
          numeroCupom: (data as any).n_cupom || ''
        },
        dadosMotorista: {
          celular: data.telefone ? String(data.telefone) : '',
          nome: data.transportadora || ''
        },
        itens: [],
        totais: {
          valorTotal: Number(data.valor_total) || 0,
          formaPagamento: data.form_pgto || '',
          troco: 0,
          desconto: 0
        },
        observacoes: '',
        status: (data as any).status || 'Pendente',
  dono_cupom_id: Number((data as any).dono_cupom_id)
      }

      await onSave(payload)
      toast({ title: isEditing ? 'Cupom atualizado' : 'Cupom criado', description: isEditing ? 'Atualizado com sucesso' : 'Criado com sucesso' })
    } catch (error) {
      console.error('Erro ao salvar cupom', error)
      toast({ title: 'Erro', description: 'Erro ao salvar cupom', variant: 'destructive' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{isEditing ? 'Editar Cupom Fiscal' : 'Novo Cupom Fiscal'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="n_cupom">Número do Cupom (n_cupom)</Label>
                <Input id="n_cupom" {...register('n_cupom' as any, { required: 'Número do cupom é obrigatório' })} placeholder="Ex: CF-001" disabled={isSubmitting || isLoading} />
                {errors?.n_cupom && <div className="text-sm text-destructive mt-1">{String((errors.n_cupom as any).message)}</div>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estabelecimento">Estabelecimento</Label>
                <Input id="estabelecimento" {...register('estabelecimento' as any)} placeholder="Nome do estabelecimento" disabled={isSubmitting || isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  {...register('cnpj' as any)}
                  placeholder="00.000.000/0000-00"
                  disabled={isSubmitting || isLoading}
                  onBlur={(e) => {
                    const val = (e.target as HTMLInputElement).value
                    const formatted = formatCNPJ(val)
                    if (formatted !== val) setValue('cnpj' as any, formatted)
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_total">Valor Total (R$)</Label>
                <Input id="valor_total" type="number" step="0.01" min={0} {...register('valor_total' as any, { valueAsNumber: true, required: 'Valor total é obrigatório', validate: (v) => (Number(v) > 0) || 'Valor total deve ser maior que 0' })} placeholder="0,00" disabled={isSubmitting || isLoading} />
                {errors?.valor_total && <div className="text-sm text-destructive mt-1">{String((errors.valor_total as any).message)}</div>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_reembolso">Valor Reembolso (R$)</Label>
                <Input id="valor_reembolso" type="number" step="0.01" min={0} {...register('valor_reembolso' as any, { valueAsNumber: true })} placeholder="0,00" disabled={isSubmitting || isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form_pgto">Forma de Pagamento</Label>
                <Input id="form_pgto" {...register('form_pgto' as any)} placeholder="Pix, Dinheiro, Cartão..." disabled={isSubmitting || isLoading} />
              </div>

              {/* Data de registro é preenchida automaticamente no momento do salvamento (campo invisível) */}

              <div className="space-y-2">
                <Label htmlFor="transportadora">Transportadora (empresa)</Label>
                <Select value={String(watch('transportadora') ?? '__none')} onValueChange={(val) => setValue('transportadora' as any, val === '__none' ? null : Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma transportadora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Nenhum</SelectItem>
                    {empresas && empresas.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" type="number" {...register('telefone' as any, { valueAsNumber: true })} placeholder="DDD + número" disabled={isSubmitting || isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input id="status" {...register('status' as any)} placeholder="Pendente, Pago, Cancelado..." disabled={isSubmitting || isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente_id">Dono do Cupom (Cliente)</Label>
                {/* register a hidden input so cliente_id gets validated by react-hook-form */}
                <input type="hidden" {...register('dono_cupom_id' as any, { required: 'Dono do cupom é obrigatório' })} />
                <Select value={String(watch('dono_cupom_id') || '__none')} onValueChange={(val) => setValue('dono_cupom_id' as any, val === '__none' ? undefined : Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dono do cupom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Nenhum</SelectItem>
          {clientes.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors?.dono_cupom_id && <div className="text-sm text-destructive mt-1">{String((errors.dono_cupom_id as any).message)}</div>}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isLoading}><X className="w-4 h-4 mr-2" />Cancelar</Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                onClick={async () => {
                  console.log('Save button clicked')
                  try {
                    // ensure the form 'itens' and totals reflect the local produtos list before validating
                    const valid = await trigger()
                    console.log('Form valid?', valid)
                    if (!valid) console.log('Validation errors:', errors)
                  } catch (err) {
                    console.error('Error during trigger validation', err)
                  }
                }}
              >
                {isSubmitting || isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}