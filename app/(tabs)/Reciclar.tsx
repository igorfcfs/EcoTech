import { useTheme } from '@/contexts/ThemeContext';
import { getGeneralStyles } from '@/styles/general';
import { StyleSheet, Text, View } from 'react-native';

export default function ReciclarScreen() {
  const { colors } = useTheme();
  const general = getGeneralStyles(colors);

  const styles = StyleSheet.create({
    instructionText: {
      fontSize: 18,
      textAlign: 'center',
      color: colors.primario,
      marginHorizontal: 20,
    },
  });

  return (
    <View style={[general.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={styles.instructionText}>
        Vá até a lixeira mais próxima e preencha seus dados
      </Text>
    </View>
  );
}
