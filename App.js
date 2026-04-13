import React, { Suspense } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, Environment } from '@react-three/drei/native';
import Modelos from './components/modelo3d';


export default function App() {
  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        {/* Iluminación manual profesional */}
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />

        <Suspense fallback={null}>
          <Modelos escala={0.1} />
 
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          makeDefault 
          minDistance={2} 
          maxDistance={10} 
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
