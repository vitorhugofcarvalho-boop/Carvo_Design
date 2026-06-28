import type { Lead } from '@/types'
import { PRIORIDADE } from '@/types'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { formatarSeguidores, dataRelativa, formatarData } from '@/utils/formatting'
import { STATUS_LEAD } from '@/types'
import { InstagramIcon } from './ui/InstagramIcon'
import { openInstagramInTab } from '@/utils/embedded'

export function LeadCard({
  lead,
  onClick,
}: {
  lead: Lead
  onClick?: () => void
}) {
  const statusInfo = STATUS_LEAD.find((s) => s.valor === lead.status)
  const prioInfo = PRIORIDADE[lead.prioridade]

  return (
    <Card
      className="cursor-pointer transition-all hover:border-brand-primary/40 active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-brand-platinum truncate">{lead.nome}</h3>
          <p className="text-xs text-brand-platinum/40 mt-0.5">
            @{lead.perfilInstagram || 'sem perfil'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {lead.linkPerfil && (
            <button
              onClick={(e) => { e.stopPropagation(); openInstagramInTab(lead.linkPerfil) }}
              className="rounded-md p-1 text-brand-platinum/60 transition-colors hover:text-brand-accent hover:bg-brand-accent/10"
              title="Abrir perfil no Instagram"
            >
              <InstagramIcon className="size-4" />
            </button>
          )}
          <Badge className={prioInfo.cor}>{prioInfo.rotulo}</Badge>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {statusInfo && (
          <Badge className={statusInfo.cor}>{statusInfo.rotulo}</Badge>
        )}
        {lead.fonte === 'extensao' && (
          <Badge className="bg-violet-500/15 text-violet-300">Extensão</Badge>
        )}
        {lead.seguidores > 0 && (
          <span className="text-[11px] text-brand-platinum/30 tabular-nums">
            {formatarSeguidores(lead.seguidores)} seg
          </span>
        )}
      </div>

      {(lead.nicho || lead.produtoOferta) && (
        <div className="mt-2 text-xs text-brand-platinum/50 leading-relaxed line-clamp-2">
          {lead.nicho && <span>{lead.nicho}</span>}
          {lead.nicho && lead.produtoOferta && <span> · </span>}
          {lead.produtoOferta && <span>{lead.produtoOferta}</span>}
        </div>
      )}

      {lead.nota > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-brand-base overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-primary transition-all"
              style={{ width: `${(lead.nota / 10) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-brand-primary tabular-nums">{lead.nota}/10</span>
        </div>
      )}

      {lead.proximoFollowUp && (
        <p className="mt-2 text-[11px] text-brand-platinum/40">
          Follow-up: {dataRelativa(lead.proximoFollowUp)} ({formatarData(lead.proximoFollowUp)})
        </p>
      )}

      {lead.proximaAcao && (
        <p className="mt-1 text-[11px] text-brand-accent/70 truncate">
          {lead.proximaAcao}
        </p>
      )}
    </Card>
  )
}
