export default function Header() {
  return (
    <header className="w-full text-center">
      <div className="inline-flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight text-unisinos">UNISINOS</span>
        <span className="px-2 py-0.5 rounded-md bg-unisinos text-white text-sm font-bold">Start</span>
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-neutral-900">
        Jogo da Memória dos Cursos
      </h1>
      <p className="text-neutral-500">Encontre os pares e descubra as Escolas da Unisinos</p>
    </header>
  );
}
