import { useGameStore } from "./store/game.store";
import { HomeView } from "./ui/features/home/HomeView";
import { LeagueTableView } from "./ui/features/league-table/LeagueTableView";
import { MatchDayView } from "./ui/features/match-day/MatchDayView";
import { NewsFeedView } from "./ui/features/news-feed/NewsFeedView";
import { OnboardingView } from "./ui/features/onboarding/OnboardingView";
import { SeasonEndView } from "./ui/features/season-end/SeasonEndView";
import { SquadView } from "./ui/features/squad/SquadView";
import { TacticsView } from "./ui/features/tactics/TacticsView";
import { TransferMarketView } from "./ui/features/transfers/TransferMarketView";
import { MainLayout } from "./ui/layouts/MainLayout";

export function App() {
  const activeView = useGameStore((state) => state.activeView);
  const onboardingComplete = useGameStore((state) => state.onboardingComplete);

  if (!onboardingComplete) {
    return <OnboardingView />;
  }

  return (
    <MainLayout>
      {activeView === "home" ? <HomeView /> : null}
      {activeView === "squad" ? <SquadView /> : null}
      {activeView === "tactics" ? <TacticsView /> : null}
      {activeView === "match-day" ? <MatchDayView /> : null}
      {activeView === "table" ? <LeagueTableView /> : null}
      {activeView === "market" ? <TransferMarketView /> : null}
      {activeView === "news" ? <NewsFeedView /> : null}
      {activeView === "season-end" ? <SeasonEndView /> : null}
    </MainLayout>
  );
}
