import { useTheme } from '@/contexts/ThemeContext';
import { RootStackParamList } from '@/types/navigation';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const CustomReciclarButton = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors } = useTheme(); // ✅ hook dentro do componente

  return (
    <TouchableOpacity
      style={styles.reciclarButtonContainer}
      onPress={() => navigation.navigate('Reciclar')} // navega para a tela 'Reciclar'
    >
      <View style={[styles.reciclarButton, { backgroundColor: colors.primario }]}>
        <Image
          source={require('../assets/ECoin.png')}
          style={styles.reciclarIcon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  reciclarButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reciclarButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 5,
    elevation: 5,
  },
  reciclarIcon: {
    width: 90,
    height: 90,
    borderRadius: 35,
    resizeMode: 'cover',
    marginBottom: 5,
  },
});

export default CustomReciclarButton;
