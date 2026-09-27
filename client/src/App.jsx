import { useState } from 'react';
import Landing from './components/Landing.jsx';
import Submit from './components/Submit.jsx';
import LinkFail from './components/LinkFail.jsx';
import Confirm from './components/Confirm.jsx';
import VerifyFlow from './components/VerifyFlow.jsx';

// view: 'landing' | 'submit' | 'linkfail' | 'confirm' | 'flow'
export default function App() {
  const [view, setView] = useState('landing');
  const [submitMode, setSubmitMode] = useState('manual');
  const [claim, setClaim] = useState('');
  const [source, setSource] = useState('manual');
  const [sourceDetail, setSourceDetail] = useState('');
  const [pendingUrlResult, setPendingUrlResult] = useState(null);

  function restart() {
    setClaim('');
    setSource('manual');
    setSourceDetail('');
    setPendingUrlResult(null);
    setView('landing');
  }

  function handleManualDone(text) {
    setClaim(text);
    setSource('manual');
    setSourceDetail('');
    setView('flow');
  }

  function handleLinkResolved(result) {
    if (!result.available) {
      setPendingUrlResult(result);
      setView('linkfail');
      return;
    }
    setClaim(result.claim);
    setSourceDetail(result.sourceDetail || '');
    setPendingUrlResult(null);
    setView('confirm');
  }

  return (
    <div className="wrap">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true"></div>
        <div className="brand-name">CLAIMCHECK</div>
      </div>

      {view === 'landing' && (
        <Landing
          onStartLink={() => { setSubmitMode('link'); setView('submit'); }}
          onStartManual={() => { setSubmitMode('manual'); setView('submit'); }}
        />
      )}

      {view === 'submit' && (
        <Submit
          mode={submitMode}
          onBack={() => setView('landing')}
          onManualDone={handleManualDone}
          onLinkResolved={handleLinkResolved}
        />
      )}

      {view === 'linkfail' && (
        <LinkFail
          onEnterManually={() => { setSubmitMode('manual'); setView('submit'); }}
          onBack={() => setView('submit')}
        />
      )}

      {view === 'confirm' && (
        <Confirm
          claim={claim}
          sourceDetail={sourceDetail}
          onYes={() => { setSource('link'); setView('flow'); }}
          onNo={() => { setSubmitMode('manual'); setView('submit'); }}
        />
      )}

      {view === 'flow' && (
        <VerifyFlow claim={claim} source={source} sourceDetail={sourceDetail} onRestart={restart} />
      )}
    </div>
  );
}
