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
