import Titulo from '@/components/Titulo';
import { useTheme } from '@/contexts/ThemeContext';
import { getGeneralStyles } from '@/styles/general';
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReciclarScreen() {
  const { colors } = useTheme();
  const general = getGeneralStyles(colors);

  const cupons = [
    { id: '1', title: 'Cartão Presente Loja X', value: '400/600' },
    { id: '2', title: 'Cartão Presente Loja Y', value: '400/600' },
    { id: '3', title: 'Cartão Presente Loja Z', value: '400/600' },
  ];

  const styles = StyleSheet.create({
    banner: {
      width: '100%',
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    },
    bannerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 0,
    },
    coins: {
      fontSize: 36,
      fontWeight: '700',
      color: '#fff',
      marginTop: 4,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginTop: -30,
    },
    action: {
      flex: 1,
      backgroundColor: '#fff',
      paddingVertical: 12,
      marginHorizontal: 5,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#333',
    },
    cuponsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 20,
    },
    cuponCard: {
      backgroundColor: '#f5f5f5',
      borderRadius: 16,
      padding: 16,
      marginRight: 12,
      width: 180,
      height: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    cuponTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
      color: '#333',
    },
    cuponValue: {
      fontSize: 14,
      color: '#666',
    },
  });

  return (
    <View style={general.container3}>
      {/* Banner */}
      <ImageBackground
        source={require('../../assets/bannerHome.png')}
        style={styles.banner}
        resizeMode="cover"
      >
        <View style={styles.bannerOverlay} />
        <Titulo text="E-coins disponíveis" />
        <Text style={styles.coins}>400</Text>
      </ImageBackground>

      {/* Ações */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionText}>Resgatar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionText}>Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionText}>Ajuda</Text>
        </TouchableOpacity>
      </View>

      {/* Cupons */}
      <View style={styles.cuponsHeader}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>Cupons disponíveis</Text>
        <Text style={{ color: colors.secundario, fontWeight: '600' }}>Ver mais</Text>
      </View>

      <FlatList
        data={cupons}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12, paddingLeft: 20 }}
        renderItem={({ item }) => (
          <View style={styles.cuponCard}>
            <Text style={styles.cuponTitle}>{item.title}</Text>
            <Text style={styles.cuponValue}>{item.value}</Text>
          </View>
        )}
      />
    </View>
  );
}
