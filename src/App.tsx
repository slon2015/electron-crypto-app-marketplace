import React from 'react';

import InstallButton from './components/install/component'
import Dashboard from './components/dashboard/component'
import './App.css';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  AppContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    justifyItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    alignItems: 'center',
  }
})

function App() {
  const styles = useStyles()

  return (
    <div className={styles.AppContainer}>
      <InstallButton/>
      <Dashboard/>
    </div>
  );
}

export default App;
