import React from 'react';
import { useGLTF } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import { DeviceMotion } from 'expo-sensors';

export default function Modelo3D(props) {
  const { scene } = useGLTF(require('../assets/modelo.glb'));
  
  // Usa React.useRef en lugar de solo useRef para evitar el error de "o is not a function"
  const meshRef = React.useRef();
  const movement = React.useRef({ beta: 0, gamma: 0 });

  React.useEffect(() => {
    DeviceMotion.setUpdateInterval(16); 
    const subscription = DeviceMotion.addListener((data) => {
      if (data.rotation) {
        movement.current.beta = data.rotation.beta;
        movement.current.gamma = data.rotation.gamma;
      }
    });
    return () => subscription.remove();
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = movement.current.beta;
      meshRef.current.rotation.y = movement.current.gamma;
    }
  });

  return (
    <primitive 
      ref={meshRef} 
      object={scene} 
      scale={props.escala || 0.5} 
      position={props.posicion || [0, -1, 1]}
    />
  );
}