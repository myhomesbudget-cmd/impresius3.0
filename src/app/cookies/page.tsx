import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Impresius",
  description: "Informativa sull'utilizzo dei cookie di Impresius.",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen relative">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          Cookie Policy
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Ultimo aggiornamento: 18 marzo 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Cosa Sono i Cookie</h2>
            <p>
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando
              visiti un sito web. Sono ampiamente utilizzati per far funzionare i siti web in modo
              pi&ugrave; efficiente e per fornire informazioni ai proprietari del sito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Titolare del Trattamento</h2>
            <address className="not-italic bg-slate-50 rounded-xl p-5 text-sm leading-relaxed">
              <strong className="text-slate-900">Studio Tecnico Lombardo</strong><br />
              Geom. Lombardo Marco<br />
              Via Sant&apos;Antonio n. 5<br />
              22070 &mdash; Locate Varesino (CO)<br />
              Partita IVA: 03090650130<br />
              Email: <a href="mailto:info@impresius.com" className="text-blue-600 hover:underline">info@impresius.com</a>
            </address>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Cookie Utilizzati</h2>
            <p>La nostra piattaforma utilizza le seguenti tipologie di cookie:</p>

            <div className="mt-5 space-y-5">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Cookie Tecnici (Necessari)</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm mb-3">
                    Questi cookie sono essenziali per il funzionamento della piattaforma e non possono
                    essere disabilitati.
                  </p>
                  <div className="overflow-x-auto mobile-scroll-hint">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 font-medium text-slate-500">Cookie</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-500">Finalit&agrave;</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-500">Durata</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 px-3 font-mono text-xs text-slate-700">sb-*-auth-token</td>
                          <td className="py-2 px-3 text-slate-600">Autenticazione utente (Supabase)</td>
                          <td className="py-2 px-3 text-slate-600">Sessione</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 px-3 font-mono text-xs text-slate-700">sb-*-auth-token-code-verifier</td>
                          <td className="py-2 px-3 text-slate-600">Verifica PKCE per sicurezza login</td>
                          <td className="py-2 px-3 text-slate-600">Sessione</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Cookie di Terze Parti</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm mb-3">
                    I seguenti servizi di terze parti possono impostare propri cookie:
                  </p>
                  <div className="overflow-x-auto mobile-scroll-hint">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 font-medium text-slate-500">Servizio</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-500">Finalit&agrave;</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-500">Privacy Policy</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 px-3 font-medium text-slate-700">Stripe</td>
                          <td className="py-2 px-3 text-slate-600">Elaborazione pagamenti e prevenzione frodi</td>
                          <td className="py-2 px-3">
                            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">stripe.com/privacy</a>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 px-3 font-medium text-slate-700">Supabase</td>
                          <td className="py-2 px-3 text-slate-600">Autenticazione e gestione sessioni</td>
                          <td className="py-2 px-3">
                            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">supabase.com/privacy</a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Cookie non Utilizzati</h2>
            <p>
              La piattaforma Impresius <strong>non utilizza</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Cookie di profilazione pubblicitaria.</li>
              <li>Cookie di tracciamento per finalit&agrave; di marketing.</li>
              <li>Cookie di social media (Facebook, Google Analytics, ecc.).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Gestione dei Cookie</h2>
            <p>
              Puoi gestire le preferenze sui cookie attraverso le impostazioni del tuo browser.
              Di seguito le guide per i browser pi&ugrave; comuni:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a>
              </li>
              <li>
                <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a>
              </li>
              <li>
                <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apple Safari</a>
              </li>
              <li>
                <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a>
              </li>
            </ul>
            <p className="mt-3">
              <strong>Nota:</strong> la disabilitazione dei cookie tecnici potrebbe compromettere
              il funzionamento della piattaforma, in particolare l&apos;autenticazione e la gestione
              della sessione utente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Base Giuridica</h2>
            <p>
              I cookie tecnici sono installati sulla base del legittimo interesse del titolare a
              garantire il corretto funzionamento del Servizio (Art. 6, par. 1, lett. f GDPR),
              in conformit&agrave; con il Provvedimento del Garante Privacy n. 229 dell&apos;8 maggio 2014
              e successive modifiche.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Aggiornamenti</h2>
            <p>
              Questa Cookie Policy pu&ograve; essere aggiornata periodicamente. Le modifiche saranno
              pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contatti</h2>
            <p>
              Per qualsiasi domanda relativa all&apos;utilizzo dei cookie, contattaci all&apos;indirizzo{" "}
              <a href="mailto:info@impresius.com" className="text-blue-600 hover:underline">info@impresius.com</a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
