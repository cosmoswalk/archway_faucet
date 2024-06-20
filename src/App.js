import React, { useState, useEffect } from 'react';
import style from './css/windows.css';
import styles from './Keplr.module.css';
import Loader from './Loader.js';
import './Loader.css';
import WindowComponent from './Window.js';

function App() {
  const [showContent, setShowContent] = useState(false);

  const handleLoad = () => {
    setShowContent(true);
  };

  return (
    <div className="App">
      <Loader onLoad={handleLoad} />
      {showContent && <WindowComponent />}
    </div>
  );
}

export default App;

