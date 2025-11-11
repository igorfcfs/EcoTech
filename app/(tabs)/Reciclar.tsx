import { API_URL } from '@/api';
import { ModalInfo } from '@/components/CustomModal';
import Titulo from '@/components/Titulo';
import { useTheme } from '@/contexts/ThemeContext';
import { auth } from '@/firebaseConfig';
import { getGeneralStyles } from '@/styles/general';
import { StackScreenProps } from '@/types/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = StackScreenProps<'Reciclar'>;

export default function ReciclarScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const general = getGeneralStyles(colors);

  const [pontosAcumulados, setPontosAcumulados] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const abrirModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const abrirAvisoResgatar = () => {
    abrirModal(
      'Conversão indisponível',
      'A conversão de E-Coins em dinheiro ainda não está disponível. Esse recurso será liberado apenas quando o projeto for lançado.'
    );
  };

  const abrirAvisoAjuda = () => {
    abrirModal(
      'Como reciclar',
      'Para reciclar, leve seus resíduos aos ecopontos parceiros. Use a aba “Locais” para encontrar o ponto mais próximo.'
    );
  };

  const abrirAvisoVerMais = () => {
    abrirModal(
      'Lojas parceiras',
      'Ainda não temos lojas parceiras porque o projeto não foi lançado oficialmente. Isso será adicionado após a fase piloto.'
    );
  };

  // Busca analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const USER_URL = `${API_URL}/relatorio/${user.uid}`;
        const response = await axios.get(USER_URL);
        const analytics = response.data;

        setPontosAcumulados(analytics.pontos);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const cupons = [
    { id: '1', title: 'Cartão Presente Loja X' },
    { id: '2', title: 'Cartão Presente Loja Y' },
    { id: '3', title: 'Cartão Presente Loja Z' },
  ];

  const styles = StyleSheet.create({
    banner: {
      width: '100%',
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    bannerOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    coins: {
      fontSize: 38,
      fontWeight: '800',
      color: '#fff',
      marginTop: 8,
      textShadowColor: 'rgba(0,0,0,0.4)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginTop: -35,
      backgroundColor: colors.backCard,
      paddingVertical: 25,
      paddingHorizontal: 20,
      borderRadius: 20,
      elevation: 5,
    },
    action: {
      flex: 1,
      alignItems: 'center',
    },
    actionText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.titulo,
    },
    cuponsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 30,
    },
    verMais: {
      color: colors.secundario,
      fontWeight: '600',
      fontSize: 14,
    },
    cuponCard: {
      backgroundColor: colors.backCard,
      borderRadius: 20,
      padding: 16,
      marginRight: 16,
      width: 160,
      alignItems: 'center',
      elevation: 3,
    },
    cuponImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginBottom: 10,
    },
    cuponTitle: {
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.titulo,
      marginBottom: 4,
    },
    cuponValue: {
      fontSize: 13,
      color: colors.titulo,
    },
    dicasContainer: {
      backgroundColor: colors.backCard,
      marginHorizontal: 20,
      marginTop: 25,
      padding: 20,
      borderRadius: 20,
      elevation: 4,
    },
    dicasTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.titulo,
      marginBottom: 8,
    },
    dicaTexto: {
      fontSize: 14,
      color: colors.titulo,
      lineHeight: 20,
    },
    rodape: {
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 40,
      opacity: 0.6,
    },
    rodapeTexto: {
      fontSize: 12,
      color: colors.titulo,
    },
  });

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      {/* Banner */}
      <ImageBackground
        source={require('../../assets/bannerHome.png')}
        style={styles.banner}
        resizeMode="cover"
      >
        <View style={styles.bannerOverlay} />

        <Titulo text="E-coins disponíveis" style={{ color: '#fff' }} />

        {pontosAcumulados === null ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : (
          <Text style={styles.coins}>{pontosAcumulados.toFixed(2)}</Text>
        )}
      </ImageBackground>

      {/* Ações */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.action} onPress={abrirAvisoResgatar}>
          <Text style={styles.actionText}>Resgatar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() =>
            navigation.navigate('Rotas', {
              screen: 'Relatorio',
              params: { screen: 'Historico' },
            })
          }
        >
          <Text style={styles.actionText}>Histórico</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={abrirAvisoAjuda}>
          <Text style={styles.actionText}>Ajuda</Text>
        </TouchableOpacity>
      </View>

      {/* Cupons */}
      <View style={styles.cuponsHeader}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.titulo }}>
          Cupons disponíveis
        </Text>

        <TouchableOpacity onPress={abrirAvisoVerMais}>
          <Text style={styles.verMais}>Ver mais</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cupons}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 40 }}
        renderItem={({ item }) => (
          <View style={styles.cuponCard}>
            <Image
              source={require('../../assets/assistencia-tecnica-samsung.jpeg')}
              style={styles.cuponImage}
            />

            <Text style={styles.cuponTitle}>{item.title}</Text>

            {pontosAcumulados === null ? (
              <ActivityIndicator size="small" color={colors.secundario} />
            ) : (
              <Text style={styles.cuponValue}>
                {pontosAcumulados.toFixed(2)} / 600
              </Text>
            )}
          </View>
        )}
      />

      {/* Dicas */}
      <View style={styles.dicasContainer}>
        <Text style={styles.dicasTitle}>Dicas para ganhar mais E-coins 💡</Text>
        <Text style={styles.dicaTexto}>
          • Separe corretamente seus recicláveis antes de entregar.{'\n'}
          • Verifique os pontos de coleta parceiros mais próximos.{'\n'}
          • Recicle com frequência para acumular mais pontos.{'\n'}
          • A cada 1kg reciclado você ganha 3.2 E-Coins.{'\n'}
          • Cada ponto vale R$0,50 no resgate.
        </Text>
      </View>

      {/* Rodapé */}
      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>
          © 2025 EcoTech App — Todos os direitos reservados
        </Text>
      </View>

      {/* Modal */}
      <ModalInfo
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}
