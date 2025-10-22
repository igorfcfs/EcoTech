import { useTheme } from '@/contexts/ThemeContext';
import { getGeneralStyles } from '@/styles/general';
import { StackScreenProps } from '@/types/navigation';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../api';
import { ModalError, ModalInfo, ModalSuccess } from '../components/CustomModal'; // ajuste caminho
import { auth } from '../firebaseConfig';

const user = auth.currentUser;

type Props = StackScreenProps<"Configurações">;

export default function Configuracoes({ navigation }: Props) {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = getGeneralStyles(colors);
  const isDark = theme === 'dark';

  // Estados dos modais
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // -----------------------------
  // Função para deletar conta
  // -----------------------------
  const deleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${user?.uid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error("Erro ao deletar conta");

      setSuccessMessage("Sua conta foi removida com sucesso.");
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setErrorMessage("Não foi possível excluir sua conta. Tente novamente.");
      setShowErrorModal(true);
    }
  };

  // -----------------------------
  // Abrir modal de confirmação
  // -----------------------------
  const confirmDelete = () => setShowConfirmDelete(true);

  const handleDeleteConfirmed = () => {
    setShowConfirmDelete(false);
    deleteAccount();
  };

  // -----------------------------
  // Lista de configurações
  // -----------------------------
  const settings = [
    { id: '1', title: 'Tema escuro', type: 'switch', action: toggleTheme },
    { id: '3', title: 'Sobre o App', type: 'link', action: () => {} },
    { id: '4', title: 'Política de Privacidade', type: 'link', action: () => {} },
    { id: '5', title: 'Termos de Serviço', type: 'link', action: () => {} },
    { id: '6', title: 'Deletar Conta', type: 'link', action: confirmDelete, isDestructive: true },
  ];

  // -----------------------------
  // Render de cada item
  // -----------------------------
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
          <Text
            style={[
              customStyles.itemText,
              { color: item.isDestructive ? '#f44336' : colors.branco },
            ]}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container3}>
      {/* ----------------- Modais ----------------- */}
      <ModalSuccess
        visible={showSuccessModal}
        title="Conta excluída"
        message={successMessage}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.replace("Login");
        }}
      />

      <ModalError
        visible={showErrorModal}
        title="Erro"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      <ModalInfo
        visible={showConfirmDelete}
        title="Deletar conta"
        message="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
        showConfirmButton={true}
        confirmText="Sim, deletar"
        confirmColor="#f44336"
        onConfirm={handleDeleteConfirmed}
        onClose={() => setShowConfirmDelete(false)}
      >
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <TouchableOpacity
            style={{ flex: 1, marginRight: 10, padding: 12, backgroundColor: '#ccc', borderRadius: 8 }}
            onPress={() => setShowConfirmDelete(false)}
          >
            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, marginLeft: 10, padding: 12, backgroundColor: '#f44336', borderRadius: 8 }}
            onPress={handleDeleteConfirmed}
          >
            <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Sim, excluir</Text>
          </TouchableOpacity>
        </View>
      </ModalInfo>

      {/* ----------------- Lista de Configurações ----------------- */}
      <FlatList
        data={settings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 20 }}
        extraData={theme} // atualiza a lista ao mudar o tema
      />
    </View>
  );
}

// ----------------- Estilos customizados -----------------
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
