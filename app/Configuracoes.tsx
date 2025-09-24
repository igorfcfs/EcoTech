import { useTheme } from '@/contexts/ThemeContext';
import { getGeneralStyles } from '@/styles/general';
import { StackScreenProps } from '@/types/navigation';
import React from 'react';
import { Alert, FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../api';
import { auth } from '../firebaseConfig';

const user = auth.currentUser;

type Props = StackScreenProps<"Configurações">;

export default function Configuracoes({navigation}: Props) {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = getGeneralStyles(colors);

  // Define se o tema atual é dark
  const isDark = theme === 'dark';

  const deleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${user?.uid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error("Erro ao deletar conta");

      Alert.alert("Conta excluída", "Sua conta foi removida com sucesso.", [
        { text: "OK", onPress: () => navigation.replace("Login") }
      ]);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível excluir sua conta. Tente novamente.");
      console.error(err);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Deletar conta",
      "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, excluir", style: "destructive", onPress: deleteAccount },
      ]
    );
  };

  // Itens da lista de configurações
  const settings = [
    { id: '1', title: 'Tema escuro', type: 'switch', action: toggleTheme },
    // { id: '2', title: 'Notificações', type: 'switch', value: true, action: () => {} },
    { id: '3', title: 'Sobre o App', type: 'link', action: () => {} },
    { id: '4', title: 'Política de Privacidade', type: 'link', action: () => {} },
    { id: '5', title: 'Termos de Serviço', type: 'link', action: () => {} },
    { id: '6', title: 'Deletar Conta', type: 'link', action: confirmDelete, isDestructive: true },
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
