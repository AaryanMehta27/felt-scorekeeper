import { useState } from 'react';
import HomeScreen from './components/screens/HomeScreen';
import NewSessionScreen from './components/screens/NewSessionScreen';
import SessionScreen from './components/screens/SessionScreen';
import LeaderboardScreen from './components/screens/LeaderboardScreen';
import HistoryScreen from './components/screens/HistoryScreen';

export type Screen = 'home' | 'new' | 'session' | 'leaderboard' | 'history';
export type Navigate = (screen: Screen) => void;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 safe-top safe-bottom">
      {screen === 'home' && <HomeScreen navigate={setScreen} />}
      {screen === 'new' && <NewSessionScreen navigate={setScreen} />}
      {screen === 'session' && <SessionScreen navigate={setScreen} />}
      {screen === 'leaderboard' && <LeaderboardScreen navigate={setScreen} />}
      {screen === 'history' && <HistoryScreen navigate={setScreen} />}
    </div>
  );
}
