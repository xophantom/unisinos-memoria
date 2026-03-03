import GameBoard from './components/GameBoard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center py-8">
      <div className="relative w-full">
        <GameBoard />
      </div>
    </main>
  );
}
