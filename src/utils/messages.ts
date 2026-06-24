import type { Lead } from '@/types'

export type TemplateKey =
  | 'primeira_abordagem'
  | 'diagnostico_rapido'
  | 'quanto_cobra'
  | 'ja_tenho_designer'
  | 'followup_dia_2'
  | 'followup_dia_4'
  | 'followup_dia_7'
  | 'personalizada'

export const TEMPLATES: Record<TemplateKey, string> = {
  primeira_abordagem: `Oi, [nome]. Vi que você trabalha com [nicho] e tem uma [produto] para [publico].

Eu trabalho ajudando infoprodutores a deixarem a comunicação visual mais forte, desde identidade e criativos até landing pages.

Mas antes de falar qualquer coisa sobre serviço: posso te mandar uma percepção rápida sobre uma melhoria visual que eu faria no seu perfil/página?`,

  diagnostico_rapido: `[nome], dei uma olhada mais atenta no seu perfil/página.

Um ponto que chamou minha atenção: [problema visual percebido].

Isso pode estar custando conversão porque [consequência].

Se quiser, posso detalhar melhor esse diagnóstico em uma call rápida de 15 minutos — sem compromisso.`,

  quanto_cobra: `[nome], entendo que preço é importante. Mas antes de falar em valores, deixa eu te explicar como eu trabalho:

Eu não vendo "página bonita". Eu vendo uma página que posiciona sua oferta, organiza a mensagem e remove atrito visual — o que impacta diretamente na conversão.

Cada caso é um caso, por isso eu primeiro entendo seu cenário pra depois desenhar uma proposta justa.

Topa uma conversa rápida pra eu entender melhor seu momento?`,

  ja_tenho_designer: `[nome], entendo. E se você já tem alguém que entrega o que precisa, não faz sentido trocar.

Mas se em algum momento sentir que poderia ter um olhar externo focado especificamente em posicionamento de oferta e conversão — e não só em "fazer bonito" — fico à disposição.

É uma proposta diferente. Se fizer sentido um dia, é só chamar.`,

  followup_dia_2: `[nome], passando só para complementar a mensagem anterior: minha ideia não era te vender algo do nada, tá?

Eu realmente vi uma oportunidade visual que poderia deixar sua oferta mais forte para quem chega frio.

Posso te mandar em 2 linhas?`,

  followup_dia_4: `Vi um ponto bem específico no seu perfil: sua comunicação já mostra conhecimento, mas a parte visual poderia deixar mais claro o valor da sua [produto].

Principalmente em [bio/destaques/capas/página/CTA].

Isso pode fazer diferença para quem chega agora e ainda não te conhece.`,

  followup_dia_7: `[nome], vou deixar essa ideia por aqui para não ficar te incomodando.

Mas achei válido comentar porque sua oferta parece ter potencial e talvez uma melhoria visual ajude a transmitir mais autoridade.

Se em algum momento fizer sentido revisar essa parte, fico à disposição.`,

  personalizada: `Oi, [nome]. Vi que você trabalha com [nicho] e tem uma [produto] para [publico ou nicho].

Eu trabalho ajudando infoprodutores a deixarem a comunicação visual mais forte, desde identidade e criativos até landing pages.

Mas antes de falar qualquer coisa sobre serviço: posso te mandar uma percepção rápida sobre uma melhoria visual que eu faria no seu perfil/página?`,
}

export const TEMPLATE_META: { key: TemplateKey; title: string; desc: string }[] = [
  { key: 'personalizada', title: 'Mensagem personalizada', desc: 'Baseada nos dados do lead' },
  { key: 'primeira_abordagem', title: 'Primeira abordagem', desc: 'DM inicial de prospecção' },
  { key: 'diagnostico_rapido', title: 'Diagnóstico rápido', desc: 'Após lead responder' },
  { key: 'quanto_cobra', title: 'Resposta para "quanto cobra?"', desc: 'Objeção de preço' },
  { key: 'ja_tenho_designer', title: 'Resposta para "já tenho designer"', desc: 'Objeção de concorrência' },
  { key: 'followup_dia_2', title: 'Follow-up Dia 2', desc: '1º follow-up' },
  { key: 'followup_dia_4', title: 'Follow-up Dia 4', desc: '2º follow-up' },
  { key: 'followup_dia_7', title: 'Follow-up Dia 7', desc: 'Encerramento elegante' },
]

export function gerarMensagem(lead: Lead, template: string): string {
  const publico = lead.nicho
  const tipo = lead.tipoOferta === 'outro' ? 'oferta' : lead.tipoOferta

  return template
    .replace(/\[nome\]/g, lead.nome.split(' ')[0])
    .replace(/\[nicho\]/g, lead.nicho.toLowerCase())
    .replace(/\[produto\]/g, lead.produtoOferta.toLowerCase() || tipo)
    .replace(/\[tipo\]/g, tipo)
    .replace(/\[publico\]/g, publico.toLowerCase())
    .replace(/\[problema visual percebido\]/g, lead.problemaVisualPercebido.toLowerCase() || 'identidade visual que não transmite autoridade')
    .replace(/\[consequência\]/g, 'a pessoa que chega fria no seu perfil pode não levar a oferta a sério')
}
