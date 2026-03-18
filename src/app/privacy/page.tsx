import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Impresius",
  description: "Informativa sulla privacy di Impresius ai sensi del GDPR.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen relative">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Ultimo aggiornamento: 18 marzo 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Titolare del Trattamento</h2>
            <p>
              Il titolare del trattamento dei dati personali &egrave;:
            </p>
            <address className="not-italic bg-slate-50 rounded-xl p-5 text-sm leading-relaxed mt-3">
              <strong className="text-slate-900">Studio Tecnico Lombardo</strong><br />
              Geom. Lombardo Marco<br />
              Via Sant&apos;Antonio n. 5<br />
              22070 &mdash; Locate Varesino (CO)<br />
              Partita IVA: 03090650130<br />
              Email: <a href="mailto:info@impresius.com" className="text-blue-600 hover:underline">info@impresius.com</a>
            </address>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Dati Raccolti</h2>
            <p>
              Raccogliamo le seguenti categorie di dati personali:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Dati di registrazione:</strong> nome, cognome, indirizzo email, password (cifrata).
              </li>
              <li>
                <strong>Dati di utilizzo:</strong> informazioni relative all&apos;utilizzo della piattaforma, pagine visitate, funzionalit&agrave; utilizzate.
              </li>
              <li>
                <strong>Dati di pagamento:</strong> gestiti interamente da Stripe Inc. in qualit&agrave; di responsabile del trattamento. Non memorizziamo dati di carte di credito sui nostri server.
              </li>
              <li>
                <strong>Dati tecnici:</strong> indirizzo IP, tipo di browser, sistema operativo, dati di log.
              </li>
              <li>
                <strong>Dati dei progetti:</strong> informazioni inserite dall&apos;utente relative a operazioni immobiliari, computi metrici, stime di valore e altri dati di progetto.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Finalit&agrave; del Trattamento</h2>
            <p>I dati personali sono trattati per le seguenti finalit&agrave;:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Fornitura e gestione del servizio Impresius.</li>
              <li>Creazione e gestione dell&apos;account utente.</li>
              <li>Elaborazione dei pagamenti e gestione degli abbonamenti.</li>
              <li>Comunicazioni relative al servizio (aggiornamenti, assistenza, notifiche tecniche).</li>
              <li>Miglioramento e ottimizzazione della piattaforma.</li>
              <li>Adempimento di obblighi legali e fiscali.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Base Giuridica del Trattamento</h2>
            <p>Il trattamento dei dati si basa su:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Esecuzione del contratto</strong> (Art. 6, par. 1, lett. b GDPR): per fornire il servizio richiesto.
              </li>
              <li>
                <strong>Consenso</strong> (Art. 6, par. 1, lett. a GDPR): per l&apos;invio di comunicazioni promozionali, ove applicabile.
              </li>
              <li>
                <strong>Legittimo interesse</strong> (Art. 6, par. 1, lett. f GDPR): per migliorare il servizio e garantirne la sicurezza.
              </li>
              <li>
                <strong>Obbligo legale</strong> (Art. 6, par. 1, lett. c GDPR): per adempiere a obblighi fiscali e normativi.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Conservazione dei Dati</h2>
            <p>
              I dati personali sono conservati per il tempo strettamente necessario al perseguimento delle
              finalit&agrave; per cui sono stati raccolti. In particolare:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>I dati dell&apos;account vengono conservati per tutta la durata del rapporto contrattuale e per 12 mesi dalla cancellazione dell&apos;account.</li>
              <li>I dati di fatturazione vengono conservati per 10 anni come previsto dalla normativa fiscale italiana.</li>
              <li>I dati tecnici (log) vengono conservati per un massimo di 6 mesi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Condivisione dei Dati</h2>
            <p>I dati possono essere condivisi con:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Supabase Inc.</strong> &mdash; hosting del database e autenticazione.
              </li>
              <li>
                <strong>Stripe Inc.</strong> &mdash; elaborazione dei pagamenti.
              </li>
              <li>
                <strong>Vercel Inc.</strong> &mdash; hosting dell&apos;applicazione web.
              </li>
            </ul>
            <p className="mt-3">
              Questi soggetti agiscono in qualit&agrave; di responsabili del trattamento ai sensi dell&apos;Art. 28 del GDPR.
              Non vendiamo, n&eacute; cediamo i tuoi dati personali a terzi per finalit&agrave; di marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Trasferimento dei Dati Extra-UE</h2>
            <p>
              Alcuni dei nostri fornitori di servizi (Supabase, Stripe, Vercel) possono trasferire i dati
              al di fuori dello Spazio Economico Europeo. Tali trasferimenti avvengono sulla base di
              adeguate garanzie previste dal GDPR, tra cui le Clausole Contrattuali Standard approvate
              dalla Commissione Europea e il Data Privacy Framework UE-USA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Diritti dell&apos;Interessato</h2>
            <p>Ai sensi degli articoli 15-22 del GDPR, hai il diritto di:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Accesso:</strong> ottenere conferma del trattamento e una copia dei tuoi dati.</li>
              <li><strong>Rettifica:</strong> richiedere la correzione di dati inesatti o incompleti.</li>
              <li><strong>Cancellazione:</strong> richiedere la cancellazione dei tuoi dati personali.</li>
              <li><strong>Limitazione:</strong> richiedere la limitazione del trattamento.</li>
              <li><strong>Portabilit&agrave;:</strong> ricevere i tuoi dati in un formato strutturato e leggibile da dispositivo automatico.</li>
              <li><strong>Opposizione:</strong> opporti al trattamento basato sul legittimo interesse.</li>
            </ul>
            <p className="mt-3">
              Per esercitare i tuoi diritti, contattaci all&apos;indirizzo{" "}
              <a href="mailto:info@impresius.com" className="text-blue-600 hover:underline">info@impresius.com</a>.
              Hai inoltre il diritto di presentare reclamo all&apos;Autorit&agrave; Garante per la Protezione dei Dati Personali
              (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.garanteprivacy.it</a>).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Sicurezza dei Dati</h2>
            <p>
              Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali, tra cui:
              crittografia dei dati in transito (TLS/SSL), hashing delle password, controllo degli
              accessi e backup regolari.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Modifiche alla Privacy Policy</h2>
            <p>
              Ci riserviamo il diritto di aggiornare questa informativa in qualsiasi momento. Le modifiche
              saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
              Ti invitiamo a consultare periodicamente questa pagina.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
