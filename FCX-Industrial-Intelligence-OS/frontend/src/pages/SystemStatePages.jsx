import { PageHeader } from '../components/Common';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Página não encontrada" subtitle="A rota solicitada não existe ou ainda não está disponível." />
      <section className="panel systemStatePanel">
        <header>
          <div>
            <h2>404</h2>
            <p>Use o menu lateral para voltar a uma área operacional do FCX.</p>
          </div>
        </header>
      </section>
    </>
  );
}
