import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini di Servizio - Impresius",
  description: "Termini e condizioni di utilizzo della piattaforma Impresius.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen relative">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
          Termini di Servizio
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Ultimo aggiornamento: 18 marzo 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Premessa</h2>
            <p>
              I presenti Termini di Servizio (&ldquo;Termini&rdquo;) regolano l&apos;utilizzo della
              piattaforma Impresius (&ldquo;Servizio&rdquo;), accessibile all&apos;indirizzo{" "}
              <strong>impresius.com</strong>, fornita da:
            </p>
            <address className="not-italic bg-muted rounded-xl p-5 text-sm leading-relaxed mt-3">
              <strong className="text-foreground">Studio Tecnico Lombardo</strong><br />
              Geom. Lombardo Marco<br />
              Via Sant&apos;Antonio n. 5<br />
              22070 &mdash; Locate Varesino (CO)<br />
              Partita IVA: 03090650130
            </address>
            <p className="mt-3">
              Utilizzando il Servizio, l&apos;utente dichiara di aver letto, compreso e accettato i
              presenti Termini. In caso di disaccordo, &egrave; pregato di non utilizzare il Servizio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Descrizione del Servizio</h2>
            <p>
              Impresius &egrave; una piattaforma SaaS (Software as a Service) che consente ai professionisti
              del settore immobiliare di:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Creare e gestire business plan per operazioni immobiliari.</li>
              <li>Elaborare computi metrici e stime di costi.</li>
              <li>Calcolare stime del valore di vendita delle unit&agrave; immobiliari.</li>
              <li>Analizzare margini e redditivit&agrave; degli investimenti.</li>
              <li>Generare report professionali in formato PDF.</li>
              <li>Confrontare scenari e simulazioni economiche.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Registrazione e Account</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Per utilizzare il Servizio &egrave; necessario creare un account fornendo informazioni veritiere e aggiornate.</li>
              <li>L&apos;utente &egrave; responsabile della riservatezza delle proprie credenziali di accesso.</li>
              <li>L&apos;utente deve avere almeno 18 anni di et&agrave;.</li>
              <li>Ci riserviamo il diritto di sospendere o eliminare account che violino i presenti Termini.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Piani e Pagamenti</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Il Servizio &egrave; disponibile in diversi piani tariffari, incluso un piano gratuito con funzionalit&agrave; limitate.</li>
              <li>I pagamenti vengono elaborati tramite Stripe Inc. in modo sicuro e conforme agli standard PCI-DSS.</li>
              <li>Gli abbonamenti si rinnovano automaticamente salvo disdetta prima della scadenza del periodo corrente.</li>
              <li>I prezzi possono essere soggetti a variazioni con preavviso di almeno 30 giorni.</li>
              <li>I pagamenti effettuati non sono rimborsabili, salvo quanto previsto dalla legge applicabile.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Utilizzo Consentito</h2>
            <p>L&apos;utente si impegna a:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Utilizzare il Servizio esclusivamente per finalit&agrave; professionali lecite.</li>
              <li>Non tentare di accedere in modo non autorizzato al sistema o ai dati di altri utenti.</li>
              <li>Non utilizzare il Servizio per attivit&agrave; fraudolente o illegali.</li>
              <li>Non riprodurre, distribuire o rivendere il Servizio o parte di esso senza autorizzazione.</li>
              <li>Non interferire con il funzionamento della piattaforma o sovraccaricare intenzionalmente i server.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Propriet&agrave; Intellettuale</h2>
            <p>
              Il Servizio, inclusi software, design, loghi, testi e struttura, &egrave; di propriet&agrave;
              esclusiva di Studio Tecnico Lombardo ed &egrave; protetto dalle leggi italiane e internazionali
              in materia di propriet&agrave; intellettuale.
            </p>
            <p className="mt-3">
              I dati e i contenuti inseriti dall&apos;utente nella piattaforma restano di propriet&agrave; dell&apos;utente.
              L&apos;utente concede a Impresius una licenza limitata per elaborare tali dati al solo fine di
              erogare il Servizio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Limitazione di Responsabilit&agrave;</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Il Servizio &egrave; fornito &ldquo;cos&igrave; com&apos;&egrave;&rdquo; (as is). Non garantiamo che il Servizio
                sia privo di errori o interruzioni.
              </li>
              <li>
                I calcoli, le stime e le analisi generate dalla piattaforma hanno scopo indicativo e non
                costituiscono consulenza professionale, finanziaria o legale.
              </li>
              <li>
                L&apos;utente &egrave; l&apos;unico responsabile delle decisioni prese sulla base dei dati elaborati dal Servizio.
              </li>
              <li>
                La responsabilit&agrave; del fornitore &egrave; limitata, nella misura massima consentita dalla legge,
                all&apos;importo complessivamente corrisposto dall&apos;utente nei 12 mesi precedenti l&apos;evento dannoso.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Disponibilit&agrave; del Servizio</h2>
            <p>
              Ci impegniamo a garantire la massima disponibilit&agrave; del Servizio. Tuttavia, possono
              verificarsi interruzioni per manutenzione programmata o cause di forza maggiore. In caso
              di manutenzione programmata, verr&agrave; fornito un preavviso ragionevole quando possibile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Cancellazione dell&apos;Account</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>L&apos;utente pu&ograve; cancellare il proprio account in qualsiasi momento dalle impostazioni del profilo.</li>
              <li>La cancellazione comporta l&apos;eliminazione dei dati dell&apos;account entro 30 giorni, salvo obblighi legali di conservazione.</li>
              <li>I dati dei progetti vengono eliminati definitivamente al momento della cancellazione.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Modifiche ai Termini</h2>
            <p>
              Ci riserviamo il diritto di modificare i presenti Termini in qualsiasi momento.
              Le modifiche saranno comunicate tramite la piattaforma o via email. L&apos;utilizzo
              continuato del Servizio dopo la notifica delle modifiche costituisce accettazione
              dei nuovi Termini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Legge Applicabile e Foro Competente</h2>
            <p>
              I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia derivante
              dall&apos;utilizzo del Servizio sar&agrave; competente in via esclusiva il Foro di Como,
              fatto salvo il foro del consumatore ove applicabile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">12. Contatti</h2>
            <p>
              Per qualsiasi domanda relativa ai presenti Termini, contattaci all&apos;indirizzo{" "}
              <a href="mailto:info@impresius.com" className="text-blue-600 hover:underline">info@impresius.com</a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
