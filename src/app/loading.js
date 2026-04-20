export default function Loading() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ncSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(227,199,104,0.15)',
        zIndex: 9999,
        overflow: 'hidden',
      }}>
        <div style={{
          width: '40%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #E3C768, transparent)',
          boxShadow: '0 0 12px rgba(227,199,104,0.6)',
          animation: 'ncSlide 1.2s ease-in-out infinite',
        }} />
      </div>
    </>
  );
}
