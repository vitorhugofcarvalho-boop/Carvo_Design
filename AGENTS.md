# Convenções do ProspectOS

## Deploy
Sempre rodar `npm run build` antes de qualquer deploy.
Após alterações no projeto, fazer commit, push e deploy na Vercel.
O deploy é automático via GitHub + Vercel (push para main dispara build).

## Build
```bash
npm run build      # app principal (tsc -b && vite build)
cd chrome-extension && npm run build   # extensão Chrome
```

## Extensão Chrome
- Código em `chrome-extension/`
- Build gera `chrome-extension/dist/`
- Carregar em `chrome://extensions` como não compactada

## Leads
- Cadastro via modal em `LeadsPage.tsx`
- Importação JSON disponível no modal "Novo lead"
- Mapper em `src/utils/importLead.ts`
