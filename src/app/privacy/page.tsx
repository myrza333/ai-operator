// Публичная страница (без AuthGuard): сюда ведёт ссылка из сайдбара и, позже,
// поле "Privacy policy link" на странице Branding в Google Cloud.
const page = () => {
  return (
    <div style={{ maxWidth: 720, padding: "48px 24px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 16 }}>
        Privacy Policy
      </h1>

      <p style={{ color: "gray" }}>The privacy policy will be added soon.</p>
    </div>
  );
};

export default page;
