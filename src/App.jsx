// src/App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import CharacterSelect from './components/CharacterSelect';
import GameArea from './components/GameArea';
import Inventory from './components/Inventory';

const App = () => {
    return (
        <div>
            <Navbar />
            <CharacterSelect />
            <GameArea />
            <Inventory />
        </div>
    );
};

export default App;
