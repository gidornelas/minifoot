import { useGameStore } from "./store/game.store";
import { PlaceholderView } from "./ui/components/PlaceholderView";
import { HomeView } from "./ui/features/home/HomeView";
import { SquadView } from "./ui/features/squad/SquadView";
import { TacticsView } from "./ui/features/tactics/TacticsView";
import { MainLayout } from "./ui/layouts/MainLayout";

export function App() {
  const activeView = useGameStore((state) => state.activeView);

  return (
    <MainLayout>
      {activeView === "home" ? <HomeView /> : null}
      {activeView === "squad" ? <SquadView /> : null}
      {activeView === "tactics" ? <TacticsView /> : null}
      {activeView === "table" ? (
        <PlaceholderView eyebrow="Sprint 5" title="Tabela de classificacao" />
      ) : null}
      {activeView === "market" ? <PlaceholderView eyebrow="Sprint 6" title="Mercado" /> : null}
      {activeView === "news" ? <PlaceholderView eyebrow="Sprint 7" title="Noticias" /> : null}
    </MainLayout>
  );
}
