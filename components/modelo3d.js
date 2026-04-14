import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import { DeviceMotion } from 'expo-sensors';

export default function Modelo3D() {
  const { scene } = useGLTF(require('../assets/modelo.glb'));
  const meshRef = useRef();
  
  // Guardamos la rotación actual del teléfono
  const sensorRotation = useRef({ beta: 0, gamma: 0 });

  useEffect(() => {
    // Escuchamos el sensor cada 16ms (aprox 60 cuadros por segundo)
    const subscription = DeviceMotion.addListener((data) => {
      if (data.rotation) {
        sensorRotation.current.beta = data.rotation.beta;
        sensorRotation.current.gamma = data.rotation.gamma;
      }
    });
    return () => subscription.remove();
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      // PUNTO CERO: Teléfono a 90 grados (vertical)
      const objetivoX = sensorRotation.current.beta - Math.PI / 2;
      const objetivoY = sensorRotation.current.gamma;

      // MOVIMIENTO SUAVE (Lerp): 
      // El modelo se mueve un 10% (0.1) hacia el objetivo en cada frame.
      meshRef.current.rotation.x += (objetivoX - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (objetivoY - meshRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <primitive 
      ref={meshRef} 
      object={scene} 
      scale={0.09} // Tamaño ajustado para que no estorbe
      position={[0, -1.5, 0]} // Un poco más abajo del panel
    />
  );
}