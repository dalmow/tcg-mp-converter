# tcg-mp-converter

Ferramenta pessoal que converte uma Decklist de Pokémon TCG para o formato
de busca aceito por Marketplaces de cards avulsos, para comparar preço e
disponibilidade entre elas ao montar um deck.

## Language

**Decklist**:
Lista de cartas colada pelo usuário, no formato `quantidade nome coleção número` (estilo Limitless TCG). Entradas com a mesma Coleção e mesmo número são consideradas a mesma carta e têm suas quantidades somadas.
_Avoid_: Lista de compra, deck

**Coleção**:
Conjunto de cartas identificado por uma sigla, com um total de cartas conhecido.
_Avoid_: Set, expansão

**Qualidade**:
Escala de estado de conservação física da carta: `M`, `NM`, `SP`, `MP`, `HP`, `D`. Selecionada globalmente para a Decklist inteira.
_Avoid_: Condição, estado de conservação

**Idioma**:
Idioma de impressão da carta: `PTEN`, `PT`, `EN`. Selecionado globalmente para a Decklist inteira.

**Marketplace**:
Plataforma de compra de cards avulsos com seu próprio formato de linha de busca. Marketplaces suportadas: Liga Pokemon, MYPCards.

**Carta não resolvida**:
Carta da Decklist que não pode ser convertida — Coleção não cadastrada ou linha malformada. Reportada no painel de erros com o motivo, sem interromper a conversão das demais cartas.
