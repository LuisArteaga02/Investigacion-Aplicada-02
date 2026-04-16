import React, { useRef, useEffect, useMemo, memo } from 'react';
import { useGLTF } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import { DeviceMotion } from 'expo-sensors';

// IMPORTANTE: Hemos eliminado 'DynamicDashboard', 'DataCard' y 'Screen'

// Componente del Modelo Base (DK) - Mantiene su lógica de rotación
const DKModel = memo(function DKModel({ sensorRotation }) {
  // Carga tu modelo base aquí
  const { scene } = useGLTF(require('../assets/dk.glb'));
  const meshRef = useRef();

  const clonedScene = useMemo(() => {
    if (!scene) return null;
    return scene.clone(true);
  }, [scene]);

  useFrame(() => {
    if (meshRef.current) {
      // Aplicar rotación suave basada en el giroscopio
      const objetivoX = sensorRotation.current.beta - Math.PI / 2;
      const objetivoY = sensorRotation.current.gamma;

      meshRef.current.rotation.x += (objetivoX - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (objetivoY - meshRef.current.rotation.y) * 0.1;
    }
  });

  return clonedScene ? (
    <primitive
      ref={meshRef}
      object={clonedScene}
      scale={0.09} // Ajusta la escala según tu modelo
      position={[0, -1.5, 0]} // Posición en la escena 3D
    />
  ) : null;
});

// Componente Principal: Ya no recibe 'sensorData' porque los datos son 2D nativos
export default function Modelo3D() {
  const sensorRotation = useRef({ beta: 0, gamma: 0 });
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Suscripción al sensor de movimiento
    if (subscriptionRef.current === null) {
      subscriptionRef.current = DeviceMotion.addListener((data) => {
        if (data.rotation) {
          sensorRotation.current.beta = data.rotation.beta;
          sensorRotation.current.gamma = data.rotation.gamma;
        }
      });
    }

    return () => {
      // Limpieza de la suscripción al desmontar
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <DKModel sensorRotation={sensorRotation} />
    </>
  );
}