import { Route, Routes } from 'react-router-dom';
import './App.css'
import Login from './Components/Login/Login';
import Signup from './Components/Signup/Signup';
import Home from './Components/Home';


function App() {
  return (
    <div className= "App">
      <Routes>
        {/* <Route path = '/' element={<Navigate to='/login' />} /> */}
        <Route path = '/login' element={<Login />} />
        <Route path = '/signup' element={<Signup />} />
        <Route path = '/home' element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
