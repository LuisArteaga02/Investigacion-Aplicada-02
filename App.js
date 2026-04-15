import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import Modelo3D from './components/modelo3d';

export default function App() {
  const [sensorData, setSensorData] = useState({
    temperatura: "0",
    humedad: "0",
    ubicacion: "Cargando..."
  });

  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch('https://69ddd128410caa3d47ba03eb.mockapi.io/sensor/1');
      const json = await response.json();
      
      // LOG DETALLADO: Muestra la info exacta de la API en la terminal
      console.log(">>> [API RESPONSE]:", json);

      setSensorData({
        temperatura: json.temperatura,
        humedad: json.humedad,
        ubicacion: json.ubicacion
      });
    } catch (e) { 
      console.log(">>> [API ERROR]:", e); 
    }
  }, []);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, [fetchSensorData]);

  return (
    <View style={styles.container}>
      {/* PANEL HUD: Ajustado para ser más alargado y arriba */}
      <View style={styles.arPanel}>
        <Text style={styles.panelTitle}>SISTEMA IoT UDB</Text>
        
        <View style={styles.row}>
          <Text style={styles.dataLabel}>TEMPERATURA:</Text>
          <Text style={styles.dataValue}>{sensorData.temperatura}°C</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.dataLabel}>HUMEDAD:</Text>
          <Text style={styles.dataValue}>{sensorData.humedad}%</Text>
        </View>

        <Text style={styles.locationText}>{sensorData.ubicacion}</Text>
        
        <TouchableOpacity style={styles.button} onPress={fetchSensorData}>
          <Text style={styles.btnText}>ACTUALIZAR</Text>
        </TouchableOpacity>
      </View>

      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[0, -1.5, 0]} color="white" />
        <Suspense fallback={null}>
          <Modelo3D sensorData={sensorData} />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  arPanel: {
    position: 'absolute',
    top: '5%', // Más arriba para liberar al modelo
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10, // Menos relleno vertical para que sea alargado
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.4)',
    zIndex: 10,
    width: '85%',
  },
  panelTitle: { color: '#00ffcc', fontWeight: 'bold', textAlign: 'center', marginBottom: 8, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dataLabel: { color: '#aaa', fontSize: 13 },
  dataValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  locationText: { color: '#fff', fontSize: 11, textAlign: 'center', marginTop: 5, opacity: 0.6, fontStyle: 'italic' },
  button: { backgroundColor: '#3498db', padding: 10, borderRadius: 8, marginTop: 10 },
  btnText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 12 }
}); 