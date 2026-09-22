import scss from "./legal.module.scss";

// Публичная страница (без AuthGuard): сюда ведёт ссылка из сайдбара и
// поле "Privacy policy link" на странице Branding в Google Cloud.
const page = () => {
  return (
    <div className={scss.page}>
      <div className={scss.doc}>
        <p className={scss.label}>Legal</p>
        <h1>Privacy Policy</h1>
        <p className={scss.updated}>Last updated: September 21, 2026</p>

        <p>
          AI Operator (&quot;we&quot;, &quot;us&quot;) is a personal
          productivity assistant that lets you manage Gmail, Google Calendar,
          Google Drive and notes from one app, with an AI chat that can act on
          your behalf. This policy explains what data we collect, why, and
          how you can control it.
        </p>

        <h2>1. Information we collect</h2>
        <ul>
          <li>
            <strong>Account information.</strong> Name, email address, and a
            profile picture — either provided by you when you register, or
            from your Google account when you sign in with Google.
          </li>
          <li>
            <strong>Google data (only if you connect your Google account).</strong>{" "}
            With your explicit consent (the Google sign-in permission
            screen), we access: your Gmail messages (to read, search, send,
            reply, forward, star and archive email on your behalf); your
            Google Calendar events; and your Google Drive files (to list,
            star and upload files).
          </li>
          <li>
            <strong>Content you create in the app.</strong> Notes, checklist
            items, and calendar events you create directly inside AI
            Operator, and the messages you exchange with the AI chat.
          </li>
          <li>
            <strong>Technical data.</strong> Basic request logs kept by our
            hosting providers for operating and securing the service.
          </li>
        </ul>

        <h2>2. How we use your information</h2>
        <ul>
          <li>To operate the core features of the app: showing your Gmail,
            Calendar and Drive, and letting you create notes and events.</li>
          <li>To power the AI chat: when you ask the assistant to do
            something (e.g. &quot;summarize my inbox&quot; or &quot;add this
            to my notes&quot;), the relevant text — such as email subjects and
            snippets, calendar events, or note content — is sent to
            Google&apos;s Gemini API to generate a response or decide which
            action to take. This happens only when you use the AI chat.</li>
          <li>To keep you signed in and secure your account (authentication
            tokens, password hashing).</li>
          <li>To send you a password-reset code if you request one.</li>
        </ul>

        <h2>3. What we don&apos;t do</h2>
        <ul>
          <li>We do not sell your personal data.</li>
          <li>We do not use your Gmail, Calendar or Drive data for
            advertising.</li>
          <li>We do not share your data with third parties except the
            service providers listed below, strictly to operate the app.</li>
        </ul>

        <h2>4. Third-party services we use</h2>
        <ul>
          <li>
            <strong>Google APIs</strong> (Sign-In, Gmail, Calendar, Drive) —
            to authenticate you and access the Google data you explicitly
            authorize. Our use of information received from Google APIs
            adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </li>
          <li>
            <strong>Google Gemini API</strong> — to generate the AI
            chat&apos;s replies and to decide which action to take, using the
            text of your request and, where relevant, the content it needs to
            act on.
          </li>
          <li>
            <strong>Hosting and database providers</strong> (Vercel, Render,
            Supabase) — to run the app and store your account data, notes and
            calendar events.
          </li>
        </ul>

        <h2>5. Data retention and deletion</h2>
        <p>
          We keep your account data for as long as your account exists. You
          can disconnect your Google account at any time from your Google
          Account settings, which revokes our access to Gmail, Calendar and
          Drive. To delete your account and associated data entirely, email
          us at{" "}
          <a href="mailto:itdev1488@gmail.com">itdev1488@gmail.com</a> and we
          will remove it.
        </p>

        <h2>6. Data security</h2>
        <p>
          Passwords are stored hashed, not in plain text. Access tokens are
          short-lived, and the connection between your browser and our
          servers uses HTTPS. No method of transmission or storage is 100%
          secure, and we cannot guarantee absolute security.
        </p>

        <h2>7. Children&apos;s privacy</h2>
        <p>
          AI Operator is not directed at children under 13, and we do not
          knowingly collect data from them.
        </p>

        <h2>8. Changes to this policy</h2>
        <p>
          We may update this policy as the app changes. If we make material
          changes, we will update the &quot;Last updated&quot; date above.
        </p>

        <h2>9. Contact us</h2>
        <p>
          Questions about this policy or your data? Email{" "}
          <a href="mailto:itdev1488@gmail.com">itdev1488@gmail.com</a>.
        </p>
      </div>
    </div>
  );
};

export default page;
