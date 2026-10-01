# tcg-mp-converter

Ferramenta pessoal que converte uma Decklist de Pokémon TCG para o formato
de busca aceito por Marketplaces de cards avulsos, para comparar preço e
disponibilidade entre elas ao montar um deck.

## Language

**Decklist**:
Lista de cartas colada pelo usuário, no formato `quantidade nome coleção número` (estilo Limitless TCG). Entradas com a mesma Coleção e mesmo número são consideradas a mesma carta e têm suas quantidades somadas.
_Avoid_: Lista de compra

**Deck**:
Baralho nomeado, montado e salvo no portal, com no máximo 60 cartas. Composto por Cartas do deck. Só é válido com exatamente 60 cartas, linhas válidas, no máximo 4 cópias por nome (energia básica isenta) e Adquirido suficiente para cada linha. Pode ser salvo inválido (rascunho). Identificado por `id`; nomes não são únicos. Em código: `Deck`.
_Avoid_: Decklist (a Decklist é só o texto colado no Conversor)

**Carta do deck**:
Linha de um Deck: categoria (Pokémon, Treinador ou Energia), chave da carta e quantidade. Uma linha por chave de carta por Deck. Em código: `DeckCard`. A chave é única no mapa global de Adquirido: Pokémon e Energia especial usam `COLEÇÃO-número` (ex.: `MEG-54`); Treinador usa o nome normalizado (sem acentos, minúsculo; um número final faz parte do nome, a menos que venha após uma sigla de Coleção cadastrada); Energia básica usa `energy:<tipo normalizado>` (ex.: `energy:fogo`), para nunca colidir com um Treinador de mesmo nome.

**Adquirido**:
Quantidade física que o usuário possui de uma carta. Mapa global, compartilhado por todos os Decks e pela Manutenção; carta sem registro vale 0. Só é gravado ao salvar a linha. Em código: `owned`.

**Manutenção**:
Tela que lista toda carta que aparece ou já apareceu em algum Deck, com o Adquirido editável. A quantidade necessária é o máximo da quantidade da carta entre os Decks (uma carta física é reutilizada entre Decks). Em código: `maintenance`.

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
