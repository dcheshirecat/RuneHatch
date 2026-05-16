import React, {useState} from 'react';
import MenuScreen from './screens/MenuScreen';
import MapScreen from './screens/MapScreen';

export default function App() {
  const [screen, setScreen] = useState('Menu');

  const navigation = {
    navigate: (name: string) => setScreen(name),
    goBack: () => setScreen('Menu'),
  };

  if (screen === 'Map') return <MapScreen navigation={navigation} />;
  return <MenuScreen navigation={navigation} />;
}
