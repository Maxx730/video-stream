import { Provider } from '@/components/ui/provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Root } from './pages/Root';
import { Login } from './layouts/Login';

import './App.css'

export const App = () => {
  return (
    <Provider>
      <Router>
        <Routes>
          <Route path="/" element={<Root screen={'main'}/>}/>
          <Route path="/channel/:channelName" element={<Root screen={'channel'}/>}/>
          <Route path="/login" element={<Root screen={'login'}/>}/>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
