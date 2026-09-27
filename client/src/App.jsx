import { useState } from 'react';
import Landing from './components/Landing.jsx';
import Submit from './components/Submit.jsx';
import VerifyFlow from './components/VerifyFlow.jsx';

// view: 'landing' | 'submit' | 'flow'
export default function App() {
  const [view, setView] = useState('landing');
  const [claim, setClaim] = useState('');

  function restart() {
    setClaim('');
    setView('landing');
  }

  function handleDone(text) {
    setClaim(text);
    setView('flow');
  }

  return (
    <div className="wrap">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true"></div>
        <div className="brand-name">CLAIMCHECK</div>
      </div>

      {view === 'landing' && <Landing onStart={() => setView('submit')} />}

      {view === 'submit' && (
        <Submit onBack={() => setView('landing')} onDone={handleDone} />
      )}

      {view === 'flow' && <VerifyFlow claim={claim} onRestart={restart} />}

    </div>
  );
}
