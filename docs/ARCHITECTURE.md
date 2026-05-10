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
