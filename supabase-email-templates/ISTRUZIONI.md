# Email Templates Impresius - Istruzioni per Supabase

## Come applicare i template

1. Vai su **Supabase Dashboard** → il tuo progetto
2. Naviga in **Authentication** → **Email Templates**
3. Per ogni tipo di email, copia il contenuto HTML del file corrispondente:

| Template Supabase     | File da copiare         |
|-----------------------|-------------------------|
| **Confirm signup**    | `confirm-signup.html`   |
| **Reset password**    | `reset-password.html`   |
| **Magic link**        | `magic-link.html`       |
| **Invite user**       | `invite-user.html`      |

4. Incolla il codice HTML nel campo **Body** del template
5. Aggiorna il campo **Subject** con:
   - Confirm signup: `Conferma il tuo account Impresius`
   - Reset password: `Reimposta la tua password - Impresius`
   - Magic link: `Il tuo link di accesso - Impresius`
   - Invite user: `Sei stato invitato su Impresius`
6. Clicca **Save** per ogni template

## IMPORTANTE: Configurazione URL

Nella sezione **Authentication** → **URL Configuration**:
- **Site URL**: `https://tuodominio.com` (il tuo dominio di produzione Vercel)

I template usano `{{ .SiteURL }}` per generare i link. Questo valore corrisponde al **Site URL** configurato sopra. I link nelle email puntano direttamente alla tua app (es. `https://tuodominio.com/auth/confirm?token_hash=...&type=...`) dove la route `/auth/confirm` verifica il token e reindirizza l'utente:
- **Conferma email** → Pagina di login con messaggio "Account confermato!"
- **Reset password** → Pagina "Nuova Password" (`/update-password`)
- **Magic link** → Dashboard
