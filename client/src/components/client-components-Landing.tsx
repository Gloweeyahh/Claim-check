export default function Landing({ onStart }) {
  return (
    <section className="view-enter">
      <h1>Before you believe it.<br />Before you share it.<br />CLAIMCHECK it.</h1>
      <p className="lede">Check health claims you encounter online using a simple, evidence-based verification process.</p>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onStart}>Check a claim</button>
      </div>
      <hr className="divider" />
      <div className="method-strip">
        <span>Pause</span><span className="dot">→</span>
        <span>Identify</span><span className="dot">→</span>
        <span>Check</span><span className="dot">→</span>
        <span>Verify</span><span className="dot">→</span>
        <span>Decide</span>
      </div>
    </section>
  );
}
