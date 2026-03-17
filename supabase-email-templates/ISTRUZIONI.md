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

## Configurazione Redirect URL

Assicurati che nella sezione **Authentication** → **URL Configuration**:
- **Site URL**: `https://tuodominio.com` (il tuo dominio di produzione)
- **Redirect URLs**: aggiungi `https://tuodominio.com/api/auth/callback`

Questo è necessario affinché i link nelle email reindirizzino correttamente alla tua app.
