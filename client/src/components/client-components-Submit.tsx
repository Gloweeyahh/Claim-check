import { useState } from 'react';

export default function Submit({ onBack, onDone }) {
  const [claimText, setClaimText] = useState('');
  const [error, setError] = useState(false);

  function submit() {
    const v = claimText.trim();
    if (!v) {
      setError(true);
      return;
    }
    setError(false);
    onDone(v);
  }

  return (
    <section className="view-enter">
      <h2>Enter a claim</h2>
      <div className="field">
        <label htmlFor="claim-text">What health claim do you want to verify?</label>
        <textarea
          id="claim-text"
          placeholder="e.g. Drinking lemon water every morning removes toxins from the body."
          value={claimText}
          onChange={(e) => { setClaimText(e.target.value); setError(false); }}
        />
        {error && <div className="error-text">Enter a claim before continuing.</div>}
      </div>
      <button className="btn btn-primary" onClick={submit}>Continue</button>
      <button className="btn btn-ghost" onClick={onBack}>← Back</button>
    </section>
  );
}
