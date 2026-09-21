// Публичная страница (без AuthGuard): ссылка из сайдбара и, позже,
// поле "Terms of service link" на странице Branding в Google Cloud.
const page = () => {
  return (
    <div style={{ maxWidth: 720, padding: "48px 24px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 16 }}>
        Terms of Service
      </h1>

      <p style={{ color: "gray" }}>The terms of service will be added soon.</p>
    </div>
  );
};

export default page;
