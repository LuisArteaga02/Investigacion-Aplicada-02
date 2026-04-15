import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import { DeviceMotion } from 'expo-sensors';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// Texto 3D
function ScreenData ({ sensorRotation, sensorData }) {
  const meshRef = useRef();

  // Carga la fuente
  const font = useMemo(() => {
    const loader = new FontLoader();
    return loader.parse(require('../assets/FiraSansRegular.json'));
  }, []);

  // Crea text geometry
  const textGeometry = useMemo(() => {
    if (!font) return null;

    // Texto a mostrar
    const datos = `
      SISTEMA IoT UDB
      Temperatura: ${sensorData?.temperatura ?? '--'}°C
      Humedad: ${sensorData?.humedad ?? '--'}%
      Ubicación: ${sensorData?.ubicacion ?? 'Unknown'}
    `;

    return new TextGeometry(datos, {
      font,
      size: 0.05,
      depth: 0.01,
      curveSegments: 12,
      bevelEnabled: false,
    });
  }, [font, sensorData]);

  useFrame(() => {
    if (meshRef.current) {
      const objetivoX = sensorRotation.current.beta - Math.PI / 2;
      const objetivoY = sensorRotation.current.gamma;

      meshRef.current.rotation.x += (objetivoX - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (objetivoY - meshRef.current.rotation.y) * 0.1;
    }
  });

  return textGeometry ? (
    <mesh ref={meshRef} geometry={textGeometry} position={[-0.5, 0.5, 1.6]}>
      <meshBasicMaterial attach="material" color="white" />
    </mesh>
  ) : null;
}

// Modelo DK
function DKModel({ sensorRotation }) {
  const { scene } = useGLTF(require('../assets/dk.glb'));
  const meshRef = useRef();

  // Memoizar la escena clonada para evitar garbage-collect
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    // Fijar todas las texturas para evitar el error de pixelStorei
    cloned.traverse((child) => {
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => fixTextureWrapping(mat));
        } else {
          fixTextureWrapping(child.material);
        }
      }
    });
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
}

// Modelo de pantalla
function ScreenModel({ sensorRotation }) {
  const { scene } = useGLTF(require('../assets/screen.glb'));
  const meshRef = useRef();

  // Memoizar la escena clonada para evitar garbage-collect
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    // Fijar todas las texturas para evitar el error de pixelStorei
    cloned.traverse((child) => {
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => fixTextureWrapping(mat));
        } else {
          fixTextureWrapping(child.material);
        }
      }
    });
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
      scale={1.5}
      position={[0, 0, 1]}
    />
  ) : null;
}

// Función auxiliar para fijar los parámetros de textura que Expo no soporta
function fixTextureWrapping(material) {
  if (!material) return;

  // Fijar los modos de wrapping a valores que Expo soporta
  if (material.map) {
    material.map.wrapS = 1000; // THREE.ClampToEdgeWrapping
    material.map.wrapT = 1000; // THREE.ClampToEdgeWrapping
  }
  if (material.normalMap) {
    material.normalMap.wrapS = 1000;
    material.normalMap.wrapT = 1000;
  }
  if (material.metalnessMap) {
    material.metalnessMap.wrapS = 1000;
    material.metalnessMap.wrapT = 1000;
  }
  if (material.roughnessMap) {
    material.roughnessMap.wrapS = 1000;
    material.roughnessMap.wrapT = 1000;
  }
}

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
      <ScreenModel sensorRotation={sensorRotation} />
      <ScreenData sensorData={sensorData} sensorRotation={sensorRotation} />
    </>
  );
}