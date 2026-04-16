import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import Modelo3D from './components/modelo3d';

// Componente auxiliar para las tarjetas de datos 2D nativas
const DataCard2D = ({ label, value, unit, color }) => (
  <View style={[styles.card2D, { borderColor: color }]}>
    <Text style={styles.cardLabel2D}>{label}</Text>
    <View style={styles.cardValueRow2D}>
      <Text style={styles.cardValue2D}>{value}</Text>
      <Text style={styles.cardUnit2D}>{unit}</Text>
    </View>
  </View>
);

export default function App() {
  const [sensorData, setSensorData] = useState({
    temperatura: "0",
    humedad: "0",
    ubicacion: "Cargando..."
  });

  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=13.8422&longitude=-89.0969&current=temperature_2m,relative_humidity_2m&timezone=auto');
      const json = await response.json();
      
      console.log(">>> [API RESPONSE]:", json);

      setSensorData({
        temperatura: json.current.temperature_2m.toString(),
        humedad: json.current.relative_humidity_2m.toString(),
        ubicacion: "San Jose Guayabal, Cuscatlán"
      });
    } catch (e) { 
      console.log(">>> [API ERROR]:", e); 
    }
  }, []);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, [fetchSensorData]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Escena 3D (Fondo) */}
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[0, -1.5, 0]} color="white" />
        <Suspense fallback={null}>
          {/* Modelo3D ya no necesita sensorData */}
          <Modelo3D />
        </Suspense>
      </Canvas>

      {/* 2. Dashboard 2D Nativo (Superpuesto/Overlay) */}
      <View style={styles.dashboardOverlay}>
        <Text style={styles.mainTitle2D}>SISTEMA IoT UDB</Text>
        
        <View style={styles.dataGrid2D}>
          <DataCard2D 
            label="TEMPERATURA" 
            value={sensorData.temperatura} 
            unit="°C" 
            color="#ff4d4d" 
          />
          <DataCard2D 
            label="HUMEDAD" 
            value={sensorData.humedad} 
            unit="%" 
            color="#34c8db" 
          />
        </View>

        <View style={styles.locationPanel2D}>
          <Text style={styles.locationText2D}>📍 {sensorData.ubicacion}</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton2D} onPress={fetchSensorData}>
          <Text style={styles.refreshBtnText2D}>Actualizar datos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  // Estilos para el Overlay 2D
  dashboardOverlay: {
    position: 'absolute',
    top: 50, // Separación de la parte superior
    left: '5%',
    width: '90%',
    backgroundColor: 'rgba(10, 10, 10, 0.85)', // Fondo translúcido oscuro
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    alignItems: 'center',
    shadowColor: '#00d9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10, // Para Android
  },
  mainTitle2D: {
    color: '#00fbff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: '#00fbff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  dataGrid2D: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  // Estilos de las tarjetas 2D
  card2D: {
    width: '48%', // Dos columnas
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4, // Borde decorativo de color
  },
  cardLabel2D: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  cardValueRow2D: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue2D: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  cardUnit2D: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 4,
    opacity: 0.8,
  },
  locationPanel2D: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  locationText2D: {
    color: '#00ffcc',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  refreshButton2D: {
    backgroundColor: '#34c8db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  refreshBtnText2D: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});