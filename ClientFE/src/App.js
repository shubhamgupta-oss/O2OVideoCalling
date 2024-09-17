import {Route, Routes} from 'react-router-dom';
import './App.css';
import LobbyScreen from './Screens/Lobby';
import RoomScreen from './Screens/Room'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route  path='/' element={<LobbyScreen />} /> 
        <Route  path='/room/:id' element={<RoomScreen />} /> 
      </Routes>
    </div>
  );
}

export default App;
