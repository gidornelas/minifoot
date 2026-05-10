# Architecture

Arquitetura inicial definida no plano executavel. A regra principal e manter `src/engine` puro, sem imports de UI, store, persistencia Tauri ou APIs de plataforma.

Direcao permitida:

```txt
ui -> store -> engine -> data
persistence -> engine
```

## Persistencia

A persistencia do MVP usa JSON validado por Zod e mantem a engine independente de APIs de plataforma.

- `src/persistence/save.ts`: serializacao, load/save/delete de slots, autosave debounced e adapter em memoria para testes.
- `src/persistence/migrations.ts`: versao atual do save (`1`) e ponto unico para migrations futuras.
- `src/persistence/tauri-adapter.ts`: adapter Tauri FS usando `BaseDirectory.AppData`.

Arquivos de save:

```txt
AppData/saves/slot-1.json
AppData/saves/slot-2.json
AppData/saves/slot-3.json
AppData/saves/autosave.json
```

## UI e atalhos

O Sprint 4 introduz uma camada de UI em React isolada em `src/ui` e estado de aplicacao em `src/store`.

- `src/ui/layouts/MainLayout.tsx`: shell principal com sidebar, topbar, skip link e atalhos globais.
- `src/ui/hotkeys/registry.ts`: fonte unica para a cheat-sheet de atalhos.
- `src/ui/hotkeys/useHotkey.ts`: hook unico para captura de teclado com protecao para campos de formulario.
- `src/store/game.store.ts`: carreira inicial deterministica e preferencias de UI/tatica persistidas via `zustand/persist`.

Telas do Sprint 4:

```txt
src/ui/features/home/HomeView.tsx
src/ui/features/squad/SquadView.tsx
src/ui/features/tactics/TacticsView.tsx
```

Telas do Sprint 5:

```txt
src/ui/features/match-day/MatchDayView.tsx
src/ui/features/league-table/LeagueTableView.tsx
```

`advanceRound()` vive em `src/store/game.store.ts`: cria um RNG a partir do estado salvo,
simula a rodada atual pela engine pura, atualiza `matches`, incrementa `currentWeek`, registra
noticia da partida do jogador e abre `match-day`. Na tela de partida, `Espaco` revela eventos;
fora dela, `Espaco` avanca a proxima rodada.

## Mercado

O Sprint 6 separa regras de transferencia da UI:

```txt
src/engine/transfers/valuation.ts
src/engine/transfers/market.ts
src/ui/features/transfers/TransferMarketView.tsx
```

- `calculateTransferValue()` calcula valor por overall, potencial, idade, contrato e traits.
- `isTransferWindowOpen()` libera semanas 1-3 e 19-20.
- `evaluateTransferOffer()` retorna aceita, contraproposta ou recusa.
- `generateCpuTransferDeals()` cria movimentos deterministas de clubes CPU a partir de necessidades por posicao.
- `src/store/game.store.ts` aplica transferencias em `clubs`, `players`, orcamento e `newsLog`.

## Noticias

O Sprint 7 introduz uma engine narrativa pura para manter o feed coerente sem acoplar UI a regras de simulacao:

```txt
src/engine/news/templates.ts
src/engine/news/news.ts
src/ui/features/news-feed/NewsFeedView.tsx
```

- `NEWS_TEMPLATES` concentra 88 templates condicionais para jogos, zebras, viradas, mercado, performance, lesao e sistema.
- `generateRoundNews()` prioriza partida do jogador, jogo com mais gols e eventos especiais; a rodada alterna teto de 2/3 manchetes para fechar uma temporada com 50-100 itens.
- `generateTransferNews()` registra ofertas, contrapropostas, recusas e contratacoes aceitas no mesmo `newsLog`.
- `NewsItem.tags` e `NewsItem.importance` permitem destacar visualmente zebras, viradas e negocios aceitos na Home e na tela `Noticias`.

## Progressao de temporada

O Sprint 8 concentra o rollover em engine pura e deixa o store apenas orquestrar a transicao de tela:

```txt
src/engine/progression/season.ts
src/ui/features/season-end/SeasonEndView.tsx
```

- `completeSeason()` calcula tabela final, campeao, posicao do clube do usuario, premios, trofeu, promovidos/rebaixados, aposentadorias, regens e conquistas.
- Como o MVP tem uma unica liga jogavel, o rebaixamento troca clubes CPU da zona por promovidos e preserva o clube do usuario para manter a carreira jogavel.
- `startNextSeason()` recria o calendario com `seasonId` novo, reseta a semana para 1 e publica uma noticia especial de abertura.
- `SeasonRecord` guarda ids de promovidos, rebaixados, aposentados, regens e conquistas para alimentar a tela `Fim de temporada`.

## Polimento MVP

O Sprint 9 fecha o loop jogavel com onboarding, tutorial e preferencias leves persistidas no store:

```txt
src/ui/features/onboarding/OnboardingView.tsx
src/ui/components/TutorialCoachMarks.tsx
src/ui/layouts/MainLayout.tsx
```

- `onboardingComplete`, `soundEnabled` e `tutorialDismissedIds` ficam em `zustand/persist`.
- O onboarding recria a carreira deterministica com tecnico e clube escolhidos antes de liberar o shell.
- O tutorial tem 4 dicas contextuais e pode ser dispensado individualmente ou pulado de uma vez.
- O som e opcional, desligado por padrao, e usa Web Audio apenas quando o usuario ativa o toggle.
- O polimento visual usa animacao CSS curta respeitando `prefers-reduced-motion`.

## Historico e recordes

A primeira entrega da Fase 2 adiciona memoria de carreira sem persistir todos os jogos antigos:

```txt
src/ui/features/records/RecordsView.tsx
src/engine/progression/season.ts
```

- `SeasonRecord` guarda resumo estatistico da temporada: pontos do campeao, pontos do clube do usuario, artilheiro, ataque/defesa, maior goleada e jogo com mais gols.
- `WorldRecordBook` fica em `GameState.records` e e atualizado por `completeSeason()` com maiores marcas historicas e contagem de titulos.
- `RecordsView` expõe a sala de recordes na navegacao global (`7`) e lista temporadas arquivadas sem recalcular partidas antigas.
