import { Provider } from '@/components/ui/provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { Player } from './pages/Player';

import { Token } from './pages/Token';

import './App.css'

export const App = () => {
  return (
    <Provider>
      <Router>
        <Routes>
          <Route path="/" element={<Player/>}/>
          <Route path="/token" element={<Token/>}/>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
