import React, { useRef, useEffect, useMemo, memo } from 'react';
import { useGLTF } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import { DeviceMotion } from 'expo-sensors';
import * as THREE from 'three';
import { Text3D } from '@react-three/drei/native';

// Texto 3D de datos del sensor
function ScreenData({ sensorData }) {
  const meshRef = useRef();
  // Texto a mostrar
  const datos = `
    SISTEMA IoT UDB
    Temperatura: ${sensorData?.temperatura ?? '--'}°C
    Humedad: ${sensorData?.humedad ?? '--'}%
    Ubicación: ${sensorData?.ubicacion ?? 'Unknown'}
  `;

  useEffect(() => {
    if (meshRef.current) {
      // Center the geometry so its origin is in the middle
      meshRef.current.geometry.center();
    }
  }, [sensorData]);

  return (
    <Text3D
      ref={meshRef}
      font={require('../assets/FiraSansRegular.json')}
      size={0.03}
      height={0.01} // Profundidad del texto
      curveSegments={12}
      bevelEnabled={false}
      position={[0, 0.2, 0.05]} // Relativo a la pantalla
    >
      {datos}
      <meshBasicMaterial color="cyan" />
    </Text3D>
  );
}

// Modelo de pantalla
const Screen = memo(function Screen({ sensorRotation, sensorData }) {
  const { scene } = useGLTF(require('../assets/screen.glb'));
  const screenRef = useRef();

  // Memoizar la escena clonada para evitar garbage-collect
  const clonedScreen = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    // Fijar todas las texturas para evitar el error de pixelStorei

    return cloned;
  }, [scene]);

  useFrame(() => {
    if (screenRef.current) {
      const objetivoX = sensorRotation.current.beta - Math.PI / 2;
      const objetivoY = sensorRotation.current.gamma;

      screenRef.current.rotation.x += (objetivoX - screenRef.current.rotation.x) * 0.1;
      screenRef.current.rotation.y += (objetivoY - screenRef.current.rotation.y) * 0.1;
    }
  });

  return clonedScreen ? (
    <group ref={screenRef} position={[0, 0.5, 0.5]} scale={3.5}>
      <primitive object={clonedScreen} />
      {/* Datos de sensor en la pantalla */}
      <ScreenData sensorData={sensorData} />
    </group>
  ) : null;
});

// Modelo DK
const DKModel = memo(function DKModel({ sensorRotation }) {
  const { scene } = useGLTF(require('../assets/dk.glb'));
  const meshRef = useRef();

  // Memoizar la escena clonada para evitar garbage-collect
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    // Fijar todas las texturas para evitar el error de pixelStorei

    return cloned;
  }, [scene]);

  useFrame(() => {
    if (meshRef.current) {
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
      scale={0.09}
      position={[0, -1.5, 0]}
    />
  ) : null;
});

export default function Modelo3D({ sensorData }) {
  const sensorRotation = useRef({ beta: 0, gamma: 0 });
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Configura el listener
    if (subscriptionRef.current === null) {
      subscriptionRef.current = DeviceMotion.addListener((data) => {
        if (data.rotation) {
          sensorRotation.current.beta = data.rotation.beta;
          sensorRotation.current.gamma = data.rotation.gamma;
        }
      });
    }

    return () => { };
  }, []); // Dependencias vacías aseguran que esto solo se ejecute una vez

  return (
    <>
      <DKModel sensorRotation={sensorRotation} />
      <Screen sensorData={sensorData} sensorRotation={sensorRotation} />
    </>
  );
}