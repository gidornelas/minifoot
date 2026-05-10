import type { NewsItem, NewsTag } from "../domain";

export type NewsTrigger =
  | "match-result"
  | "match-upset"
  | "match-comeback"
  | "transfer"
  | "performance"
  | "injury"
  | "system";

export interface NewsTemplate {
  id: string;
  type: NewsItem["type"];
  trigger: NewsTrigger;
  tags: NewsTag[];
  title: string;
  body: string;
}

const matchTitles = [
  "{homeShort} e {awayShort} entregam noite de placar definido",
  "{winnerShort} controla os detalhes contra {loserShort}",
  "{homeShort} x {awayShort} movimenta a rodada",
  "Resultado em {homeShort} x {awayShort} mexe na tabela",
  "{winnerShort} sai sorrindo depois de jogo duro",
  "Rodada coloca {winnerShort} em evidencia",
  "{homeShort} e {awayShort} deixam sinais para a semana",
  "Placar de {score} resume duelo competitivo",
  "{winnerShort} encontra caminho em partida truncada",
  "Torcida acompanha duelo de ritmo alto",
  "{homeShort} segura pressao e fecha a conta",
  "{awayShort} mostra resposta fora de casa",
  "Detalhes decidem {homeShort} x {awayShort}",
  "Jogo de {totalGoals} gols agita bastidores",
  "{winnerShort} transforma volume em resultado",
  "Tabela sente o efeito de {homeShort} x {awayShort}",
];

const upsetTitles = [
  "Zebra: {winnerShort} derruba favorito {loserShort}",
  "{winnerShort} desafia previsao e cala analistas",
  "Favorito tropeça diante de {winnerShort}",
  "Resultado improvavel muda o humor da rodada",
  "{winnerShort} assina surpresa contra {loserShort}",
  "Dia de azar para favorito, festa para {winnerShort}",
  "Zebra passa pelo gramado em {score}",
  "{loserShort} sente golpe de rival menos cotado",
  "A rodada ganha manchete inesperada",
  "{winnerShort} transforma desvantagem tecnica em coragem",
  "Favoritismo nao entra em campo para {loserShort}",
  "{winnerShort} celebra triunfo que ninguem cravou",
];

const comebackTitles = [
  "Virada: {winnerShort} encontra forca no fim",
  "{winnerShort} busca placar e vira historia",
  "Partida muda de dono depois do intervalo",
  "{loserShort} abre caminho, mas {winnerShort} fecha",
  "Reacao marca a rodada em {score}",
  "{winnerShort} vence no embalo da virada",
  "O jogo virou para {winnerShort}",
  "Controle emocional decide virada",
  "{winnerShort} transforma susto em tres pontos",
  "Virada esquenta vestiario de {winnerShort}",
  "{loserShort} deixa escapar vantagem",
  "Final eletrico coroa {winnerShort}",
];

const transferTitles = [
  "{player} entra na pauta de {toShort}",
  "{fromShort} responde consulta por {player}",
  "{player} movimenta mesa de negociacao",
  "Mercado esquenta com nome de {player}",
  "{toShort} calcula investimento por {player}",
  "Proposta por {player} vira assunto interno",
  "{fromShort} avalia futuro de {player}",
  "{player} pode trocar de camisa",
  "Diretoria acompanha situacao de {player}",
  "{toShort} testa resistencia de {fromShort}",
  "Salario de {player} pesa na conversa",
  "Oferta por {player} abre rodada de chamadas",
  "{player} aparece no radar do mercado",
  "{fromShort} segura pedida por {player}",
  "{toShort} tenta encurtar negociacao",
  "Janela ganha movimento por {player}",
];

const performanceTitles = [
  "{player} vira assunto pelo rendimento",
  "{clubShort} observa crescimento de {player}",
  "Semana positiva para {player}",
  "{player} pede passagem no elenco",
  "Comissao elogia postura de {player}",
  "{player} sustenta boa fase",
  "Numeros reforcam momento de {player}",
  "{clubShort} ganha opcao com {player}",
  "Treino confirma bom sinal de {player}",
  "{player} melhora disputa interna",
  "Vestiario reconhece impacto de {player}",
  "{player} aumenta pressao por minutos",
  "Relatorio destaca {player}",
  "{clubShort} ve retorno tecnico em {player}",
  "Boa fase muda status de {player}",
  "{player} entra no radar da torcida",
];

const injuryTitles = [
  "{player} preocupa departamento medico",
  "{clubShort} monitora condicao de {player}",
  "Alerta fisico para {player}",
  "{player} passa por avaliacao",
  "Sequencia de {player} entra em risco",
  "Comissao reduz carga de {player}",
  "{clubShort} poupa {player} no treino",
  "Departamento medico observa {player}",
];

const systemTitles = [
  "Diretoria revisa metas da temporada",
  "Semana de ajustes no calendario",
  "Ambiente interno pede foco",
  "Torcida acompanha proximos passos",
  "Planejamento entra em pauta",
  "Calendario cobra elenco equilibrado",
  "Comissao organiza semana cheia",
  "Clube prepara novo ciclo de jogos",
];

const bodies = [
  "A leitura interna e de que o resultado precisa virar informacao, nao euforia.",
  "A comissao tecnica saiu com pontos claros para corrigir antes da proxima semana.",
  "O vestiario tratou a noite como parte do processo, sem aumentar o tom.",
  "A diretoria observou impacto esportivo e financeiro antes de qualquer decisao.",
  "O elenco recebeu o recado de que consistencia vale mais que manchete isolada.",
  "Analistas destacaram detalhes pequenos que mudaram o ritmo da partida.",
  "A torcida reagiu bem, mas a agenda nao permite descanso longo.",
  "Nos bastidores, a avaliacao e de oportunidade com risco controlado.",
];

export const NEWS_TEMPLATES: NewsTemplate[] = [
  ...makeTemplates("match", "match", "match-result", ["result"], matchTitles, bodies),
  ...makeTemplates("upset", "match", "match-upset", ["result", "upset"], upsetTitles, bodies),
  ...makeTemplates(
    "comeback",
    "match",
    "match-comeback",
    ["result", "comeback"],
    comebackTitles,
    bodies,
  ),
  ...makeTemplates("transfer", "transfer", "transfer", ["transfer"], transferTitles, bodies),
  ...makeTemplates(
    "performance",
    "performance",
    "performance",
    ["form"],
    performanceTitles,
    bodies,
  ),
  ...makeTemplates("injury", "injury", "injury", ["injury"], injuryTitles, bodies),
  ...makeTemplates("system", "system", "system", [], systemTitles, bodies),
];

function makeTemplates(
  prefix: string,
  type: NewsItem["type"],
  trigger: NewsTrigger,
  tags: NewsTag[],
  titles: readonly string[],
  bodyPool: readonly string[],
): NewsTemplate[] {
  return titles.map((title, index) => ({
    body: bodyPool[index % bodyPool.length] as string,
    id: `${prefix}-${String(index + 1).padStart(2, "0")}`,
    tags,
    title,
    trigger,
    type,
  }));
}
