import { useTheme } from '@/contexts/ThemeContext';
import { getGeneralStyles } from '@/styles/general';
import { StackScreenProps } from '@/types/navigation';
import React from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type Props = StackScreenProps<"Configurações">;

export default function Configuracoes({}: Props) {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = getGeneralStyles(colors);

  // Define se o tema atual é dark
  const isDark = theme === 'dark';

  // Itens da lista de configurações
  const settings = [
    { id: '1', title: 'Tema escuro', type: 'switch', action: toggleTheme },
    { id: '2', title: 'Notificações', type: 'switch', value: true, action: () => {} },
    { id: '3', title: 'Sobre o App', type: 'link', action: () => {} },
  ];

  // Renderização de cada item
  const renderItem = ({ item }: any) => {
    if (item.type === 'switch') {
      const switchValue = item.id === '1' ? isDark : item.value;
      const onToggle = item.id === '1' ? toggleTheme : item.action;

      return (
        <View style={[customStyles.item, { backgroundColor: colors.backCard }]}>
          <Text style={[customStyles.itemText, { color: colors.branco }]}>{item.title}</Text>
          <Switch
            value={switchValue}
            onValueChange={onToggle}
            trackColor={{ false: '#767577', true: colors.primario }}
            thumbColor={switchValue ? colors.secundario : '#f4f3f4'}
          />
        </View>
      );
    }

    if (item.type === 'link') {
      return (
        <TouchableOpacity
          style={[customStyles.item, { backgroundColor: colors.backCard }]}
          onPress={item.action}
        >
          <Text style={[customStyles.itemText, { color: colors.branco }]}>{item.title}</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container3}>
      <FlatList
        data={settings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 20 }}
        extraData={theme} // Atualiza a lista quando o tema mudar
      />
    </View>
  );
}

// Estilos customizados para os itens
const customStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
});
