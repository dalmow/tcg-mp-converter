# tcg-mp-converter

Conversor de Decklist de Pokémon TCG para o formato de busca das
marketplaces Liga Pokemon e MYPCards. Ver `CONTEXT.md` para o glossário de
domínio.

## Regras de conversão

Número da carta e total da Coleção sempre com padding left até 3 dígitos
(`005`, `053`, `132`).

- **Liga Pokemon**: `qtd nome (num/total) [QUALIDADE=X][IDIOMA=Y]`
- **MYPCards**: `qtd nome (num/total)` — sem tags de Qualidade/Idioma.

Exemplo (`3 Abra MEG 53`, Qualidade NM, Idioma PTEN):
- Liga Pokemon: `3 Abra (053/132) [QUALIDADE=NM][IDIOMA=PTEN]`
- MYPCards: `3 Abra (053/132)`

## Config de coleções

Arquivo JSON local no repo, importado em build-time (sem tela de
administração). Mapeia sigla da Coleção para o total de cartas, ex:
`{"MEG": 132}`. Editado manualmente.

## Layout

1. Decklist: textarea de input + botão "Converter".
2. Painel de config: badges de Qualidade e Idioma, empilhados.
3. Output em 2 colunas lado a lado (Liga Pokemon | MYPCards), cada uma com
   textarea no-resize (scroll interno) e botão de copiar próprio.
4. Painel de erros abaixo, uma linha por Carta não resolvida.

## Stack

- SPA em Vite (sem backend).
- Componentes via shadcn/ui (CLI).
- Tailwind CSS, tema dark como padrão.
- Deploy: Vercel, domínio próprio.

## Dev

```
npm install
npm run dev
```
