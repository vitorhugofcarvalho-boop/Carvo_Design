export interface AnalyzeInput {
  nome?: string
  seguidores?: string
  bioText?: string
  linkOferta?: string
}

export interface AnalyzeResult {
  nicho?: string
  produtoOferta?: string
  tipoOferta?: string
  sinalVendaPercebido?: string
  pontoPositivo?: string
  keywords?: string[]
}

const TEXTO = (txt: string | undefined) => (txt ?? '').toLowerCase()

function detectarNicho(input: string): { nicho?: string; keywords: string[]; confidence: number } {
  const t = TEXTO(input)
  const regras: [RegExp, string, string[]][] = [
    [/(liderança|lideranca|equipe|gestão|gestao|negócios|negocios|resultados|temperamento)/i, 'Liderança / Desenvolvimento profissional', ['liderança', 'gestão', 'negócios']],
    [/(nutrição|nutricao|emagrecimento|dieta|alimentação|alimentacao)/i, 'Nutrição / Saúde', ['nutrição', 'emagrecimento', 'dieta']],
    [/(social media|marketing|conteúdo|conteudo|tráfego|trafego)/i, 'Marketing digital', ['marketing', 'social media', 'tráfego']],
    [/(terapia|terapeuta|emocional|ansiedade|psicologia|psi)/i, 'Terapias / Desenvolvimento humano', ['terapia', 'emocional', 'ansiedade']],
    [/(estética|estetica|beleza|pele|maquiagem|skincare)/i, 'Estética / Beleza', ['estética', 'beleza', 'skincare']],
    [/(carreira|emprego|currículo|curriculo|entrevista)/i, 'Carreira', ['carreira', 'emprego', 'currículo']],
    [/(inglês|ingles|idioma|fluência|fluencia)/i, 'Educação / Idiomas', ['inglês', 'idioma', 'fluência']],
    [/(vendas|comercial|negração|negociacao)/i, 'Vendas', ['vendas', 'comercial', 'negociação']],
    [/(finanças|financas|investimento|dinheiro|economia)/i, 'Finanças / Investimentos', ['finanças', 'investimentos']],
    [/(fitness|academia|treino|musculação|musculacao|personal)/i, 'Fitness / Saúde', ['fitness', 'treino', 'personal']],
    [/(moda|estilo|roupa|look)/i, 'Moda / Estilo', ['moda', 'estilo']],
    [/(viagem|turismo|viajar|destino)/i, 'Viagem / Turismo', ['viagem', 'turismo']],
    [/(maternidade|mãe|mae|filhos|família|familia|parental)/i, 'Maternidade / Família', ['maternidade', 'filhos', 'família']],
    [/(empreendedorismo|empreendedor|startup|start-up)/i, 'Empreendedorismo', ['empreendedorismo', 'startup']],
  ]
  for (const [regex, nicho, kws] of regras) {
    if (regex.test(t)) return { nicho, keywords: kws, confidence: 2 }
  }
  return { nicho: undefined, keywords: [], confidence: 0 }
}

function detectarTipoOferta(input: string): { tipo?: string; produto?: string; keyword?: string } {
  const t = TEXTO(input)
  const regras: [RegExp, string, string | undefined][] = [
    /mentoria/i, 'Mentoria', 'Mentoria',
    /curso/i, 'Curso', 'Curso',
    /formação|formacao/i, 'Formação', 'Formação',
    /consultoria/i, 'Consultoria', 'Consultoria',
    /comunidade/i, 'Comunidade', 'Comunidade',
    /workshop|workshops/i, 'Workshop', 'Workshop',
    /imersão|imersao/i, 'Imersão', 'Imersão',
    /treinamento/i, 'Outro', 'Treinamento',
  ]
  for (let i = 0; i < regras.length; i += 3) {
    const [regex, tipo, keyword] = regras.slice(i, i + 3) as [RegExp, string, string | undefined]
    if (regex.test(t)) {
      return { tipo, produto: keyword ? `${keyword}` : undefined, keyword }
    }
  }
  return {}
}

function detectarSinaisVenda(input: string): string[] {
  const t = TEXTO(input)
  const sinais: [RegExp, string][] = [
    [/link.{0,10}(bio|da bio|externo)|site|\.com\.br/i, 'Link externo na bio'],
    [/inscrições.{0,5}abertas|inscricoes.{0,5}abertas/i, 'Inscrições abertas'],
    [/matrículas.{0,5}abertas|matriculas.{0,5}abertas/i, 'Matrículas abertas'],
    [/entre.{0,5}(na|para).{0,5}lista|lista.{0,5}(de|de.{0,5})espera/i, 'Lista de espera'],
    [/garanta.{0,5}(sua|a).{0,5}vaga/i, 'Garanta sua vaga'],
    [/fale.{0,5}comigo|chama.{0,5}(no|aqui)|me.{0,5}chama|chame.{0,5}(no|aqui)/i, 'Chame no direct'],
    [/treinamento|treino.{0,10}(online|presencial)/i, 'Treinamento'],
    [/mentoria|mentor/i, 'Mentoria'],
    [/resultados|cases|depoimentos|prova.{0,5}social/i, 'Resultados / Prova social'],
    [/alunos|clientes|alunas/i, 'Alunos / Clientes'],
    [/método|metodo|sistema|processo.{0,5}(exclusivo|próprio)/i, 'Método próprio'],
    [/turma.{0,5}(nova|aberta|em.{0,5}breve)|próxima.{0,5}turma|proxima.{0,5}turma/i, 'Turma'],
    [/destaque.{0,5}(comercial|produto|oferta)|destaques/i, 'Destaques comerciais'],
    [/linktr\.ee|linklist|beacons|bio\.site/i, 'Link externo na bio'],
  ]
  const encontrados: string[] = []
  for (const [regex, label] of sinais) {
    if (regex.test(t)) {
      if (!encontrados.includes(label)) encontrados.push(label)
    }
  }
  return encontrados
}

function gerarPontoPositivo(nome: string, nicho: string | undefined, seguidores: string, sinais: string[], linkOferta: string | undefined): string {
  const partes: string[] = []
  if (linkOferta) partes.push('link externo na bio')
  if (sinais.length > 0) partes.push('sinais comerciais detectados')
  if (nicho) partes.push('posicionamento de nicho identificado')
  const numSeg = parseInt(seguidores.replace(/[KkMm]/g, m => m === 'K' || m === 'k' ? '000' : '000000').replace(/[.,]/g, ''))
  if (numSeg >= 10000) partes.push('audiência relevante')
  if (numSeg >= 50000) partes.push('alto potencial de alcance')
  if (partes.length === 0) return 'Perfil com presença digital ativa.'
  return `Perfil com ${partes.join(', ').replace(/,([^,]*)$/, ' e$1')}.`
}

function analisePorRegras(input: AnalyzeInput): AnalyzeResult {
  const combined = `${input.nome ?? ''} ${input.bioText ?? ''} ${input.linkOferta ?? ''}`
  const nichoResult = detectarNicho(combined)
  const ofertaResult = detectarTipoOferta(combined)
  const sinais = detectarSinaisVenda(combined)
  const po = gerarPontoPositivo(input.nome ?? '', nichoResult.nicho, input.seguidores ?? '', sinais, input.linkOferta)

  return {
    nicho: nichoResult.nicho,
    produtoOferta: ofertaResult.produto,
    tipoOferta: ofertaResult.tipo,
    sinalVendaPercebido: sinais.length > 0 ? sinais.join('; ') : undefined,
    pontoPositivo: po,
    keywords: nichoResult.keywords,
  }
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `Você analisa perfis do Instagram para prospecção comercial. Com base nos dados fornecidos (nome, bio, seguidores, link da bio), responda APENAS um JSON sem formatação, sem markdown, sem código, sem explicações:

{
  "nicho": "categoria do nicho",
  "produtoOferta": "nome do produto ou serviço percebido",
  "tipoOferta": "Mentoria | Curso | Formação | Consultoria | Comunidade | Workshop | Imersão | Outro",
  "sinalVendaPercebido": "sinais de venda identificados, separados por ponto e vírgula",
  "pontoPositivo": "frase curta destacando pontos fortes do perfil",
  "keywords": ["palavra1", "palavra2"]
}

Regras:
- tipoOferta deve ser exatamente um dos valores listados
- Se não houver dados suficientes, deixe campos como null (não como string vazia)
- Seja objetivo e prático, foco em prospecção`

export async function analyzeInstagramProfileText(input: AnalyzeInput, geminiKey?: string): Promise<AnalyzeResult> {
  if (!geminiKey) return analisePorRegras(input)

  const prompt = `${SYSTEM_PROMPT}

Dados do perfil:
Nome: ${input.nome ?? 'não informado'}
Bio: ${input.bioText ?? 'não informado'}
Seguidores: ${input.seguidores ?? 'não informado'}
Link da bio: ${input.linkOferta ?? 'não informado'}`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
      }),
    })

    if (!res.ok) throw new Error(`Gemini: ${res.status}`)

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return analisePorRegras(input)

    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return {
      nicho: parsed.nicho ?? undefined,
      produtoOferta: parsed.produtoOferta ?? undefined,
      tipoOferta: parsed.tipoOferta ?? undefined,
      sinalVendaPercebido: parsed.sinalVendaPercebido ?? undefined,
      pontoPositivo: parsed.pontoPositivo ?? undefined,
      keywords: parsed.keywords ?? undefined,
    }
  } catch {
    return analisePorRegras(input)
  }
}
