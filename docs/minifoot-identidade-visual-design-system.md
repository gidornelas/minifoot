# Minifoot — Identidade Visual & Design System

> Documento canônico de marca e UI do Minifoot. Versão 1.0.
> Complementa o `manager-futebol-minimalista-PLANO-EXECUTAVEL.md`.
> Toda decisão visual deste jogo passa por aqui antes de virar código.

---

## 0. Como usar este documento

- **Designers**: este é o ponto de partida para qualquer arte, mockup ou prototipagem.
- **Desenvolvedores (Codex)**: os tokens da Seção 6 são a fonte da verdade. Nada de cores/fontes hardcoded fora dos tokens.
- **Brand**: a Seção 1 (princípios) e Seção 9 (voz) governam tudo que sai com o nome Minifoot fora do produto.

Regra única: **se a decisão entrar em conflito com o pilar "menos é mais", o pilar vence.**

---

## 1. Conceito da marca

### 1.1. O nome

**Minifoot** é a fusão honesta do que o jogo é:

- `mini` — minimalista, enxuto, rápido, pequeno em peso, pequeno em fricção.
- `foot` — pertencimento ao gênero. O jogador da Brasfoot/Elifoot reconhece em 0,3 segundos.

O nome **é** o pitch. Ninguém precisa explicar o que é "um Minifoot".

### 1.2. Posicionamento

> *Minifoot é o manager de futebol que respeita seu tempo.*

- Não é uma simulação realista (Football Manager).
- Não é nostalgia preguiçosa (clones de Brasfoot).
- É uma **releitura contemporânea**: a alma dos managers dos anos 90 com a UX e a estética dos apps que você ama em 2025 (Linear, Raycast, Things 3, Arc).

### 1.3. Princípios de marca (governam tudo)

1. **Silêncio é design.** Espaço em branco, ausência de ícones decorativos, ausência de ruído visual.
2. **Tipografia é interface.** A fonte faz 70% do trabalho de UI. Ícones e cores fazem o resto.
3. **Cor é decisão.** Cor só aparece quando significa algo (vitória, alerta, ação). O resto é monocromático.
4. **Movimento é raro.** Animações são exceção, não regra. Cada uma precisa justificar sua existência.
5. **Densidade é respeito.** Mostre dados, não decoração. Mas mostre com hierarquia.
6. **Brasil sem caricatura.** Verde, amarelo, samba, papagaio — proibidos como recurso primário. A brasilidade vem do conteúdo, não do invólucro.

### 1.4. Personalidade da marca

| Somos | Não somos |
|---|---|
| Seco | Frio |
| Funcional | Burocrático |
| Refinado | Snob |
| Nostálgico | Saudosista |
| Brasileiro | Estereotipado |
| Direto | Rude |
| Confiante | Arrogante |
| Curto | Apressado |

### 1.5. Tagline e variações

**Principal:**
> *Minifoot. Tudo o que importa, nada que atrapalha.*

**Alternativas para contextos específicos:**
- *Quinze minutos viram três horas.* (campanha / store page)
- *Manager. Sem firula.* (one-liner curto)
- *O futebol como ele cabe num bolso.* (mobile pitch futuro)
- *Onze decisões. Trinta e oito rodadas. Uma temporada.* (descritivo)

---

## 2. O Logotipo

### 2.1. Construção

O logotipo é **wordmark puro** — não há símbolo separado obrigatório. A força está na tipografia.

```
minifoot.
```

**Especificação:**
- Caixa-baixa em todo o nome (estilo Linear, Vercel, Stripe).
- Peso da fonte de display: **Medium (500)** para `mini`, **Bold (700)** para `foot` — diferença sutil de peso destaca o sufixo de gênero sem brigar com a primeira parte.
- **Ponto final** após `foot.` é parte do logotipo. É a assinatura: declaração definitiva, sem firulas, fim de papo.
- Espaçamento entre letras: `-0.02em` (tracking levemente apertado).

### 2.2. Versões oficiais

1. **Logotipo primário** — `minifoot.` em uma cor (Bone `#ECEFF4`) sobre fundo escuro.
2. **Logotipo invertido** — `minifoot.` em Ink (`#0B0D10`) sobre fundo claro/Bone.
3. **Logotipo accent** — apenas o ponto final em Pitch (`#4ADE80`). Usado em momentos de destaque (splash screen, store page, conquista importante). **Nunca em UI corrida.**
4. **Monograma** — `mf.` em quadrado de cantos arredondados (8px radius, 64×64 base). Para favicon, ícone de app, redes sociais.

### 2.3. Área de proteção

A área livre mínima ao redor do logotipo é igual à altura do `m` minúsculo (`x-height`) — em qualquer escala.

### 2.4. Tamanhos mínimos

- Digital: **24px de altura** mínima para legibilidade do ponto final.
- Favicon / ícone de app: usar **monograma** `mf.` — nunca o wordmark completo abaixo de 24px.

### 2.5. O que o logotipo NÃO faz

- ❌ Não tem bola de futebol embutida.
- ❌ Não tem gradiente.
- ❌ Não tem sombra.
- ❌ Não usa as cores do Brasil.
- ❌ Não é em maiúsculas.
- ❌ Não tem versão em itálico.
- ❌ Não tem tagline embutida (a tagline é elemento separado, em fonte body).

---

## 3. Tipografia

### 3.1. Fontes oficiais

| Função | Fonte | Por quê |
|---|---|---|
| **Display / Headings** | **Söhne** (alternativa OSS: **Geist Sans**) | Sans-serif suíça moderna, com personalidade sem gritar. Geist é open-source e pareada com sua mono — economia de licença e coerência. |
| **Body / UI** | **Geist Sans** | Mesma família, peso menor. Alta legibilidade em densidade. |
| **Mono / Dados** | **Geist Mono** | Tabular figures por padrão — números das tabelas, placares, estatísticas alinham perfeitamente. |
| **Numerais especiais (placar)** | **JetBrains Mono** weight 700 | Apenas no número grande do placar em Match Day. Carrega autoridade. |

> **Por que não Inter?** Inter virou o "Helvetica do AI slop". Geist tem a mesma legibilidade com personalidade ligeiramente mais incisiva, e a família tem mono nativa.
> **Por que não SF Pro?** Restrita a contextos Apple — quebra em Windows/Linux.

### 3.2. Escala tipográfica

Escala modular **1.250 (major third)**. Tamanho base: 16px.

| Token | Tamanho | Uso |
|---|---|---|
| `text-3xs` | 10px / 14px | Microlabels, badges minúsculos |
| `text-2xs` | 11px / 14px | Tabular labels, status |
| `text-xs` | 12px / 16px | Captions, helper text |
| `text-sm` | 14px / 20px | Texto secundário, valores em tabela |
| `text-base` | 16px / 24px | Body padrão |
| `text-lg` | 20px / 28px | Subtítulos de cards |
| `text-xl` | 25px / 32px | Títulos de seção |
| `text-2xl` | 31px / 40px | Títulos de tela |
| `text-3xl` | 39px / 48px | H1 — usado em onboarding e splash |
| `text-display` | 56px / 64px | Placar do Match Day, momentos cinemáticos |

### 3.3. Pesos disponíveis

Apenas três pesos para reduzir carga e manter rigor:
- **Regular (400)** — body padrão.
- **Medium (500)** — labels, valores em destaque dentro de body.
- **Bold (700)** — headings, números importantes (placar, posição na tabela).

> Italic é **proibido** no produto. Em comunicação editorial (devlog, store page) é permitido com parcimônia.

### 3.4. Tracking, leading e refinos

- Headings (≥20px): `letter-spacing: -0.02em`. Evita parecer "aberto demais".
- Body (16px): tracking padrão `0`.
- All-caps labels (raros): `letter-spacing: 0.08em`, sempre em weight 500 mínimo.
- Números tabulares: ativar `font-feature-settings: "tnum" 1, "ss01" 1` em qualquer contexto de dados.

### 3.5. Hierarquia em telas

A hierarquia em UI **nunca** é construída por cor. É construída por:
1. Tamanho.
2. Peso.
3. Distância (espaçamento entre elementos).

Texto em cores diferentes (`muted`, `accent`) é exceção, não regra.

---

## 4. Sistema de cor

### 4.1. Filosofia

A paleta tem **5 cores funcionais + 1 surface scale**. Mais que isso é decoração, e decoração não pertence ao Minifoot.

### 4.2. Surface scale (Ink)

Tons frios, levemente azulados, para criar profundidade discreta no dark UI.

| Token | Hex | Uso |
|---|---|---|
| `--ink-950` | `#08090C` | Background mais profundo (raro, modais) |
| `--ink-900` | `#0B0D10` | Background base do app |
| `--ink-800` | `#14171C` | Surface elevada nível 1 (cards, sidebar) |
| `--ink-700` | `#1B2027` | Surface elevada nível 2 (popovers, hover) |
| `--ink-600` | `#252B33` | Surface elevada nível 3 (tooltips, dropdowns) |
| `--ink-500` | `#2A3038` | Borders sutis |
| `--ink-400` | `#3A4250` | Borders médios, dividers |
| `--ink-300` | `#5A6371` | Texto desabilitado |
| `--ink-200` | `#8A93A0` | Texto secundário (`text-muted`) |
| `--ink-100` | `#C4CAD3` | Texto secundário forte |
| `--ink-050` | `#ECEFF4` | Texto primário (Bone) |

### 4.3. Cores funcionais

Cor só aparece quando carrega significado.

| Token | Hex | Significado |
|---|---|---|
| `--pitch` | `#4ADE80` | **Verde gramado.** Vitória, ação primária, sucesso, valor positivo, conquista. **Único acento principal.** |
| `--pitch-deep` | `#22C55E` | Hover do `pitch`, gradiente sutil em momentos de celebração. |
| `--whistle` | `#FACC15` | **Amarelo cartão.** Atenção, cartão amarelo, lesão leve, alerta neutro. |
| `--card` | `#F87171` | **Vermelho cartão.** Cartão vermelho, derrota severa, ação destrutiva. |
| `--bone` | `#ECEFF4` | Texto primário, logotipo em superfícies escuras (alias de `ink-050`). |

### 4.4. Cores ausentes (intencional)

- **Sem azul.** Azul é a cor do "AI saas" genérico.
- **Sem roxo.** Roxo de fintech / IA é proibido.
- **Sem laranja como acento.** Confundiria com o amarelo cartão.
- **Sem amarelo+verde juntos como statement.** Evita caricatura brasileira.

### 4.5. Uso quantitativo (regra 70/20/10)

Em qualquer tela:
- **70%** Ink (surfaces e backgrounds).
- **20%** Bone (textos e elementos primários).
- **10%** Pitch + funcionais (apenas onde importa).

Telas que violam essa proporção são tratadas como bug visual.

### 4.6. Tema claro (futuro)

O Minifoot nasce dark. Um tema claro pode existir na v0.5+, com a paleta espelhada — mas é **opt-in**. O tema padrão sempre será dark.

---

## 5. Iconografia

### 5.1. Família

**Lucide** (`lucide-react`). Um pacote, um peso, um estilo.

### 5.2. Regras

- **Stroke width: 1.5px**, sempre. Nunca outlinedouble, nunca filled.
- **Tamanhos canônicos: 14, 16, 20, 24px.** Nunca entre.
- **Cor herdada de `currentColor`** — nunca cores hardcoded.
- **Ícone nunca aparece sozinho** quando representa uma ação principal. Sempre com label ao lado, exceto em controles ultra-conhecidos (✕ fechar, ⚙ settings, ⌕ buscar).

### 5.3. Icone proibidos

- ❌ Bola de futebol como decoração de UI.
- ❌ Troféu colorido.
- ❌ Emojis em produção (uso permitido só em copy de empty state, com parcimônia).
- ❌ Ícones com cor de marca (sempre monocromáticos).

### 5.4. Símbolos especiais

Pequenos elementos custom desenhados como SVG, não como fonte de ícone:
- **Posições do campo** (GK / DF / MF / FW) — labels tipográficos com background `ink-700` em quadrado 24×24, radius 4px.
- **Progressão de overall** — mini sparkline 60×16 em `pitch` quando subindo, `card` quando descendo.

---

## 6. Tokens de design (a fonte da verdade)

> **Esta seção é o contrato com o código.** Esses tokens vão em `src/ui/theme/tokens.css` e `tailwind.config.ts`.

### 6.1. CSS variables (`:root`)

```css
:root {
  /* === Surface Scale (Ink) === */
  --ink-950: #08090C;
  --ink-900: #0B0D10;
  --ink-800: #14171C;
  --ink-700: #1B2027;
  --ink-600: #252B33;
  --ink-500: #2A3038;
  --ink-400: #3A4250;
  --ink-300: #5A6371;
  --ink-200: #8A93A0;
  --ink-100: #C4CAD3;
  --ink-050: #ECEFF4;

  /* === Functional === */
  --pitch:        #4ADE80;
  --pitch-deep:   #22C55E;
  --whistle:      #FACC15;
  --card:         #F87171;
  --bone:         #ECEFF4;

  /* === Semantic aliases (use estes em vez dos brutos quando possível) === */
  --bg-base:      var(--ink-900);
  --bg-elev-1:    var(--ink-800);
  --bg-elev-2:    var(--ink-700);
  --bg-elev-3:    var(--ink-600);
  --border:       var(--ink-500);
  --border-strong:var(--ink-400);
  --text-primary: var(--ink-050);
  --text-muted:   var(--ink-200);
  --text-faint:   var(--ink-300);
  --accent:       var(--pitch);
  --accent-hover: var(--pitch-deep);
  --warn:         var(--whistle);
  --danger:       var(--card);

  /* === Typography === */
  --font-display: "Geist", "Söhne", system-ui, sans-serif;
  --font-body:    "Geist", system-ui, sans-serif;
  --font-mono:    "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
  --font-score:   "JetBrains Mono", ui-monospace, monospace;

  /* === Radius === */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 9999px;

  /* === Spacing (escala 4px) === */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* === Elevation (sombras sutis no dark) === */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.6);

  /* === Motion === */
  --ease-out:   cubic-bezier(0.22, 1, 0.36, 1);
  --ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast:    120ms;
  --duration-base:    200ms;
  --duration-slow:    320ms;

  /* === Focus === */
  --focus-ring:   0 0 0 2px var(--ink-900), 0 0 0 4px var(--accent);
  --focus-ring-inset: inset 0 0 0 2px var(--accent);

  /* === Z-index === */
  --z-base:    0;
  --z-sticky:  10;
  --z-overlay: 20;
  --z-modal:   30;
  --z-popover: 40;
  --z-toast:   50;
}
```

### 6.2. Tailwind config (excerto)

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        ink: {
          50:  'var(--ink-050)',
          100: 'var(--ink-100)',
          200: 'var(--ink-200)',
          300: 'var(--ink-300)',
          400: 'var(--ink-400)',
          500: 'var(--ink-500)',
          600: 'var(--ink-600)',
          700: 'var(--ink-700)',
          800: 'var(--ink-800)',
          900: 'var(--ink-900)',
          950: 'var(--ink-950)',
        },
        pitch:    'var(--pitch)',
        whistle:  'var(--whistle)',
        card:     'var(--card)',
        bone:     'var(--bone)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans:    'var(--font-body)',
        mono:    'var(--font-mono)',
        score:   'var(--font-score)',
      },
      borderRadius: {
        xs:   'var(--radius-xs)',
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      transitionTimingFunction: {
        out:   'var(--ease-out)',
        inout: 'var(--ease-inout)',
      },
    },
  },
};
```

---

## 7. Componentes — princípios e especificações-chave

### 7.1. Princípios gerais

1. **Bordas sutis em vez de sombras.** Borders de 1px em `var(--border)` carregam mais elegância no dark UI do que box-shadows pesadas.
2. **Hover discreto.** Cor de fundo sobe um nível na escala Ink. Sem brilho, sem glow.
3. **Estados consistentes.** Todo componente interativo tem 5 estados visuais: `default`, `hover`, `active`, `focus`, `disabled`. Documentados, sempre.
4. **Foco SEMPRE visível.** `--focus-ring` é o anel canônico. Não há exceção (ver Seção 7.6 do plano principal).

### 7.2. Botões

| Variante | Uso | Spec |
|---|---|---|
| **Primary** | Ação principal da tela ("Avançar Rodada") | `bg: pitch`, `text: ink-900`, `weight: 600` |
| **Secondary** | Ação alternativa | `bg: ink-700`, `text: bone`, `border: ink-500` |
| **Ghost** | Ação terciária / cancelar | `bg: transparent`, `text: bone`, `hover: ink-800` |
| **Danger** | Vender, demitir, deletar save | `bg: transparent`, `text: card`, `border: card`, `hover: bg card/10` |

**Tamanhos:** `sm` (28px alto), `md` (36px — padrão), `lg` (44px — ações principais de tela).

**Botão "Avançar"** (atalho `Espaço`): sempre fixo no canto inferior direito, `lg`, primary, com ícone `→` à direita e label da próxima ação ("Próxima rodada", "Continuar", "Iniciar partida").

### 7.3. Tabelas (componente mais importante do jogo)

**Estrutura:**
- Linhas: 36px de altura padrão, 44px em densidade confortável.
- Header: `text-2xs uppercase tracking-wide text-muted`.
- Linha hover: `bg ink-800`.
- Linha selecionada: `bg ink-700`, com indicator de 2px à esquerda em `pitch`.
- Zebra: **NÃO usar.** Bordas inferiores sutis (`1px solid ink-500/40`) são suficientes.
- Números: sempre em `font-mono`, `tabular-nums`, alinhados à direita.
- Nomes: `font-sans medium`, alinhados à esquerda.

**Ordenação:**
- Header clicável muda cursor para `pointer`.
- Indicador de ordenação ativa: pequeno ↑/↓ em `pitch`, 12px, à direita do label.
- Foco por teclado no header é visível (Seção 6 deste doc + Seção 7.6 do plano).

### 7.4. Cards

**Padrão:**
- `bg: ink-800`
- `border: 1px solid ink-500`
- `radius: md (10px)`
- `padding: 20px (space-5)` — confortável mas não esbanjado
- Header opcional: label `text-2xs uppercase` em `ink-200`, separado do conteúdo por 4px

**Variante "stat card"** (Home dashboard):
- Número grande em `font-mono bold text-3xl`
- Label acima em `text-xs uppercase muted`
- Delta opcional abaixo em `text-sm` na cor `pitch` ou `card` (subindo / descendo)

### 7.5. Inputs

- Altura: 36px padrão.
- `bg: ink-800`, `border: 1px solid ink-500`, `text: bone`.
- Placeholder: `ink-300`.
- Focus: `border: pitch`, `ring: 2px ink-900 + 2px pitch` (via `--focus-ring`).
- Sem floating labels. Label sempre acima, em `text-xs uppercase muted`.

### 7.6. Modais

- Overlay: `rgba(0,0,0,0.6)` + `backdrop-filter: blur(4px)`.
- Modal: `bg: ink-800`, `radius: lg`, `max-width: 520px` para diálogos / `720px` para conteúdo.
- Padding: 24px (32px em conteúdo).
- Foco aprisionado dentro do modal. `Esc` fecha. Restaura foco para o gatilho.

### 7.7. Toasts / notificações

- Posição: canto inferior direito, **acima** do botão Avançar (offset 80px).
- Largura: 320px máximo.
- Fundo: `ink-700`, borda lateral esquerda 3px na cor funcional (`pitch` / `whistle` / `card`).
- Auto-dismiss: 4s. Hover pausa. Fechar manualmente com ✕ ou `Esc`.

### 7.8. Foco visível (canônico)

Todo elemento interativo recebe ao focar:

```css
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: inherit;
}
```

---

## 8. Movimento (motion design)

### 8.1. Filosofia

Animação no Minifoot é **funcional, nunca decorativa**. Cada animação responde a uma de três perguntas:
1. **Onde algo veio?** (entrada de tela)
2. **O que mudou?** (delta de número, transição de estado)
3. **Algo importante aconteceu?** (gol, vitória de campeonato)

Tudo o mais é estático.

### 8.2. Durações canônicas

| Token | Duração | Quando |
|---|---|---|
| `--duration-fast` | 120ms | Hover, foco, mudança de estado de toggle |
| `--duration-base` | 200ms | Transição entre telas, abrir modal, expandir card |
| `--duration-slow` | 320ms | Entrada inicial de tela cheia, splash |

**Limite duro:** nada acima de 320ms exceto celebrações específicas (gol, fim de campeonato).

### 8.3. Curvas

- `--ease-out` para entradas (algo aparecendo).
- `--ease-inout` para transições de estado.
- **Nunca `linear`** exceto em barras de progresso.
- **Nunca `bounce`/`elastic`** — gerou cringe nos anos 2010, hoje é instantâneo.

### 8.4. Animações específicas

| Evento | Animação |
|---|---|
| **Mudança de placar** | Número faz tween de 200ms com `ease-out`. Brilho sutil em `pitch` por 120ms. |
| **Gol marcado pelo seu time** | Card do jogador escala de 1 → 1.02 → 1 em 240ms. Flash de borda `pitch` por 200ms. |
| **Cartão vermelho** | Shake horizontal 6px, 3 oscilações, 240ms total. |
| **Transição de tela** | Fade + translate vertical 8px, 200ms ease-out. |
| **Modal abrindo** | Overlay fade 120ms; modal escala 0.96 → 1, fade, 200ms. |
| **Fim de campeonato** | Confete sutil 1× em `pitch` + `bone`, 1.5s, depois para. |

### 8.5. `prefers-reduced-motion`

Quando o usuário tem `prefers-reduced-motion: reduce`:
- Todas as transições caem para 0ms ou 60ms (apenas fade).
- Shakes e bounces desligam.
- Confete desliga.
- Mudanças de placar viram troca instantânea, sem tween.

---

## 9. Voz e tom da escrita

### 9.1. Princípios

1. **Curta. Frase curta.** Ponto.
2. **Tom seco com humor de canto.** Nunca empolgação forçada.
3. **Sem jargão de FM.** Sem "regen", "facepack", "newgen". Use português.
4. **Termos técnicos do futebol em PT-BR.** "Overall" é exceção — virou universal. Mas é "elenco", não "squad". "Tática", não "set piece routines".

### 9.2. Vocabulário canônico

| Use | Não use |
|---|---|
| Elenco | Squad, plantel |
| Tática | Esquema (na UI; em copy editorial pode) |
| Próxima rodada | Próxima jornada |
| Avançar | Prosseguir, continuar |
| Salvar | Gravar |
| Mercado | Janela (use só em contexto de "janela aberta") |
| Lesão | Contusão |
| Aposentadoria | Pendurar as chuteiras (apenas em narrativa) |

### 9.3. Empty states (a hora de brilhar)

Empty states são onde o tom aparece. Curtos, com humor seco.

| Situação | Texto |
|---|---|
| Sem lesionados | "Departamento médico vazio. Aproveite enquanto dura." |
| Sem ofertas recebidas | "Nenhuma proposta. Seu elenco está confortável — ou esquecido." |
| Sem notícias | "Sem manchetes. A imprensa está distraída." |
| Lista de troféus vazia | "Vitrine vazia. Por enquanto." |
| Search sem resultados | "Ninguém com esse nome. Talvez você tenha inventado." |

### 9.4. Mensagens de sistema

- Confirmação de venda: *"Vender [Jogador] por R$ X? Sem volta."*
- Erro de save: *"Não foi possível salvar. Tente de novo, ou reinicie o app."*
- Conclusão de temporada: *"Temporada encerrada. Próxima começa quando você quiser."*

### 9.5. Voz em comunicação externa (devlog, store page)

Mais frases. Mesmo tom. Permite-se primeira pessoa do plural — "decidimos não fazer X porque..." — mas nunca emoji excessivo, nunca "🚀", nunca "let's go".

---

## 10. Aplicações da identidade

### 10.1. Splash screen

- Fundo: `ink-900`.
- Centro absoluto: logotipo `minifoot.` em `bone`, 48px.
- Abaixo, 24px de gap: tagline em `text-xs uppercase tracking-wide muted`.
- Em momentos de versão: número da versão no canto inferior direito, `text-2xs muted mono`.
- Sem animação além de fade-in 320ms.

### 10.2. Ícone do app

- Quadrado com cantos arredondados 22% (padrão macOS/iOS/Windows 11).
- Background: gradiente sutilíssimo de `ink-800` → `ink-900` (top-left → bottom-right).
- Centro: monograma `mf.` em `bone`, weight 700, 56% do lado.
- Ponto final em `pitch` para um toque mínimo de cor — ÚNICO momento em que o monograma usa cor.

### 10.3. Onboarding (escolha de clube e técnico)

- Tela cheia em `ink-900`.
- Pergunta única em `text-3xl bold`.
- Subtítulo em `text-base muted`.
- Input ou seleção centralizada, max-width 480px.
- Botão "Continuar" `lg primary` no canto inferior direito.
- Sem ilustrações. Sem mascotes. Sem "bem-vindo!".

### 10.4. Match Day (a tela mais cinemática)

- Header fixo: dois nomes de clubes em `text-xl medium`, separados por placar gigante em `font-score bold text-display` (56-64px).
- Cronômetro `text-sm mono muted` no centro, abaixo do placar.
- Lista de eventos abaixo, em rolagem suave: cada evento em uma linha, minuto + descrição.
- Painel lateral à direita: estatísticas vivas (posse, chutes, xG) em mono.
- Controles fixos no rodapé: velocidade `1× 2× 5× 10×` + "Pular" + "Pausar".

### 10.5. Store page (Steam, itch.io)

- Capa: logotipo grande no centro com tagline abaixo, fundo `ink-900` com **leve** grain texture (5% noise opacity).
- Screenshots: sempre da própria UI, sem mockups artificiais.
- Texto descritivo curto, parágrafos de 2-3 linhas, mantém voz da Seção 9.

### 10.6. Redes sociais (devlog visual)

- Templates 1080×1350 px (vertical) e 1920×1080 (horizontal).
- Sempre fundo `ink-900` com grão sutil.
- Texto em Geist, peso variando entre 400 e 700.
- Logotipo `mf.` discreto no canto inferior direito.
- Cor: 95% monocromático, eventual flash de `pitch` para destaques.

---

## 11. Guardrails (o que nunca fazer)

- ❌ Gradientes coloridos como background de tela.
- ❌ Glassmorphism / blur exagerado em superfícies grandes.
- ❌ Drop shadows pesadas em dark UI.
- ❌ Mais de uma cor de acento por tela.
- ❌ Ícones decorativos sem função.
- ❌ Mascote da marca.
- ❌ Tipografia diferente de Geist/Söhne em produção.
- ❌ Bandeira do Brasil ou referências caricaturais.
- ❌ Stock images de jogadores reais.
- ❌ Animações looping ambientes (background animado, partículas perpétuas).
- ❌ Texto centralizado em parágrafos longos.
- ❌ Botões com gradientes.
- ❌ "Light mode" como padrão.

---

## 12. Checklist de QA visual (para cada tela nova)

Antes de uma tela ser considerada pronta:

- [ ] Tipografia segue a escala da Seção 3.2.
- [ ] Apenas tokens da Seção 6 são usados (sem cor hardcoded).
- [ ] Proporção 70/20/10 de cor respeitada.
- [ ] Foco visível em todos os interativos.
- [ ] Equivalência mouse/teclado garantida (Seção 7.6 do plano principal).
- [ ] Animações ≤ 320ms e respeitam `prefers-reduced-motion`.
- [ ] Empty states têm voz da Seção 9.
- [ ] Nenhum item da Seção 11 (guardrails) violado.
- [ ] Contraste AA em todos os pares de texto/fundo.
- [ ] Densidade testada em janela 1280×720 (mínimo suportado).

---

## 13. Versionamento e governança

- Este documento é **v1.0**. Mudanças passam por PR no repositório `docs/DESIGN_SYSTEM.md`.
- Cada versão vem com nota no `CHANGELOG.md` da pasta `docs/`.
- Breaking changes em tokens (renomear, remover) exigem `MAJOR`. Adições de tokens são `MINOR`. Ajustes de valores são `PATCH`.
- O Codex consulta este documento antes de criar qualquer componente novo. Se um padrão estiver faltando, **adiciona-se aqui antes de codar**.

---

**Fim do documento. minifoot. — uma decisão de cada vez.**
