export default function Confirm({ claim, sourceDetail, onYes, onNo }) {
  return (
    <section className="view-enter">
      <h2>We found a possible health claim</h2>
      <div className="callout">
        <p className="quote">"{claim}"</p>
        <p className="kv">Source: {sourceDetail}</p>
      </div>
      <p>Is this the claim you want to verify?</p>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onYes}>Yes, verify this claim</button>
        <button className="btn btn-secondary" onClick={onNo}>No, enter the correct claim</button>
      </div>
    </section>
  );
}
