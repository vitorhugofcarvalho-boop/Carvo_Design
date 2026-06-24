import { useRef, useState } from 'react'
import { Download, Upload, FileSpreadsheet, Database, RefreshCw } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { baixarCSV } from '@/utils/csv'
import { baixarBackup, importarBackup } from '@/utils/backup'
import { SAMPLE_LEADS } from '@/data/sampleData'
import { store } from '@/data/store'

export function SettingsPage() {
  const { leads, salvar } = useLeads()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<string | null>(null)

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        importarBackup(text)
        setImportStatus('Backup importado com sucesso! Recarregue a página.')
        setTimeout(() => window.location.reload(), 1500)
      } catch (err) {
        setImportStatus(`Erro: ${(err as Error).message}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function carregarExemplos() {
    salvar([...leads, ...SAMPLE_LEADS])
    setImportStatus('Dados de exemplo carregados! Recarregue a página.')
    setTimeout(() => window.location.reload(), 1500)
  }

  function limparDados() {
    if (confirm('Tem certeza? Todos os dados serão perdidos.')) {
      store.salvarLeads([])
      setImportStatus('Dados limpos. Recarregue a página.')
      setTimeout(() => window.location.reload(), 1500)
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Configurações"
        subtitulo="Exportação, importação e dados"
      />

      {importStatus && (
        <div className="mb-4 rounded-lg border border-brand-accent/30 bg-brand-accent/10 px-4 py-2 text-sm text-brand-accent">
          {importStatus}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-brand-platinum mb-3 flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-brand-accent" />
            Exportar CSV
          </h2>
          <p className="text-sm text-brand-platinum/50 mb-3">
            Baixe todos os leads em formato CSV para abrir no Excel, Google Sheets ou Notion.
          </p>
          <Button
            variante="secundario"
            className="w-full"
            onClick={() => baixarCSV(leads)}
            disabled={leads.length === 0}
          >
            <Download className="size-4" /> Exportar CSV
          </Button>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-platinum mb-3 flex items-center gap-2">
            <Database className="size-4 text-brand-accent" />
            Backup JSON
          </h2>
          <p className="text-sm text-brand-platinum/50 mb-3">
            Exporte um backup completo (leads, checklist, relatórios) em JSON.
          </p>
          <div className="flex gap-2">
            <Button
              variante="secundario"
              className="flex-1"
              onClick={baixarBackup}
            >
              <Download className="size-4" /> Exportar
            </Button>
            <Button
              variante="secundario"
              className="flex-1"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" /> Importar
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJSON}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-platinum mb-3 flex items-center gap-2">
            <RefreshCw className="size-4 text-brand-accent" />
            Dados de exemplo
          </h2>
          <p className="text-sm text-brand-platinum/50 mb-3">
            Carregue leads fictícios para testar o funcionamento do app.
          </p>
          <Button
            variante="secundario"
            className="w-full"
            onClick={carregarExemplos}
          >
            Carregar exemplos
          </Button>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-platinum mb-3">Danger zone</h2>
          <p className="text-sm text-brand-platinum/50 mb-3">
            Limpa todos os dados do app. Esta ação não pode ser desfeita.
          </p>
          <Button
            variante="perigo"
            className="w-full"
            onClick={limparDados}
            disabled={leads.length === 0}
          >
            Limpar todos os dados
          </Button>
        </Card>
      </div>
    </div>
  )
}
