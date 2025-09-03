import {
  BottomTabNavigationProp,
  BottomTabScreenProps as RNBottomTabScreenProps,
} from "@react-navigation/bottom-tabs";
import {
  MaterialTopTabNavigationProp,
  MaterialTopTabScreenProps,
} from "@react-navigation/material-top-tabs";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { DocumentData } from "firebase/firestore";

/**
 * ✅ STACK PRINCIPAL
 */
export type RootStackParamList = {
  Rotas: { userData: DocumentData } | undefined;
  Reciclar: undefined;
  Perfil: undefined;
  EditarPerfil: undefined;
  Login: undefined;
  Cadastro: undefined;
  Relatório: undefined; // aqui vai abrir o TopTabNavigator
  Home: undefined;
  Mapa: { destinoLatitude: number; destinoLongitude: number; localId: string };
  Local: { localId: string };
};

/**
 * ✅ BOTTOM TABS (se você tiver um TabNavigator embaixo)
 */
export type BottomTabParamList = {
  Início: undefined;
  Relatório: undefined;
  Perfil: undefined;
  Mapa: { destinoLatitude: number; destinoLongitude: number; localId: string };
};

/**
 * ✅ TOP TABS dentro de "Relatório"
 */
export type RelatorioTabParamList = {
  Estatísticas: undefined;
  Histórico: undefined;
};

/**
 * 🔹 TIPOS DE PROPS PRONTOS
 * (assim você importa só Props em cada tela, sem decorar nada)
 */

// Stack
export type StackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
export type StackNavProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;

// Bottom Tabs
export type AppBottomTabScreenProps<T extends keyof BottomTabParamList> =
  RNBottomTabScreenProps<BottomTabParamList, T>;
export type AppBottomTabNavProp<T extends keyof BottomTabParamList> =
  BottomTabNavigationProp<BottomTabParamList, T>;

// Top Tabs
export type RelatorioTabScreenProps<T extends keyof RelatorioTabParamList> =
  MaterialTopTabScreenProps<RelatorioTabParamList, T>;
export type RelatorioTabNavProp<T extends keyof RelatorioTabParamList> =
  MaterialTopTabNavigationProp<RelatorioTabParamList, T>;

