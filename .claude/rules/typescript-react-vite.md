## Padrões obrigatórios: TypeScript + React + Vite (MUST)

Siga estas regras em todo código novo ou alterado. Em caso de conflito com código legado, preserve o padrão existente no arquivo e sinalize a divergência.

### TypeScript
- MUST manter `strict: true` no `tsconfig` (incluindo `noUncheckedIndexedAccess` e `noImplicitOverride` quando possível).
- MUST NOT usar `any`. Use `unknown` + narrowing, generics ou tipos específicos.
- MUST NOT usar `@ts-ignore`. Se for inevitável, use `@ts-expect-error` com comentário explicando o motivo.
- MUST evitar type assertions (`as`) e non-null assertions (`!`). Prefira type guards e validação.
- MUST tipar explicitamente as props de componentes e o retorno de funções exportadas.
- MUST usar `import type` para imports apenas de tipo.
- MUST preferir `type` para unions e composições, e `interface` para contratos de objetos extensíveis.
- MUST usar union types discriminadas ou `as const` no lugar de `enum`.
- MUST validar dados externos (API, formulários, localStorage, query params) em runtime com um schema (ex.: Zod) e derivar o tipo dele (`z.infer`).

### React: componentes
- MUST usar apenas function components e hooks. Sem class components.
- MUST manter componentes pequenos e com responsabilidade única. Extraia lógica reutilizável em custom hooks (`useXxx`).
- MUST usar named exports (exceto onde o framework/lazy loading exigir default).
- MUST NOT definir componentes dentro de outros componentes.
- MUST usar `key` estável e única em listas (nunca o índice quando a lista pode mudar).
- MUST preferir composição (`children`, slots) a prop drilling excessivo ou herança.
- MUST separar componentes de apresentação de lógica de dados quando a complexidade justificar.

### React: hooks e estado
- MUST seguir as regras dos hooks e manter o `eslint-plugin-react-hooks` ativo, sem silenciar `exhaustive-deps`.
- MUST derivar valores durante o render em vez de duplicar em estado. Se dá para calcular a partir de props/estado, não crie outro `useState`.
- MUST NOT usar `useEffect` para transformar dados ou reagir a eventos do usuário. Use cálculo no render ou event handlers. Reserve effects para sincronização com sistemas externos e sempre limpe (cleanup) subscriptions, timers e listeners.
- MUST manter o estado o mais local possível; só eleve quando necessário.
- MUST separar estado de servidor (TanStack Query ou equivalente do projeto) de estado de UI (useState/useReducer/store leve).
- MUST usar `useReducer` quando houver estado com várias transições relacionadas.
- MUST NOT usar `useMemo`/`useCallback`/`React.memo` por padrão. Use somente com medição ou necessidade clara (referência estável para dependência, cálculo caro). Se o projeto usa React Compiler, não adicione memoização manual.

### Dados e async
- MUST tratar sempre os três estados: loading, erro e sucesso (e vazio quando aplicável).
- MUST usar Error Boundaries nas fronteiras de rota/feature.
- MUST cancelar requisições obsoletas (`AbortController` ou o mecanismo da biblioteca).
- MUST centralizar chamadas HTTP em uma camada de API tipada, sem `fetch` espalhado em componentes.

### Estrutura do projeto
- MUST organizar por feature (`features/<nome>/{components,hooks,api,types}`), com módulos compartilhados em `shared/` ou `lib/`.
- MUST usar path aliases (`@/`) configurados em `tsconfig.json` e `vite.config.ts`, sem imports relativos profundos (`../../../`).
- MUST evitar dependências circulares entre módulos.
- MUST usar nomes consistentes: componentes em `PascalCase`, hooks em `useCamelCase`, utilitários em `camelCase`, constantes em `UPPER_SNAKE_CASE`.

### Vite
- MUST acessar variáveis de ambiente via `import.meta.env`, e somente com prefixo `VITE_` para o que for exposto ao cliente.
- MUST NOT colocar segredos, chaves privadas ou tokens em variáveis `VITE_*` (elas vão para o bundle).
- MUST tipar as variáveis de ambiente em `vite-env.d.ts` (`ImportMetaEnv`) e validá-las na inicialização.
- MUST usar `React.lazy` + `Suspense` e `import()` dinâmico para code splitting por rota.
- MUST NOT importar bibliotecas inteiras quando houver import granular (ex.: ícones, utilitários).
- MUST manter assets estáticos em `public/` somente quando precisarem de URL fixa. Os demais importe via módulo para receber hash.
- MUST revisar o tamanho do bundle (`vite build` + analyzer) ao adicionar dependências pesadas.

### Qualidade e tooling
- MUST passar em `tsc --noEmit`, ESLint e o formatter (Prettier ou Biome) sem erros nem warnings antes de concluir qualquer tarefa.
- MUST NOT desabilitar regras de lint sem justificativa em comentário.
- MUST escrever testes para lógica de negócio, hooks e componentes críticos (Vitest + React Testing Library).
- MUST testar comportamento do usuário (queries por role/label/text), não detalhes de implementação.
- MUST NOT usar `data-testid` quando houver query semântica disponível.

### Acessibilidade e UX
- MUST usar HTML semântico (`button`, `nav`, `main`, `label`) antes de `div` com handlers.
- MUST garantir navegação por teclado, foco visível e `alt` em imagens.
- MUST associar todo input a um `label` e exibir erros de forma acessível (`aria-describedby`, `role="alert"`).
- MUST NOT usar `onClick` em elementos não interativos sem `role` e suporte a teclado.

### Segurança
- MUST NOT usar `dangerouslySetInnerHTML` sem sanitização (ex.: DOMPurify).
- MUST NOT guardar tokens de autenticação sensíveis em `localStorage` se houver alternativa (cookies `HttpOnly`).
- MUST validar e sanitizar toda entrada de usuário antes de enviar ou renderizar.
- MUST manter dependências atualizadas e sem vulnerabilidades conhecidas (`npm audit`).

### Estilo de código
- MUST preferir `const`, funções puras e imutabilidade (sem mutar props, estado ou arrays/objetos recebidos).
- MUST usar early returns para reduzir aninhamento.
- MUST NOT deixar `console.log`, código comentado ou `TODO` sem issue associada.
- MUST escrever comentários para explicar o porquê, não o quê.
