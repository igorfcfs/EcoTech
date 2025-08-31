import { useTheme } from '@/contexts/ThemeContext';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../api';

interface CardLocaisProps {
  imageUri: string;
  localId: string;
  nome: string;
  endereco: string;
  userId?: string | null;
}

const CardLocais = ({ imageUri, localId, nome, endereco, userId }: CardLocaisProps) => {
  const { colors } = useTheme(); // ✅ cores do tema atual

  const [qtdLixo, setQtdLixo] = useState<number | null>(null);
  const [qtdUserLixo, setQtdUserLixo] = useState<number | null>(null);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const resLocal = await axios.get(`${API_URL}/relatorio/lixo-reciclado/${localId}`);
        setQtdLixo(resLocal.data.massa);

        if (userId) {
          const resUser = await axios.get(`${API_URL}/relatorio/lixo-reciclado/${userId}/${localId}`);
          setQtdUserLixo(resUser.data.massa);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do lixo reciclado:', error);
      }
    };

    fetchDados();
  }, [localId, userId]);

  return (
    <View style={[styles.card, { borderColor: colors.primario, backgroundColor: colors.fundo }]}>
      <Image source={{ uri: imageUri }} resizeMode='cover' style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={[styles.nome, { color: colors.primario }]}>{nome}</Text>
        <Text style={[styles.endereco, { color: colors.secundario }]}>{endereco}</Text>
        <Text style={[styles.lixoReciclado, { color: colors.primario }]}>
          Total reciclado no local: {qtdLixo ?? '...'} g
        </Text>
        {userId && (
          <Text style={[styles.lixoRecicladoUsuario, { color: colors.primario }]}>
            Você reciclou aqui: {qtdUserLixo ?? '...'} g
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  endereco: {
    fontSize: 16,
    marginVertical: 4,
  },
  lixoReciclado: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lixoRecicladoUsuario: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default CardLocais;
