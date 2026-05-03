// Shown while any /admin/* page is fetching. Sits in the layout's <main>,
// so the header + nav stay put and the user sees instant feedback that
// their click registered, even when DB queries take 200–500ms via Accelerate.
export default function AdminLoading() {
  return (
    <div className="adm-loading">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ncShimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .adm-loading {
          padding: 32px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .adm-loading-bar {
          height: 14px;
          border-radius: 4px;
          background: linear-gradient(90deg, rgba(227,199,104,0.10) 0%, rgba(227,199,104,0.28) 50%, rgba(227,199,104,0.10) 100%);
          background-size: 800px 100%;
          animation: ncShimmer 1.4s linear infinite;
          margin-bottom: 12px;
        }
        .adm-loading-row {
          height: 56px;
          border-radius: 8px;
          background: linear-gradient(90deg, rgba(154,53,32,0.06) 0%, rgba(154,53,32,0.14) 50%, rgba(154,53,32,0.06) 100%);
          background-size: 800px 100%;
          animation: ncShimmer 1.4s linear infinite;
          margin-bottom: 10px;
        }
      `}} />
      <div className="adm-loading-bar" style={{ width: '40%' }} />
      <div className="adm-loading-bar" style={{ width: '70%', height: 28, marginBottom: 28 }} />
      <div className="adm-loading-row" />
      <div className="adm-loading-row" />
      <div className="adm-loading-row" />
      <div className="adm-loading-row" />
      <div className="adm-loading-row" />
      <div className="adm-loading-row" />
    </div>
  );
}
