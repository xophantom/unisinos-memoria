export default function Header() {
  return (
    <header className="w-full text-center text-white">
      <div className="inline-flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight">UNISINOS</span>
        <span className="px-2 py-0.5 rounded-md bg-white text-cobalt text-sm font-bold">Conecta</span>
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">
        Play no Futuro
      </h1>
      <p className="text-white/75">Descubra seu próximo passo na Unisinos</p>
    </header>
  );
}
