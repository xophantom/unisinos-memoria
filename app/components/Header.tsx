export default function Header() {
  return (
    <header className="w-full text-center">
      <div className="inline-flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight text-unisinos">UNISINOS</span>
        <span className="px-2 py-0.5 rounded-md bg-unisinos text-white text-sm font-bold">Conecta</span>
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-neutral-900">
        Play no Futuro
      </h1>
      <p className="text-neutral-500">Descubra seu próximo passo na Unisinos</p>
    </header>
  );
}
