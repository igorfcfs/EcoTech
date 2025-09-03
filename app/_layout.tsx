import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { auth } from "../firebaseConfig";

// Screens
import Rotas from '../Rotas';
import EditarPerfil from './(tabs)/perfil/EditarPerfil';
import ReciclarScreen from "./(tabs)/Reciclar";
import Cadastro from './Cadastro';
import Configuracoes from './Configuracoes';
import Login from './Login';

// Contexto de Tema
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import Local from './(tabs)/locais/Local';

const Stack = createStackNavigator();

const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const { colors } = useTheme(); // pega as cores atuais do tema

  useEffect(() => {
    try {
      onAuthStateChanged(auth, _user => setUser(_user));
      if (auth) {
        console.log("✅ Firebase Auth conectado com sucesso!");
        setIsConnected(true);
      } else {
        console.log("❌ Firebase Auth não conectado!");
        setIsConnected(false);
      }
    } catch (error) {
      console.error("❌ Erro ao conectar ao Firebase Auth:", error);
      setIsConnected(false);
    }
  }, []);

  if (isConnected === null) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.text, { color: colors.titulo }]}>
          🔄 Verificando conexão com Firebase...
        </Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.titulo }]}>
          ❌ Erro ao conectar com Firebase Auth!
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name='Rotas' component={Rotas} />
          <Stack.Screen 
            name='Reciclar' 
            component={ReciclarScreen} 
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.secundario },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'Sua Carteira',
            }}
          />
          <Stack.Screen 
            name='EditarPerfil' 
            component={EditarPerfil} 
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.secundario },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'Editar Perfil',
            }}
          />
          <Stack.Screen 
            name='Configurações' 
            component={Configuracoes} 
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.secundario },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'Configurações',
            }}
          />
          <Stack.Screen 
            name='Local' 
            component={Local} 
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.secundario },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'Local',
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name='Login' component={Login} />
          <Stack.Screen name='Cadastro' component={Cadastro} />
          <Stack.Screen name='Rotas' component={Rotas} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
  errorText: { fontSize: 18, color: 'red' },
});
