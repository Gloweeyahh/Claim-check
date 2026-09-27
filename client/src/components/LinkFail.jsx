export default function LinkFail({ onEnterManually, onBack }) {
  return (
    <section className="view-enter">
      <h2>We couldn't access enough information from this link</h2>
      <p>
        This can happen with social platforms or pages that block automated retrieval.
        You can enter the claim yourself instead.
      </p>
      <button className="btn btn-primary" onClick={onEnterManually}>Enter claim manually</button>
      <button className="btn btn-ghost" onClick={onBack}>← Back</button>
    </section>
  );
}
