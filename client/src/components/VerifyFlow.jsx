import { useState, useEffect } from 'react';
import { checklist } from '../data/checklist.js';
import { redFlagPatterns } from '../data/redFlagPatterns.js';
import { verifyClaim } from '../lib/api.js';

const STAGES = ['pause', 'identify', 'check', 'verify', 'decide'];

export default function VerifyFlow({ claim, source, sourceDetail, onRestart }) {
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Fetch the real assessment once, the first time the user reaches Verify.
  // Both the Verify and Decide stages read from the same fetched result.
  useEffect(() => {
    if (STAGES[stage] === 'verify' && !result && !loading) {
      setLoading(true);
      setError(false);
      verifyClaim(claim)
        .then((data) => {
          if (data.error) {
            setError(true);
          } else {
            setResult(data);
          }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [stage, claim, result, loading]);

  function next() {
    if (stage === STAGES.length - 1) {
      onRestart();
      return;
    }
    setStage((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    if (stage === 0) {
      onRestart();
      return;
    }
    setStage((s) => s - 1);
  }

  return (
    <section className="view-enter">
      <div className="steps-nav">
        {STAGES.map((_, i) => (
          <div key={i} className={`seg ${i < stage ? 'done' : i === stage ? 'current' : ''}`} />
        ))}
      </div>
      <div className="step-label">
        Step {stage + 1} of 5 — {STAGES[stage][0].toUpperCase() + STAGES[stage].slice(1)}
      </div>

      {STAGES[stage] === 'pause' && <PauseStage claim={claim} />}
      {STAGES[stage] === 'identify' && <IdentifyStage claim={claim} source={source} sourceDetail={sourceDetail} />}
      {STAGES[stage] === 'check' && <CheckStage />}
      {STAGES[stage] === 'verify' && <VerifyStage loading={loading} error={error} result={result} />}
      {STAGES[stage] === 'decide' && <DecideStage loading={loading} error={error} result={result} />}

      <button
        className="btn btn-primary"
        style={{ marginTop: 8 }}
        onClick={next}
        disabled={STAGES[stage] === 'verify' && loading}
      >
        {stage === STAGES.length - 1 ? 'Start a new check' : 'Continue'}
      </button>
      <button className="btn btn-ghost" onClick={back}>← Back</button>
    </section>
  );
}

function PauseStage({ claim }) {
  return (
    <div>
      <h2>Pause</h2>
      <p>
        Misleading health claims tend to lean on a handful of tricks to get a reaction before
        you've had time to think. Here's what to watch for — anything that shows up in your
        claim is marked below.
      </p>
      <ul className="flag-list">
        {redFlagPatterns.map((p, i) => {
          const isHit = p.re.test(claim);
          return (
            <li key={i}>
              <span className={`flag-icon ${isHit ? 'hit' : 'clear'}`}>{isHit ? '!' : '–'}</span>
              <span>
                <div className="flag-title">
                  {p.label}{' '}
                  {isHit && <span className="flag-tag">— found in this claim</span>}
                </div>
                <div className="flag-detail">{p.detail}</div>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function IdentifyStage({ claim, source, sourceDetail }) {
  return (
    <div>
      <h2>Identify</h2>
      <p>Breaking the claim down into its parts.</p>
      <div className="callout">
        <div className="kv"><b>Claim</b></div>
        <p style={{ marginBottom: 14 }}>{claim}</p>
        <div className="kv"><b>Source</b></div>
        <p style={{ marginBottom: 0 }}>
          {source === 'link' ? `A public webpage (${sourceDetail})` : 'Entered manually by the user'}
        </p>
      </div>
      <p style={{ fontSize: 14 }}>
        Questions worth asking yourself at this stage: what evidence is presented, is there a
        commercial or promotional interest, and what type of health claim is this?
      </p>
    </div>
  );
}

function CheckStage() {
  return (
    <div>
      <h2>Check</h2>
      <p>
        Read each question below and think honestly about the claim you entered. Tick a box
        whenever the answer raises doubt — the more boxes you tick, the more reason there is to
        question the claim before trusting or sharing it.
      </p>
      <div>
        {checklist.map((c, i) => (
          <div className="check-row" key={i}>
            <input type="checkbox" id={`chk${i}`} />
            <label htmlFor={`chk${i}`}>
              {c.t}
              <div className="sub">{c.s}</div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerifyStage({ loading, error, result }) {
  return (
    <div>
      <h2>Verify</h2>
      {loading && <p className="loading-note">Checking the claim against independent sources…</p>}
      {error && !loading && (
        <p className="loading-note">
          Something went wrong reaching the evidence sources. You can still continue to Decide,
          but the result may be marked unclear.
        </p>
      )}
      {!loading && !error && result && (
        <>
          {result.evidenceSummary && result.evidenceSummary.length > 0 ? (
            result.evidenceSummary.map((e, i) => (
              <div className="callout" key={i}>
                <div className="kv"><b>Source checked</b></div>
                <p style={{ marginBottom: 14 }}>{e.source}</p>
                <div className="kv"><b>What it says</b></div>
                <p style={{ marginBottom: 14 }}>{e.whatItSays}</p>
                <div className="kv"><b>How this relates to the claim</b></div>
                <p style={{ marginBottom: 0 }}>{e.howItRelates}</p>
              </div>
            ))
          ) : (
            <p>No independent sources came back with enough relevant information for this claim.</p>
          )}
        </>
      )}
    </div>
  );
}

function DecideStage({ loading, error, result }) {
  if (loading) {
    return (
      <div>
        <h2>Decide</h2>
        <p className="loading-note">Putting the assessment together…</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div>
        <h2>Decide</h2>
        <div className="advice-lead advice-unclear">
          <div className="advice-tag">Unclear / insufficient evidence</div>
          <div className="advice-title">Hold off on sharing this</div>
          <p className="advice-sub">We couldn't finish checking this claim — treat it as unverified for now.</p>
        </div>
      </div>
    );
  }

  const verdict = result.verdict || 'unclear';

  return (
    <div>
      <h2>Decide</h2>
      <div className={`advice-lead advice-${verdict}`}>
        <div className="advice-tag">
          {verdict === 'supported' && 'Supported'}
          {verdict === 'unclear' && 'Unclear / insufficient evidence'}
          {verdict === 'misleading' && 'Misleading / unsupported'}
        </div>
        <div className="advice-title">{result.headline}</div>
        <p className="advice-sub">{result.tagline}</p>
      </div>

      {result.why && result.why.length > 0 && (
        <>
          <div className="section-label">Why</div>
          <ul className="plain-list">
            {result.why.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </>
      )}

      {result.whatWeChecked && result.whatWeChecked.length > 0 && (
        <>
          <div className="section-label">What we checked</div>
          <ul className="plain-list">
            {result.whatWeChecked.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </>
      )}

      {result.sources && result.sources.length > 0 && (
        <>
          <div className="section-label">Sources</div>
          <ul className="plain-list">
            {result.sources.map((s, i) => (
              <li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.name}</a> : s.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
