# Manager de Futebol Minimalista — Plano Executável

> **Documento técnico-executivo para implementação assistida por IA (Codex).**
> Versão 2.0 — Rev. completa do plano original, com arquitetura, contratos, regras de negócio, prompts de IA e roadmap detalhado por sprints.

---

## 0. Como o Codex deve usar este documento

Este documento é um **briefing de execução**. Cada seção descreve **o que** construir, **como** construir, e **em que ordem**. As regras a seguir são vinculantes:

1. **Ordem de execução**: siga o roadmap da Seção 14 do topo para baixo. Não pule fases.
2. **Não invente features**: se uma ideia não está aqui, adicione na seção `BACKLOG.md` e siga adiante.
3. **Tipagem rigorosa**: TypeScript em `strict` mode. `any` é proibido fora de `unknown`-narrowing.
4. **Determinismo**: toda simulação usa um RNG semeado (Mulberry32). Mesma seed → mesmo resultado.
5. **Pure functions na engine**: a pasta `engine/` não pode importar de `ui/`, `db/`, ou `electron/tauri`.
6. **Test-first nos sistemas críticos**: simulação, transferências e progressão de jogadores precisam de testes antes do merge.
7. **Commits convencionais**: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`.
8. **Regra de ouro do projeto**: antes de qualquer feature nova, responda por escrito: *"Isso deixa o jogo mais divertido ou apenas mais complicado?"* Se for o segundo, descarte.

---

## 1. Visão e identidade do produto

### 1.1. Pitch em uma frase
> Um manager de futebol que você abre para jogar 15 minutos e descobre, três horas depois, que ainda está montando o elenco para a próxima temporada.

### 1.2. Inspirações diretas
- **Brasfoot / Elifoot** — simplicidade, foco em campeonato brasileiro, partidas rápidas.
- **Football Manager** — apenas como referência do que **não** fazer (complexidade, micromanagement, telas profundas).
- **Linear, Raycast, Things 3** — referências de UX/UI: tipografia forte, navegação por teclado, dark mode elegante.
- **Balatro, Slay the Spire** — referências de loop de gameplay viciante: turnos curtos, decisões claras, progressão visível.

### 1.3. Pilares de design (não negociáveis)
| Pilar | Tradução prática |
|---|---|
| **Rápido** | Uma temporada inteira em < 90 min reais. Nenhuma tela carrega > 100 ms. |
| **Simples** | Máximo 6 atributos por jogador. Máximo 4 telas no fluxo principal. |
| **Divertido** | Eventos narrativos em toda partida. Surpresas semanais. |
| **Limpo** | Dark UI, tipografia, espaço em branco. Zero ícones decorativos. |
| **Determinístico** | Save reproduzível. Replay de temporada possível. |

### 1.4. Anti-pilares (o que recusamos fazer)
- ❌ Treinos individuais semanais.
- ❌ Conferência de imprensa antes de cada partida.
- ❌ Sistema financeiro com balanço, dívidas e bancos.
- ❌ Agentes de jogadores com personalidade.
- ❌ Mais de 20 atributos por jogador.
- ❌ Editor 3D de táticas.

---

## 2. Personas

### 2.1. Persona principal — "O Nostálgico Adulto"
- 28-45 anos, jogou Brasfoot na adolescência.
- Tem 30-90 minutos por sessão, geralmente à noite.
- Quer uma temporada inteira em poucas sessões.
- Detesta tutoriais longos.

### 2.2. Persona secundária — "O Curioso de FM"
- Tentou Football Manager, achou opressor.
- Quer a fantasia de gestão sem a planilha.
- Valoriza estética moderna.

### 2.3. Não-persona
- Hardcore de simulação tática 3D. Esse jogador **não é** o nosso público.

---

## 3. Stack técnica recomendada (ajustada)

### 3.1. Decisões de stack e razões

| Camada | Escolha | Por quê |
|---|---|---|
| **Linguagem** | TypeScript 5.x `strict` | Tipos = documentação executável. Codex se sai melhor com tipos fortes. |
| **Runtime / wrapper** | **Tauri 2.x** | ~10 MB vs ~150 MB do Electron. Inicialização <1s. |
| **Frontend** | **React 18 + Vite** | Hot reload < 200 ms. Codex domina o ecossistema. |
| **Estado global** | **Zustand** + **Immer** | Sem boilerplate de Redux. Imutabilidade automática. |
| **Roteamento** | **TanStack Router** | Type-safe, ideal para um dashboard de telas curtas. |
| **Estilo** | **Tailwind CSS 3** + **CSS variables** para tokens | Velocidade + tema dark/light trocável. |
| **Componentes** | **shadcn/ui** (copiados, não dependência) | Você é dono do código. Customização total. |
| **Ícones** | **Lucide** | Consistência visual, leve. |
| **Animação** | **Framer Motion** (uso parcimonioso) | Apenas em transição de tela e gols. |
| **Persistência (MVP)** | **JSON via Tauri FS API** | Simples, debugável. |
| **Persistência (v0.5+)** | **SQLite via `tauri-plugin-sql`** | Migration quando o JSON ficar lento (>5MB). |
| **Testes** | **Vitest** + **Testing Library** + **Playwright** (e2e) | Padrão de mercado, Vitest é rápido. |
| **Linter / Formatter** | **Biome** | 20× mais rápido que ESLint+Prettier. |
| **RNG** | **Mulberry32** (seedável) implementado in-house | Deterministic. Sem dependência. |
| **Datas** | **date-fns** | Imutável, tree-shakeable. |
| **Validação** | **Zod** | Schemas reutilizáveis para save-files. |
| **Geração procedural de nomes** | Tabela própria + Markov chain leve | Sem chamada externa. |
| **CI** | **GitHub Actions** | Build em macOS/Windows/Linux com matrix. |

### 3.2. Decisões explicitamente recusadas
- **Electron** — peso desnecessário.
- **Redux Toolkit** — overkill para um single-player local.
- **Next.js** — não há servidor. Vite basta.
- **Prisma** — pesado para SQLite local; usar `better-sqlite3` ou `tauri-plugin-sql` direto.
- **Phaser/Pixi** — partida é simulada por texto e cards, não há render 2D.

---

## 4. Arquitetura de pastas

```
manager-minimalista/
├── src/
│   ├── engine/                 # Núcleo puro (sem React, sem Tauri)
│   │   ├── rng/                # Mulberry32 + helpers (weighted, between)
│   │   ├── domain/             # Tipos: Player, Club, League, Match, Season
│   │   ├── simulation/
│   │   │   ├── match.ts        # Simulação de partida (90 min em ~10 ms)
│   │   │   ├── season.ts       # Avança rodada, copa, calendário
│   │   │   ├── ratings.ts      # Cálculo de força do time
│   │   │   └── progression.ts  # Evolução/decadência de atributos
│   │   ├── transfers/
│   │   │   ├── market.ts       # Mercado dinâmico
│   │   │   ├── valuation.ts    # Cálculo de valor de jogador
│   │   │   └── ai.ts           # IA dos clubes da CPU
│   │   ├── events/             # Eventos narrativos durante a partida
│   │   ├── news/               # Geração procedural de manchetes
│   │   ├── generation/         # Geração de jogadores e elenco inicial
│   │   └── index.ts            # Barrel exclusivo da engine
│   ├── data/                   # Conteúdo estático (JSON)
│   │   ├── leagues/            # serie-a.json, serie-b.json
│   │   ├── name-pools/         # nomes-br.json, sobrenomes-br.json
│   │   ├── narrative/          # templates de notícias e eventos
│   │   └── tactics.json        # Esquemas táticos (4-3-3, 4-4-2, etc.)
│   ├── store/                  # Zustand stores (cola entre engine e UI)
│   │   ├── game.store.ts       # Estado global da partida em curso
│   │   ├── settings.store.ts   # Preferências do jogador
│   │   └── selectors.ts
│   ├── persistence/
│   │   ├── save.ts             # Serializa/desserializa GameState
│   │   ├── migrations.ts       # Versionamento de save
│   │   └── schemas.ts          # Zod schemas
│   ├── ui/
│   │   ├── components/         # Átomos e moléculas (shadcn-based)
│   │   ├── features/           # Fatias de UI por feature
│   │   │   ├── squad/          # Tela de elenco
│   │   │   ├── tactics/        # Tela de tática
│   │   │   ├── match-day/      # Tela de partida
│   │   │   ├── league-table/
│   │   │   ├── transfers/
│   │   │   ├── news-feed/
│   │   │   └── home/
│   │   ├── layouts/
│   │   ├── theme/              # Tokens CSS, cores, tipografia
│   │   └── router.tsx
│   ├── hooks/
│   ├── lib/                    # Utils genéricos
│   ├── tests/                  # Testes da engine (mirror da estrutura)
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/                  # Rust mínimo (só o wrapper Tauri)
├── public/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── BACKLOG.md
│   ├── BALANCING.md
│   └── CHANGELOG.md
├── .github/workflows/ci.yml
├── biome.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

### 4.1. Regras de dependência (importação)
```
ui/  →  store/  →  engine/  →  data/
                              ↑
persistence/ ────────────────┘
```
Setas indicam direção permitida. **`engine/` nunca importa de `ui/`, `store/`, ou Tauri APIs.**

---

## 5. Modelo de domínio (contratos TypeScript)

Estes tipos vão em `src/engine/domain/`. São o coração do projeto: estabilizá-los cedo poupa retrabalho.

### 5.1. `Player`
```ts
type Position = 'GK' | 'DF' | 'MF' | 'FW';

interface Attributes {
  attack: number;       // 1–99
  passing: number;      // 1–99
  defense: number;      // 1–99
  pace: number;         // 1–99
  physical: number;     // 1–99
  mentality: number;    // 1–99
}

interface Player {
  id: string;                    // ULID
  firstName: string;
  lastName: string;
  age: number;                   // 16–40
  position: Position;
  attributes: Attributes;
  overall: number;               // derivado, 1–99
  potential: number;             // 1–99, oculto para o jogador inicialmente
  morale: number;                // 0–100
  fitness: number;               // 0–100
  contractUntil: number;         // season number
  salary: number;                // por temporada
  marketValue: number;           // recalculado
  clubId: string | null;
  injuryWeeksLeft: number;       // 0 = saudável
  yellowCards: number;           // na temporada
  redCards: number;
  goalsThisSeason: number;
  assistsThisSeason: number;
  appearancesThisSeason: number;
  traits: PlayerTrait[];         // máximo 2 — ver Seção 6.4
}

type PlayerTrait =
  | 'clutch'           // joga melhor em finais
  | 'fragile'          // mais propenso a lesão
  | 'leader'           // +moral do time
  | 'wonderkid'        // crescimento acelerado até 23
  | 'flat-track-bully' // joga melhor contra times fracos
  | 'big-game'         // joga melhor em clássicos
  | 'inconsistent'     // variância maior em partidas
  | 'loyal';           // recusa propostas com mais frequência
```

### 5.2. `Club`
```ts
interface Club {
  id: string;
  name: string;
  shortName: string;             // 3 letras: "FLA", "PAL"
  city: string;
  primaryColor: string;          // hex
  secondaryColor: string;
  reputation: number;            // 1–100, afeta atratividade
  budget: number;                // caixa atual
  weeklySalaryBudget: number;    // teto de folha
  fanbase: number;               // 1–100
  leagueId: string;
  squad: string[];               // player ids
  trophies: Trophy[];
  managerStyle?: 'attacking' | 'balanced' | 'defensive'; // para CPU
  isPlayerControlled: boolean;
}

interface Trophy {
  competition: string;
  season: number;
}
```

### 5.3. `League`, `Match`, `Season`
```ts
interface League {
  id: string;
  name: string;
  country: string;
  tier: number;                  // 1 = Série A, 2 = Série B
  clubIds: string[];
  format: 'round-robin-double' | 'cup-knockout';
  promotionSlots: number;
  relegationSlots: number;
  prizeMoney: { position: number; amount: number }[];
}

interface Match {
  id: string;
  seasonId: string;
  competitionId: string;
  round: number;
  homeId: string;
  awayId: string;
  status: 'scheduled' | 'played';
  result?: MatchResult;
  scheduledWeek: number;
}

interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];          // gols, cartões, lesões, narrativas
  homeRating: number;            // 1–10 do time
  awayRating: number;
  attendance: number;
  manOfTheMatch: string;         // playerId
  xgHome: number;
  xgAway: number;
}

interface MatchEvent {
  minute: number;                // 1–90
  type: 'goal' | 'yellow' | 'red' | 'injury' | 'narrative' | 'sub';
  playerId: string;
  description: string;           // gerado em PT-BR
  scoreAfter: [number, number];
}

interface Season {
  number: number;                // 1, 2, 3...
  currentWeek: number;
  totalWeeks: number;
  competitions: { id: string; type: 'league' | 'cup' }[];
  finished: boolean;
}
```

### 5.4. `GameState` (raiz do save)
```ts
interface GameState {
  version: number;               // migrar saves quando mudar
  seed: number;                  // RNG state inicial
  rngState: number;              // estado atual do RNG
  createdAt: number;             // timestamp
  playerName: string;            // nome do técnico
  playerClubId: string;
  currentSeason: Season;
  history: SeasonRecord[];       // temporadas passadas (resumidas)
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  leagues: Record<string, League>;
  matches: Record<string, Match>;
  newsLog: NewsItem[];           // últimos 200
  achievements: string[];
}
```

### 5.5. Validação com Zod
Para cada interface acima, há um schema Zod equivalente em `persistence/schemas.ts`. Toda leitura de save passa pelo `safeParse` e migrations correm se `version` for menor que a atual.

---

## 6. Regras de gameplay (a "ciência" do jogo)

### 6.1. Cálculo de overall
```ts
function overall(attrs: Attributes, position: Position): number {
  const w = WEIGHTS[position]; // tabela por posição
  return Math.round(
    attrs.attack * w.attack +
    attrs.passing * w.passing +
    attrs.defense * w.defense +
    attrs.pace * w.pace +
    attrs.physical * w.physical +
    attrs.mentality * w.mentality
  );
}
```
Pesos sugeridos (somam 1):

| Posição | Atk | Pas | Def | Pac | Phy | Men |
|---|---|---|---|---|---|---|
| GK | 0.05 | 0.10 | 0.50 | 0.05 | 0.15 | 0.15 |
| DF | 0.05 | 0.15 | 0.40 | 0.10 | 0.15 | 0.15 |
| MF | 0.15 | 0.30 | 0.15 | 0.10 | 0.15 | 0.15 |
| FW | 0.40 | 0.15 | 0.05 | 0.20 | 0.10 | 0.10 |

### 6.2. Força do time (Team Rating)
```
teamRating = média(11 titulares overall)
            + bônus tático (0–3)
            + bônus moral média (-2 a +2)
            + bônus de mando (+2 em casa)
            - penalidade fadiga média (0 a -3)
```

### 6.3. Simulação de partida — modelo
A partida não é simulada minuto a minuto com física. Modelo escolhido (rápido e divertido):

1. Calcular `xG` esperado de cada lado a partir de `teamRating` e estilo tático.
   ```
   xGHome = base * (homeRating / (homeRating + awayRating)) * tacticMultiplier
   xGAway = base * (awayRating / (homeRating + awayRating)) * tacticMultiplier
   base = ~2.7 (média de gols por jogo no Brasileirão)
   ```
2. Para cada gol potencial (até 8 tentativas por lado), rodar Bernoulli com `p = xG / tentativas`.
3. Para cada gol confirmado, sortear minuto (distribuição weighted: minutos finais têm leve viés positivo) e marcador (ponderado pelo `attack` dos atacantes/meias do time).
4. Sortear 2-5 eventos narrativos: amarelos, lesões, "quase gol", VAR, etc.
5. Sortear "Man of the Match" pesado pelos gols/assistências/overall.
6. Simulação total: < 5 ms por partida. Uma rodada inteira em < 100 ms.

### 6.4. Eventos narrativos (sabor)
Em cada partida, há 30% de chance de ocorrer um evento "drama":
- **Virada**: time perdendo por 2+ marca 2 gols nos últimos 15 min.
- **Zebra**: time muito inferior vence (boost de moral).
- **Hat-trick**: jogador marca 3 gols (overall +1 temporário).
- **Lesão grave**: jogador sai por 4-12 semanas.
- **Expulsão polêmica**: cartão vermelho gera notícia.
- **Estrela do mês**: jogador acumula bônus.

### 6.5. Progressão de jogadores (entre temporadas)
- **Idade < 23**: chance de ganhar 1-3 pontos em atributos rumo ao `potential`. Trait `wonderkid` dobra ganhos.
- **Idade 23-29**: estável. Pequenas oscilações ±1.
- **Idade 30-33**: começa a perder `pace` e `physical`.
- **Idade 34+**: declínio acelerado. Aposentadoria provável aos 36-40.
- Bônus por **minutos jogados**: jogadores com >2000 min na temporada têm +30% de chance de progredir.

### 6.6. Mercado de transferências
- Janelas: **pré-temporada** (semanas -3 a -1) e **meio de ano** (semana 19-20).
- Cada clube CPU tem orçamento e necessidades calculadas (qual posição é mais fraca).
- **Avaliação** = `f(overall, potential, idade, contrato, traits)`.
  ```
  marketValue ≈ overall^2.2 * ageMultiplier * potentialMultiplier
  ageMultiplier: 0.5 (>34) … 1.5 (21-26)
  potentialMultiplier: 1.0 + (potential - overall) * 0.05
  ```
- **Negociação simplificada**: o jogador faz oferta → CPU aceita / contrapropõe / recusa. Máximo 2 contrapropostas. Sem leilões.
- **Salários**: jogador exige aumento proporcional ao novo overall. Recusas viram notícia.

### 6.7. Moral
Eventos que afetam moral:
- Vitória: +5 (todos), +10 (titulares).
- Derrota: -5, -10.
- Sequência de 3 vitórias: +10 todos.
- Sequência de 3 derrotas: -10 todos.
- Jogador no banco 5 jogos seguidos: -15 (o próprio).
- Compra de craque na sua posição: -10 (titular antigo).

Moral abaixo de 30: jogador joga -5% efetividade. Acima de 80: +5%.

### 6.8. Táticas (mantenha simples)
4 esquemas, escolhidos via dropdown:
- **4-3-3 ofensivo**: +xG, -defesa.
- **4-4-2 equilibrado**: neutro.
- **4-5-1 defensivo**: -xG, +defesa.
- **3-5-2 controle**: +posse (mais eventos), neutro.

3 mentalidades: **Atacar**, **Equilibrado**, **Defender**. Cada uma é um multiplicador no `xG`.

**É só isso.** Não há instruções por jogador. Não há "papéis". Não há transição.

---

## 7. UX / UI — diretrizes para o designer (você) e para o Codex

### 7.1. Princípios de UX
1. **Uma decisão por tela**. Se uma tela tem duas decisões, divida.
2. **Paridade total mouse + teclado**. Toda ação precisa estar disponível pelos dois caminhos. Ver Seção 7.6 para a especificação completa.
3. **Avanço de jogo é o botão maior da tela**. Sempre presente, fixado no canto inferior direito. Atalho universal: `Espaço`.
4. **Animações curtas (≤ 250 ms)**. Tudo que demorar mais é arrastado.
5. **Sem modals empilhados**. Máximo 1 modal por vez.
6. **Tabelas são primeiro-cidadãs**. Ordenáveis por clique e por teclado. Densidade configurável.
7. **Empty states com voz**. "Nenhum jogador lesionado. ✨" — humor seco.

### 7.2. Sistema de design (tokens)
Use CSS variables expostas em `:root` para o tema:
```css
:root {
  --bg-base: #0B0D10;
  --bg-elev-1: #14171C;
  --bg-elev-2: #1B2027;
  --border: #2A3038;
  --text-primary: #ECEFF4;
  --text-muted: #8A93A0;
  --accent: #4ADE80;        /* verde "vitória" */
  --warn: #FACC15;          /* amarelo "atenção" */
  --danger: #F87171;
  --radius-sm: 6px;
  --radius-md: 10px;
  --font-display: "Inter", "Manrope", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Tipografia (escala modular 1.250):
- `text-xs` 12, `text-sm` 14, `text-base` 16, `text-lg` 20, `text-xl` 25, `text-2xl` 31, `text-3xl` 39.

### 7.3. Telas do MVP (todas as 8)

1. **Início / Splash** — escolha de clube e técnico. 1 tela.
2. **Home (Dashboard)** — hub: próxima partida, posição na liga, 3 últimas notícias, botão "Avançar".
3. **Elenco** — tabela de jogadores. Filtros: posição, overall, idade. Click → detalhe.
4. **Detalhe do jogador** — atributos, estatísticas, contrato, botão "Ofertar contrato"/"Vender".
5. **Tática** — escalação (drag-and-drop ou tap), esquema, mentalidade. Salva como preset.
6. **Dia de jogo** — narrativa em tempo acelerado, botões "Pular para o fim" / "1×" / "2×" / "10×".
7. **Tabela de classificação** — Série A/B, copa nacional. Mostra próximos jogos.
8. **Mercado** — busca de jogadores disponíveis, ofertas pendentes, propostas recebidas.

### 7.4. Microinterações específicas
- **Gol**: flash sutil verde + número do placar incrementa em 200ms com easing.
- **Cartão vermelho**: shake 6px no card do jogador.
- **Vitória de campeonato**: confete sutil 1×, e nada mais.
- **Hover em jogador**: sparkline dos últimos 10 jogos.

### 7.5. Acessibilidade
- Contraste AA mínimo em todos os pares de cor.
- Foco visível em todos os elementos interativos (anel `2px var(--accent)`, sempre visível em navegação por teclado).
- `prefers-reduced-motion` desliga animações de microinteração.
- Tamanhos de toque mínimos de 36×36 px (preparando para mobile futuro).
- Todo elemento interativo tem `aria-label` ou texto visível.

---

### 7.6. Sistema de input — paridade mouse + teclado

**Princípio:** nenhuma ação do jogo pode existir só no mouse ou só no teclado. Quem usa só mouse joga 100% do jogo. Quem usa só teclado joga 100% do jogo. Quem mistura os dois nunca trava.

#### 7.6.1. Equivalências obrigatórias

| Ação | Mouse | Teclado |
|---|---|---|
| Selecionar item de tabela | Clique na linha | `↑` / `↓` move foco, `Enter` confirma |
| Reordenar tabela | Clique no header | `Tab` para o header + `Enter` para alternar asc/desc |
| Abrir detalhe do jogador | Clique duplo na linha **ou** clique no nome | `Enter` na linha selecionada |
| Voltar de uma tela | Botão "← Voltar" no topo | `Esc` |
| Avançar partida / rodada | Botão grande no canto inferior direito | `Espaço` |
| Confirmar diálogo | Botão "Confirmar" | `Enter` |
| Cancelar diálogo | Botão "Cancelar" ou X | `Esc` |
| Trocar aba dentro de uma tela | Clique na aba | `1` … `9` (1 = primeira aba) ou `Tab`/`Shift+Tab` |
| Drag-and-drop (escalação) | Arrastar card | `Enter` no jogador no banco → `↑↓` move foco no XI → `Enter` para soltar |
| Mudar esquema tático | Dropdown / cards clicáveis | `Tab` até o controle, `Espaço` abre, `↑↓` navega, `Enter` escolhe |
| Filtros de tabela | Inputs e selects | `/` foca o campo de busca; `f` abre painel de filtros |
| Fechar tooltip / popover | Clique fora | `Esc` |
| Scroll | Roda do mouse / arraste | `PageUp` / `PageDown`, `Home`, `End` |

#### 7.6.2. Atalhos globais (funcionam em qualquer tela)

| Tecla | Ação |
|---|---|
| `Espaço` | Avançar (próxima rodada / pular evento de partida / continuar) |
| `Esc` | Voltar / fechar modal |
| `1` | Home (Dashboard) |
| `2` | Elenco |
| `3` | Tática |
| `4` | Tabela de classificação |
| `5` | Mercado |
| `6` | Notícias |
| `?` | Abrir cheat-sheet de atalhos (modal) |
| `Ctrl/⌘ + S` | Salvar manualmente |
| `Ctrl/⌘ + L` | Abrir menu de saves |
| `Ctrl/⌘ + ,` | Configurações |
| `Ctrl/⌘ + Z` | Desfazer última escalação não-confirmada (apenas em Tática) |

> Atalhos numéricos (`1`–`6`) **não funcionam** quando há um input de texto focado.

#### 7.6.3. Atalhos contextuais (por tela)

**Match Day:**
| Tecla | Ação |
|---|---|
| `Espaço` | Pular para o próximo evento |
| `1` / `2` / `3` / `4` | Velocidade 1× / 2× / 5× / 10× |
| `P` | Pausar / retomar |
| `→` | Pular direto para o fim da partida |

**Elenco:**
| Tecla | Ação |
|---|---|
| `/` | Foco no campo de busca |
| `f` | Abrir painel de filtros |
| `1`–`4` | Filtrar por posição (GK/DF/MF/FW) — quando busca não estiver focada |
| `Enter` | Abrir detalhe do jogador selecionado |
| `c` | "Comparar" (se 2 jogadores marcados) |

**Tática:**
| Tecla | Ação |
|---|---|
| `r` | Resetar para a última escalação salva |
| `a` | Auto-escalação (melhor XI por overall) |
| `s` | Salvar como preset |

**Mercado:**
| Tecla | Ação |
|---|---|
| `o` | Abrir formulário de oferta no jogador selecionado |
| `Enter` | Aceitar proposta recebida (com confirmação) |

#### 7.6.4. Foco e navegação por `Tab`

- **Ordem de foco**: sempre top-down, left-to-right. Sidebar → topbar → conteúdo principal → ações fixas (canto inferior direito).
- **Foco visível**: anel `2px solid var(--accent)` + leve `box-shadow`. Nunca `outline: none` sem substituto.
- **Skip link**: primeiro `Tab` da página oferece "Pular para conteúdo" (oculto até receber foco).
- **Focus trap em modais**: `Tab` cicla apenas dentro do modal; `Esc` fecha.
- **Restauração de foco**: ao fechar um modal, o foco volta ao elemento que o abriu.
- **Roving tabindex** em listas longas (elenco, mercado): `Tab` sai da lista; `↑↓` move dentro dela.

#### 7.6.5. Mouse — paridade no sentido oposto

Tudo que existe no teclado também precisa estar acessível por mouse:
- **Botões visíveis** para "Avançar", "Voltar", "Confirmar", "Cancelar". Nunca confiar só no atalho.
- **Botão de ajuda `?`** sempre visível na topbar — abre o mesmo cheat-sheet do `?`.
- **Menu kebab (`⋮`)** em linhas de tabela expõe ações secundárias (oferecer contrato, listar para venda, etc.).
- **Direito-clique** em jogador e clube abre menu contextual com as mesmas ações do menu kebab. Atalho de teclado equivalente: `Shift+F10` ou tecla de menu.

#### 7.6.6. Implementação — diretrizes para o Codex

- **Hook único `useHotkey(key, handler, options)`** centraliza todos os atalhos. Usar `react-hotkeys-hook` (já compatível com a stack) ou implementação própria de ~40 linhas.
- **Atalhos respeitam contexto**: usar `enableOnFormTags: false` por padrão para que digitação não dispare navegação.
- **Componentes de UI shadcn já vêm com a11y** — não removê-la. Se um componente custom for criado, ele deve seguir o padrão WAI-ARIA correspondente (combobox, tabs, dialog, menu).
- **Cheat-sheet (`?`)** é gerada a partir de um registro central de atalhos (`src/ui/hotkeys/registry.ts`) — adicionar atalho = adicionar entrada no registro. Sem documentação manual.
- **Testes Playwright** cobrem 1 happy path por teclado puro: criar carreira, navegar para elenco, abrir um jogador, fazer oferta, voltar, avançar rodada — tudo sem mouse.

#### 7.6.7. Antipadrões proibidos

- ❌ Botão visível só no hover (escondido até passar o mouse).
- ❌ Drag-and-drop sem alternativa de teclado.
- ❌ Atalho que sobrescreve atalho nativo do SO (`Ctrl/⌘+W`, `Ctrl/⌘+Q`, `F11`, etc.).
- ❌ Foco invisível em qualquer elemento interativo.
- ❌ Tooltip que só aparece no hover do mouse — também precisa aparecer no `focus`.
- ❌ Lista virtualizada que quebra navegação por `↑↓` ao chegar no fim do viewport.

---

## 8. Persistência e save game

### 8.1. Estratégia
- **MVP**: 1 arquivo JSON por slot, gravado via Tauri FS API em `appData/saves/slot-N.json`.
- Compactação opcional com `pako` (gzip) quando passar de 2 MB.
- 3 slots de save + 1 autosave (sobrescrito a cada fim de semana de jogo).

### 8.2. Versionamento e migrations
```ts
const CURRENT_SAVE_VERSION = 3;
const migrations = {
  1: (s: any) => { s.version = 2; s.history = []; return s; },
  2: (s: any) => { s.version = 3; /* etc */ return s; },
};
function loadSave(raw: unknown): GameState {
  let s = SaveSchemaV1OrAbove.parse(raw);
  while (s.version < CURRENT_SAVE_VERSION) s = migrations[s.version](s);
  return s as GameState;
}
```

### 8.3. Performance
Salvar **apenas no fim de cada semana de jogo** (debounce). Salvar não pode bloquear a UI por > 50 ms — usar Web Worker se necessário a partir da v0.4.

---

## 9. Testes

### 9.1. Pirâmide
- **Unit (Vitest)** — toda função pura da engine. Cobertura mínima 80%.
- **Integration** — fluxo "criar save → jogar 5 rodadas → carregar save".
- **E2E (Playwright)** — 3 happy paths: criar carreira, jogar uma partida, contratar um jogador.

### 9.2. Testes obrigatórios da engine
- Determinismo: mesma seed produz mesma temporada (snapshot de placares).
- Distribuição de gols: simular 10.000 partidas equilibradas → média entre 2.4 e 3.0 gols/jogo.
- Promoção/rebaixamento: cenários edge (empate triplo, etc.).
- Progressão: simular 5 temporadas, garantir que distribuição de overall não infla.
- Aposentadorias: idade média de aposentadoria entre 33 e 38.

### 9.3. Balanceamento via simulações em massa
Criar `scripts/balance-sim.ts` que:
1. Inicia 100 carreiras com seeds diferentes.
2. Simula 10 temporadas em cada uma com IA jogando.
3. Reporta: campeões da Série A, gols/jogo, transferências/janela, aposentadorias/temporada.
4. Saída em CSV → `docs/BALANCING.md` é atualizado a cada release.

---

## 10. Geração procedural de conteúdo

### 10.1. Nomes de jogadores
- Pool de 1500 primeiros nomes brasileiros + 2500 sobrenomes (em `data/name-pools/`).
- Cadeia de Markov de ordem 2 sobre o pool para gerar variantes plausíveis (~20% do total).
- Diversidade regional: Norte/Nordeste tem distribuição diferente de Sul/Sudeste.

### 10.2. Notícias procedurais
Templates em `data/narrative/news.json`:
```json
{
  "id": "transfer-rumor",
  "weight": 10,
  "conditions": { "playerOverallMin": 75 },
  "template": "{{playerName}} é alvo de sondagem do {{rivalClub}}, segundo a imprensa."
}
```
- ~80 templates no MVP, agrupados por contexto (transferência, lesão, performance, vestiário).
- Worker no jogo escolhe 1-3 templates por semana de jogo, baseado em fatos ocorridos.

### 10.3. Eventos de partida (narrativa)
Templates curtos com slots:
- `{{minuto}}' GOOOL! {{jogador}} marca de {{tipo}} para o {{time}}!`
- `{{minuto}}' Cartão amarelo para {{jogador}}.`
- `{{minuto}}' Quase! {{jogador}} chuta na trave.`

### 10.4. Geração de elenco inicial
- Cada clube recebe 22-25 jogadores.
- Distribuição por posição: 3 GK, 8 DF, 8 MF, 6 FW.
- Overall do elenco proporcional à `reputation` do clube (média entre 60-82 para Série A).
- 1-3 "cracks" (overall 80+) por clube top.
- 2-4 jogadores < 21 anos com `potential` alto por elenco.

---

## 11. IA do projeto — agentes do Codex

Em vez de trabalhar como um único contexto gigantesco, o Codex deve operar em **modos** especializados. Use prompts iniciais por modo:

### 11.1. Modo "Engine Architect"
> Você está trabalhando na pasta `src/engine/`. **Não importe** de UI, store ou Tauri. Toda função deve ser pura, determinística e testada. Use TypeScript strict. Antes de escrever código, escreva o teste.

### 11.2. Modo "UI Builder"
> Você está trabalhando em `src/ui/`. Use shadcn/ui, Tailwind, e tokens de design da Seção 7.2. Sem novas dependências sem aprovação. Não chame engine direto: leia do `store/`. **Toda interação tem que funcionar pelo mouse E pelo teclado** — siga a Seção 7.6 sem exceção. Se uma feature não tiver caminho por teclado, ela não está pronta.

### 11.3. Modo "Data Designer"
> Você está populando `src/data/`. Não invente clubes inexistentes — use os 20 da Série A 2024 com nomes ficcionalizados se direitos forem ambíguos. Mantenha valores plausíveis e balanceados.

### 11.4. Modo "Narrative Writer"
> Você escreve templates curtos em PT-BR para `data/narrative/`. Tom seco, ocasionalmente irônico. Frases curtas. Sem clichês. Inspire-se em narradores como Galvão Bueno (em paródia) e Tim Vickery (analítico).

### 11.5. Modo "QA & Balancing"
> Você roda `scripts/balance-sim.ts`, lê CSVs e propõe ajustes em `BALANCING.md`. Não altera lógica sem testes que provem o problema atual.

### 11.6. Regra para o Codex sobre incerteza
Se o Codex não souber qual decisão tomar entre duas opções:
1. Implementar **a mais simples** das duas.
2. Anotar a outra opção em `docs/BACKLOG.md` com rótulo `[decision-pending]`.
3. Continuar.

---

## 12. Conteúdo inicial (MVP — números concretos)

### 12.1. Ligas
- **Série A**: 20 clubes, 38 rodadas (turno e returno).
- **Série B**: 20 clubes, 38 rodadas.
- **Copa do Brasil**: 64 clubes, mata-mata simples.
- **Total de partidas/temporada**: ~800.

### 12.2. Calendário (40 semanas de jogo)
- Semana 1-3: pré-temporada, janela de transferência aberta.
- Semana 4-22: ida do campeonato + copa entrelaçada.
- Semana 19-20: janela curta de meio de ano.
- Semana 23-40: returno + finais de copa.
- Semana 41 (intersemana): premiações, progressão, aposentadorias.

### 12.3. Conquistas (achievements)
20 conquistas para o MVP. Exemplos:
- 🏆 **Bicampeão**: ganhe a Série A 2× consecutivas.
- 📈 **Promovido**: suba da Série B.
- 💸 **Olho de Águia**: contrate um jogador < 22 anos que vire >85 overall.
- 🐐 **Lenda**: termine carreira de um jogador no seu clube com >300 jogos.
- 🎯 **Artilheiro**: alguém do seu time faz 30+ gols na liga.

---

## 13. Telemetria e logging (local)

- Sem analytics externo. **Privacidade total.**
- Log local rotativo em `appData/logs/` (últimos 7 dias).
- Botão "Exportar diagnóstico" para zipear logs + save anonimizado em caso de bug.

---

## 14. Roadmap por sprints (esta é a ordem de execução)

> Cada sprint tem **critério de pronto explícito**. Codex não passa para o próximo até o critério atual ser atendido.

### Sprint 0 — Setup (1 dia)
**Tarefas:**
1. `pnpm create vite` com template `react-ts`.
2. Adicionar Tauri 2 (`pnpm add -D @tauri-apps/cli`).
3. Configurar Biome, Vitest, Playwright.
4. Configurar Tailwind + shadcn/ui CLI.
5. Estrutura de pastas da Seção 4.
6. CI básico no GitHub Actions.

**Critério de pronto:** `pnpm dev` abre janela Tauri vazia. `pnpm test` passa com um teste smoke.

---

### Sprint 1 — Domínio e RNG (2 dias)
**Tarefas:**
1. Implementar todos os tipos da Seção 5.
2. Schemas Zod equivalentes.
3. Mulberry32 com helpers (`between`, `weighted`, `chance`).
4. Função `generateClub`, `generatePlayer`, `generateLeague`.
5. Testes unitários cobrindo determinismo.

**Critério de pronto:** dado uma seed, `generateLeague(seed)` retorna sempre o mesmo conjunto de 20 clubes com 22 jogadores cada.

---

### Sprint 2 — Engine de simulação (3 dias)
**Tarefas:**
1. `simulateMatch(home, away, tactics, rng)` retornando `MatchResult`.
2. `simulateRound(league)` chamando `simulateMatch` para todos os jogos.
3. Tabela de classificação calculada a partir do histórico de partidas.
4. Eventos de partida em PT-BR.
5. Suíte de balanceamento: 10.000 partidas e validação dos números (Seção 9.2).

**Critério de pronto:** simular 1 temporada inteira em < 1s; média de gols entre 2.4 e 3.0; testes passando.

---

### Sprint 3 — Persistência (1 dia)
**Tarefas:**
1. Wrapper Tauri FS para read/write JSON.
2. Save / Load / Delete slot.
3. Autosave debounced no fim de cada semana.
4. Migrations stub (versão 1).

**Critério de pronto:** criar carreira, jogar 5 rodadas, fechar app, abrir, continuar do mesmo ponto.

---

### Sprint 4 — UI: Home, Elenco, Tática (4 dias)
**Tarefas:**
1. Tokens de design + tema dark.
2. Layout principal com sidebar minimalista.
3. Tela Home com cards de status.
4. Tela Elenco com tabela ordenável (clique no header **e** `Tab+Enter` no header).
5. Tela Tática com escolha de esquema e XI titular — drag-and-drop **e** alternativa por teclado (Seção 7.6.1).
6. Registro central de atalhos (`src/ui/hotkeys/registry.ts`) + hook `useHotkey`.
7. Cheat-sheet de atalhos (`?`) gerada a partir do registro.
8. Atalhos globais `1`–`6`, `Esc`, `Espaço`, `?`, `Ctrl/⌘+S`.

**Critério de pronto:** navegação fluida entre as 3 telas pelo mouse **e** completamente pelo teclado, sem encostar no mouse. Mudanças de tática persistem. Foco sempre visível.

---

### Sprint 5 — UI: Match Day e Tabela (3 dias)
**Tarefas:**
1. Tela de partida com narrativa em velocidade configurável — botões **e** atalhos `1`/`2`/`3`/`4` (Seção 7.6.3).
2. Animação leve no placar.
3. Tela de classificação com filtros (clique e teclado).
4. Botão "Avançar Rodada" funcional integrado à engine, com atalho `Espaço`.

**Critério de pronto:** jogar uma rodada inteira pela UI, ver placar, ver tabela atualizada. Toda a tela de partida operável só com teclado.

---

### Sprint 6 — Mercado de transferências (3 dias)
**Tarefas:**
1. IA dos clubes CPU para identificar necessidades.
2. Cálculo de valuation.
3. Ofertas, contrapropostas, aceitação/recusa.
4. Tela de mercado com lista filtrável.
5. Janela de transferências respeitando calendário.

**Critério de pronto:** comprar e vender jogadores. CPU faz 5-15 transferências por janela.

---

### Sprint 7 — Notícias e eventos narrativos (2 dias)
**Tarefas:**
1. Engine de notícias com templates condicionais.
2. Feed de notícias na Home.
3. Eventos especiais (zebra, virada) marcados visualmente.
4. ~80 templates no MVP.

**Critério de pronto:** uma temporada gera 50-100 notícias coerentes com fatos.

---

### Sprint 8 — Progressão entre temporadas (2 dias)
**Tarefas:**
1. Tela de "Fim de temporada" com resumo.
2. Aposentadorias.
3. Promoção/rebaixamento.
4. Geração de novos jovens (regen).
5. Conquistas desbloqueadas.

**Critério de pronto:** jogar 3 temporadas inteiras sem inflação de overall, com aposentados saindo e regens entrando.

---

### Sprint 9 — Polimento e ajuste (3 dias)
**Tarefas:**
1. Animações finais.
2. Sons opcionais (toggle off por padrão).
3. Tutorial em 4 tooltips contextuais.
4. Onboarding (escolha de clube + técnico) refinado.
5. Performance: garantir 60fps em qualquer tela.
6. Testes E2E Playwright: 1 happy path **só com mouse** + 1 happy path **só com teclado** (Seção 7.6.6).
7. Auditoria axe-core (a11y) sem violações `serious` ou `critical`.
8. Build assinado para macOS / Windows / Linux.

**Critério de pronto:** alpha pública (TestFlight / itch.io). 5 testers concluindo 1 temporada sem reportar bug crítico. Ambos os E2E (mouse e teclado) verdes em CI.

---

### Fase 2 (pós-MVP, ordem livre)
- Histórico mundial, recordes.
- Rivalidades dinâmicas (cresce com cada confronto).
- Cloud save (opcional, Tauri + iCloud/Drive).
- Modos: "Carreira clássica", "Sobreviver", "Iniciar pequeno".
- Workshop de mods (CSV/JSON drop-in).

### Fase 3
- Multiplayer assíncrono (mesmo save, jogadores diferentes).
- Editor de ligas próprias.
- Versão mobile (Tauri Mobile ou React Native, decidir depois).

---

## 15. Definition of Done (geral)

Antes de cada PR ser fechado, verificar:
- [ ] Testes passando em CI.
- [ ] Lint/format limpo (Biome).
- [ ] TypeScript compila sem warnings.
- [ ] Screenshot anexado se mudou UI.
- [ ] **Toda nova interação operável por mouse e por teclado** (Seção 7.6).
- [ ] **Foco visível** em qualquer elemento interativo introduzido.
- [ ] **Atalhos novos** registrados em `src/ui/hotkeys/registry.ts`.
- [ ] `BACKLOG.md` atualizado se algo foi adiado.
- [ ] `CHANGELOG.md` atualizado.
- [ ] Não introduziu nova dependência sem registro em `docs/ARCHITECTURE.md`.
- [ ] Resposta escrita à pergunta-chave: *"isso deixa o jogo mais divertido ou apenas mais complicado?"*

---

## 16. Riscos e mitigações

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Inflar escopo (creep) | Alta | Alto | Regra de ouro + Fase 2 disciplinada |
| Simulação desbalanceada | Média | Alto | Balance-sim em CI, releases gateadas por números |
| Tauri quebrar entre versões | Baixa | Médio | Pinar versão, atualizar com release-notes review |
| Save corrompido | Baixa | Alto | Versionamento + backup duplo automático |
| Direitos de imagem de clubes | Média | Baixo | Nomes/cores ficcionalizados, modo "rename" via JSON |
| Performance em saves grandes | Média | Médio | Migration JSON→SQLite preparada para v0.5 |

---

## 17. Glossário rápido

- **GameState** — raiz do save, contém tudo.
- **Engine** — código puro de simulação, sem React/Tauri.
- **Regen** — jogador jovem gerado proceduralmente para repor aposentados.
- **xG** — gols esperados. Métrica de chances.
- **Overall** — número 1-99 que resume a qualidade do jogador.
- **Trait** — característica fixa de um jogador (max 2).
- **Tier** — nível da liga (1 = Série A).

---

## 18. Primeiro prompt para o Codex (cole isto no início)

> Você é um engenheiro de games sênior trabalhando no projeto **Manager Minimalista** descrito no documento `manager-futebol-minimalista-PLANO-EXECUTAVEL.md`. Leia o documento inteiro antes da primeira ação.
>
> Sua missão hoje é executar o **Sprint 0 (Setup)** da Seção 14 até atingir o critério de pronto. Nada além disso.
>
> Regras invioláveis:
> 1. Siga a stack da Seção 3 sem substituições.
> 2. Estrutura de pastas da Seção 4 obrigatória.
> 3. TypeScript strict. Biome para lint/format.
> 4. Antes de escrever um teste ou função na engine, releia a regra de ouro do projeto.
> 5. Toda dúvida ambígua: implemente a opção mais simples e registre a outra em `docs/BACKLOG.md`.
> 6. Pergunte ao usuário **apenas** se a dúvida bloquear a próxima linha de código.
>
> Comece.

---

**Fim do documento. Versão 2.0 — pronta para execução.**
