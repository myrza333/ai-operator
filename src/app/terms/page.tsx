import scss from "../privacy/legal.module.scss";

// Публичная страница (без AuthGuard): ссылка из сайдбара и
// поле "Terms of service link" на странице Branding в Google Cloud.
const page = () => {
  return (
    <div className={scss.page}>
      <div className={scss.doc}>
        <p className={scss.label}>Legal</p>
        <h1>Terms of Service</h1>
        <p className={scss.updated}>Last updated: September 21, 2026</p>

        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of AI
          Operator (&quot;the app&quot;, &quot;we&quot;, &quot;us&quot;). By
          creating an account or using the app, you agree to these Terms.
        </p>

        <h2>1. The service</h2>
        <p>
          AI Operator is a personal productivity assistant that lets you view
          and manage Gmail, Google Calendar and Google Drive, keep notes, and
          use an AI chat that can take actions on your behalf inside the app
          (such as creating notes, calendar events, or sending email) when
          you ask it to.
        </p>

        <h2>2. Your account</h2>
        <ul>
          <li>You must provide accurate information when registering, and
            keep your login credentials confidential.</li>
          <li>You are responsible for all activity that happens under your
            account.</li>
          <li>You may connect and disconnect your Google account at any
            time.</li>
        </ul>

        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the app for any unlawful purpose, or to send spam, phishing
            or abusive email through the Gmail integration.</li>
          <li>Attempt to gain unauthorized access to other users&apos;
            accounts or data.</li>
          <li>Reverse-engineer, disrupt, or overload the app or its
            infrastructure.</li>
        </ul>

        <h2>4. AI chat and automated actions</h2>
        <p>
          The AI chat can perform real, sometimes irreversible actions on
          your behalf when you ask it to — for example sending an email,
          creating a calendar event, or editing a note. You are responsible
          for reviewing what you ask the assistant to do. We are not liable
          for actions the assistant takes that accurately reflect your
          request, including messages sent from your Gmail account.
        </p>

        <h2>5. Third-party services</h2>
        <p>
          Gmail, Google Calendar, Google Drive and Google Sign-In are
          provided by Google, and the AI chat is powered by Google&apos;s
          Gemini API. Your use of these features is also subject to
          Google&apos;s own terms of service. We are not responsible for the
          availability or behavior of these third-party services.
        </p>

        <h2>6. Service availability</h2>
        <p>
          AI Operator is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis, without warranties of any kind, express or
          implied. We do not guarantee that the app will be uninterrupted,
          error-free, or available at all times, and we may modify, suspend
          or discontinue any part of the service at any time.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, AI Operator and its
          creator shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of the app, including
          loss of data or unintended actions taken through the AI chat.
        </p>

        <h2>8. Termination</h2>
        <p>
          You may stop using the app and delete your account at any time by
          contacting us. We may suspend or terminate accounts that violate
          these Terms.
        </p>

        <h2>9. Changes to these Terms</h2>
        <p>
          We may update these Terms as the app evolves. Continued use of the
          app after changes take effect means you accept the updated Terms.
        </p>

        <h2>10. Contact us</h2>
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:itdev1488@gmail.com">itdev1488@gmail.com</a>.
        </p>
      </div>
    </div>
  );
};

export default page;
