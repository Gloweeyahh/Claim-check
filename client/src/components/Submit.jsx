import { useState } from 'react';
import { extractFromUrl } from '../lib/api.js';

export default function Submit({ mode, onBack, onManualDone, onLinkResolved }) {
  const [claimText, setClaimText] = useState('');
  const [url, setUrl] = useState('');
  const [manualError, setManualError] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [loading, setLoading] = useState(false);

  function submitManual() {
    const v = claimText.trim();
    if (!v) {
      setManualError(true);
      return;
    }
    setManualError(false);
    onManualDone(v);
  }

  async function submitLink() {
    const v = url.trim();
    if (!v) {
      setLinkError('Enter a link before continuing.');
      return;
    }
    setLinkError('');
    setLoading(true);
    try {
      const result = await extractFromUrl(v);
      onLinkResolved(result);
    } catch (err) {
      onLinkResolved({ available: false, reason: 'request-failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="view-enter">
      <h2>{mode === 'link' ? 'Check a link' : 'Enter a claim'}</h2>

      {mode === 'manual' && (
        <div>
          <div className="field">
            <label htmlFor="claim-text">What health claim do you want to verify?</label>
            <textarea
              id="claim-text"
              placeholder="e.g. Drinking lemon water every morning removes toxins from the body."
              value={claimText}
              onChange={(e) => { setClaimText(e.target.value); setManualError(false); }}
            />
            {manualError && <div className="error-text">Enter a claim before continuing.</div>}
          </div>
          <button className="btn btn-primary" onClick={submitManual}>Continue</button>
        </div>
      )}

      {mode === 'link' && (
        <div>
          <div className="field">
            <label htmlFor="claim-url">Paste a public URL</label>
            <input
              type="text"
              id="claim-url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setLinkError(''); }}
            />
            {linkError && <div className="error-text">{linkError}</div>}
          </div>
          <button className="btn btn-primary" onClick={submitLink} disabled={loading}>
            {loading ? 'Checking link…' : 'Check claim'}
          </button>
          <p style={{ marginTop: 16, fontSize: 13.5 }}>
            Supported: general public webpages and YouTube videos. Facebook and Instagram links
            will show a fallback below — neither platform offers a scraping API without formal
            research approval.
          </p>
        </div>
      )}

      <button className="btn btn-ghost" onClick={onBack}>← Back</button>
    </section>
  );
}
