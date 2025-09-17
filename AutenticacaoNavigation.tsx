import { useTheme } from '@/contexts/ThemeContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native';
import Cadastro from './app/Cadastro';
import Login from './app/Login';
import { getGeneralStyles } from './styles/general';

const Tab = createMaterialTopTabNavigator();

export default function RelatorioNavigation() {
  const { colors } = useTheme();
  const general = getGeneralStyles(colors);
  
  return (
    <SafeAreaView style={general.tabBar}>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
          tabBarActiveTintColor: colors.negrito, // laranja do print (Estatísticas ativo)
          tabBarInactiveTintColor: colors.texto, // branco para os inativos
          tabBarIndicatorStyle: { backgroundColor: colors.negrito, height: 3 }, // roxo do sublinhado
         
          tabBarStyle: {
            backgroundColor: colors.branco,
            elevation: 0,
            marginHorizontal: 16, // margem nas laterais
            marginTop: 100,         // opcional, só pra dar respiro em cima
            borderRadius: 50,     // arredondamento
            overflow: 'hidden',   // garante que o conteúdo respeite o arredondamento
          },
        }}
      >
        <Tab.Screen name="Login" component={Login} />
        <Tab.Screen name="Cadastro" component={Cadastro} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
