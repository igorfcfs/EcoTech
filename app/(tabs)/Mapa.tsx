import { RootStackParamList } from '@/types/navigation';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';
import { API_URL } from '../../api';
import BotaoPrimario from '../../components/BotaoPrimario';
import CardLocais from '../../components/CardLocais';

type LocaisRouteProp = RouteProp<RootStackParamList, 'Locais'>;

interface Local {
  id: string;
  nome: string;
  endereco: string;
  imagem?: string;
  site?: string;
  coordenadas: { _latitude: number; _longitude: number };
}

export default function Mapa() {
  const route = useRoute<LocaisRouteProp>();
  const { destinoLatitude, destinoLongitude } = route.params || {};

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [selectedLocais, setSelectedLocais] = useState<Local | null>(null);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modalizeRef = useRef<Modalize>(null);
  const mapRef = useRef<MapView>(null);

  const fetchLocais = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/locais`);
      const locaisValidos: Local[] = (response.data || []).filter(
        (local: any) =>
          local?.coordenadas &&
          typeof local.coordenadas._latitude === 'number' &&
          typeof local.coordenadas._longitude === 'number'
      );
      setLocais(locaisValidos);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar locais:', err);
      setError('Erro ao carregar pontos de coleta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permissão de localização negada');
          setLoading(false);
          return;
        }
        setHasLocationPermission(true);

        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation(location.coords);

        await fetchLocais();
      } catch (err) {
        console.error('Erro na inicialização:', err);
        setError('Erro ao carregar o mapa');
      } finally {
        setLoading(false);
      }
    };

    initialize();
    const interval = setInterval(fetchLocais, 60000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!mapRef.current) return;

      const latitude = destinoLatitude ?? userLocation?.latitude ?? -23.5505;
      const longitude = destinoLongitude ?? userLocation?.longitude ?? -46.6333;

      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }, [destinoLatitude, destinoLongitude, userLocation])
  );

  const handleMarkerPress = (local: Local) => {
    setSelectedLocais(local);
    modalizeRef.current?.open();
  };

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    await fetchLocais();
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync();
      setUserLocation(location.coords);
    }
  };

  if (!hasLocationPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Precisamos da sua permissão para mostrar sua localização</Text>
        <BotaoPrimario text="Conceder Permissão" onPress={handleRetry} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <BotaoPrimario text="Tentar Novamente" onPress={handleRetry} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude ?? -23.5505,
          longitude: userLocation?.longitude ?? -46.6333,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
        loadingEnabled
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="Você está aqui" pinColor="red" zIndex={2} />
        )}
        {locais.map(local => (
          <Marker
            key={local.id}
            coordinate={{
              latitude: local.coordenadas._latitude,
              longitude: local.coordenadas._longitude,
            }}
            title={local.nome}
            description={local.endereco}
            onPress={() => handleMarkerPress(local)}
            pinColor="green"
          />
        ))}
      </MapView>

      <Modalize ref={modalizeRef} adjustToContentHeight modalStyle={styles.modal} handlePosition="inside">
        {selectedLocais && (
          <View style={styles.modalContent}>
            <CardLocais
              imageUri={selectedLocais.imagem || ''}
              nome={selectedLocais.nome}
              endereco={selectedLocais.endereco}
              localId={selectedLocais.id}
            />
          </View>
        )}
      </Modalize>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 10, color: '#1B5E20', fontSize: 16 },
  errorText: { color: '#d32f2f', marginBottom: 20, textAlign: 'center', fontSize: 16 },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#f5f5f5' },
  modalContent: { padding: 20, paddingBottom: 30 },
});
