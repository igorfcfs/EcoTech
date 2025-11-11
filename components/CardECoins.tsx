import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { metrics } from '../styles';

interface CardECoinsProps {
  descricao: string;
  quantidade: number | null;
  loading: boolean;
}

export default function CardECoins({ descricao, quantidade, loading }: CardECoinsProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.backCard }]}
      onPress={() => navigation.navigate('Reciclar')}
    >
      <Text style={[styles.cardTitle, { color: colors.titulo }]}>{descricao}</Text>
      <Image source={require('../assets/ECoin.png')} style={styles.coinImage} />

      {loading ? (
        <ActivityIndicator size="small" color={colors.secundario} />
      ) : (
        <Text style={[styles.cardValue, { color: colors.titulo }]}>
          {quantidade!.toFixed(2)}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '50%',
    height: '35%',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: metrics.smallMargin,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: '-15%',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  coinImage: {
    width: '40%',
    height: '40%',
    resizeMode: 'contain',
    marginVertical: 10,
  },
});
