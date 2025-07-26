import { Provider } from '@/components/ui/provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Root } from './pages/Root';
import { Token } from './pages/Token';

import './App.css'

export const App = () => {
  return (
    <Provider>
      <Router>
        <Routes>
          <Route path="/" element={<Root/>}/>
          <Route path="/channel/:channelName" element={<Root/>}/>
          <Route path="/token" element={<Token/>}/>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
