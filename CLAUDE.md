## Navegação de código (codebase-memory-mcp): OBRIGATÓRIO

Este projeto está indexado no `codebase-memory-mcp`. Toda busca e análise de código DEVE passar pelas tools desse MCP. Não use Grep, Glob, `find`, `grep`, `rg` ou `cat` para explorar código.

### Obrigatório via MCP
- Localizar funções, classes, métodos, variáveis e símbolos
- Descobrir quem chama o quê e quais são as dependências
- Analisar impacto antes de qualquer alteração
- Entender arquitetura e relação entre módulos
- Encontrar código morto ou não utilizado
- Listar arquivos e estrutura do código

### Fluxo padrão
1. Consulte o MCP para localizar o que precisa.
2. Use Read apenas nos trechos ou arquivos que o MCP indicou, quando precisar do conteúdo exato para editar.
3. Antes de editar uma função ou módulo, consulte o MCP para ver o que depende dele.

### Proibido
- Usar Grep, Glob ou comandos de shell de busca (`grep`, `rg`, `find`) para procurar código
- Ler arquivos inteiros "para ver o que tem" sem consultar o MCP antes
- Começar uma tarefa sem consultar o MCP

### Únicas exceções
- Busca de texto literal em arquivos que não são código (docs, configs, .env.example, logs)
- O MCP falhou, retornou vazio ou o índice está desatualizado. Nesse caso: (1) tente reindexar o projeto, (2) se persistir, avise o usuário que está usando busca direta e por quê.

### Manutenção do índice
- Reindexe após mudanças grandes (novos módulos, refactors, troca de branch).
- Se o MCP e o código-fonte divergirem, o código-fonte atual é a verdade.

## Reaproveitamento antes de criar (MUST)

Antes de criar qualquer função, hook, componente, tipo, arquivo, util ou comportamento novo, verifique se já existe algo no projeto que resolva ou possa ser estendido.

### Checklist obrigatório (nesta ordem)
1. MUST consultar o `codebase-memory-mcp` por símbolos, nomes e responsabilidades semelhantes (ex.: `formatDate`, `useDebounce`, `Button`, validações, clientes de API, tipos).
2. MUST verificar os locais comuns de código compartilhado (`shared/`, `lib/`, `utils/`, `hooks/`, `components/ui/`) e a feature vizinha.
3. MUST verificar se uma dependência já instalada no projeto resolve o problema antes de escrever código próprio ou adicionar uma biblioteca nova.
4. Se existir algo parecido: MUST reutilizar. Se não atender 100%, estender ou generalizar o existente em vez de criar uma variação paralela.
5. Só crie algo novo se nada existente servir, e em uma frase informe o que foi procurado e por que não serviu.

### Princípios
- **DRY:** MUST NOT duplicar lógica, tipos, constantes, estilos ou componentes. Na terceira repetição, extraia (regra dos três). Não abstraia cedo demais com apenas uma ocorrência.
- **SRP:** cada função, hook ou componente tem uma única razão para mudar.
- **OCP:** estenda comportamento por composição, props ou parâmetros, sem alterar o que já funciona para outros consumidores.
- **LSP:** variações de um componente ou contrato devem ser substituíveis sem quebrar quem os usa.
- **ISP:** props e interfaces pequenas e específicas. Não force consumidores a depender do que não usam.
- **DIP:** dependa de abstrações (tipos, interfaces, funções injetadas), não de implementações concretas. Isole APIs externas atrás de uma camada própria.
- **KISS / YAGNI:** a solução mais simples que resolve o requisito atual. Sem parâmetros, flags ou camadas "para o futuro".

### Proibido
- Criar um segundo componente, hook ou util com a mesma finalidade de um existente.
- Copiar e colar um bloco e alterar pequenos detalhes. Parametrize ou extraia.
- Criar arquivo novo quando a mudança cabe naturalmente em um módulo existente.
- Adicionar uma dependência para algo que o projeto já faz.
- Duplicar tipos que podem ser derivados (`Pick`, `Omit`, `z.infer`, `ReturnType`).

### Ao refatorar para reaproveitar
- Mantenha a mudança mínima e não altere o comportamento dos consumidores atuais.
- Rode os testes existentes dos consumidores afetados (use o MCP para listar quem depende do código alterado).

## Estratégia de testes (MUST)

Teste o que importa: comportamento, estado e regras de negócio. Testes são para dar confiança em mudanças futuras, não para espelhar o código.

### Escreva testes que validem
- Comportamento observável pelo usuário (clicar, digitar, submeter e ver o resultado).
- Regras de negócio, cálculos, transformações e validações.
- Transições de estado e efeitos colaterais relevantes (chamada de API com os parâmetros certos, navegação, mensagens de erro).
- Casos de borda e falha: vazio, erro de rede, entrada inválida, permissões.
- Contratos de hooks e utilitários (entrada → saída).
- Prevenção de duplicação: lista sem itens repetidos, componente renderizado uma única vez, ação disparada uma única vez.
- Regressões: todo bug corrigido ganha um teste que o reproduz.

### NÃO escreva testes que
- Validem detalhes de estilo ou valores triviais (cor, margem, classe CSS, texto estático) só porque o código mudou.
- Testem implementação interna (nomes de estado, número de renders, chamadas internas de `useState`).
- Façam snapshot de componentes grandes. Snapshots só para saídas pequenas e estáveis.
- Repitam o que o TypeScript já garante (tipos, props obrigatórias).
- Testem código de bibliotecas de terceiros.
- Dupliquem a cobertura de outro teste existente.
- Exijam mock de tudo. Mocke apenas fronteiras externas (rede, tempo, storage).

### Como escrever
- MUST consultar os testes existentes antes de criar um novo. Se o cenário já está coberto, estenda o teste existente.
- MUST nomear o teste pelo comportamento: `"exibe erro quando o e-mail é inválido"`, não `"testa o componente Form"`.
- MUST usar queries semânticas (`getByRole`, `getByLabelText`) e simular interação real (`userEvent`).
- MUST seguir Arrange / Act / Assert, com um conceito por teste.
- MUST manter testes independentes entre si, determinísticos e sem depender de ordem de execução.
- MUST NOT ajustar um teste apenas para fazê-lo passar. Se o teste quebrou, entenda se o comportamento mudou de propósito ou se há um bug.
- Mudança puramente visual (cor, espaçamento, tipografia) NÃO exige teste novo, a menos que o visual carregue regra de negócio (ex.: status de erro que deve aparecer destacado para acessibilidade).

### Antes de concluir uma tarefa
- Pergunte: "se esse teste quebrar, indica um problema real para o usuário ou para o negócio?" Se não, não escreva.
- Rode a suíte dos módulos afetados e garanta que passa.