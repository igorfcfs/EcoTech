import { useTheme } from '@/contexts/ThemeContext';
import { StackScreenProps } from '@/types/navigation';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../../../api';
import BotaoPrimario from '../../../components/BotaoPrimario';
import Input from '../../../components/Input';
import { auth, db } from '../../../firebaseConfig';

type Props = StackScreenProps<'EditarPerfil'>;

export default function EditarPerfil({ navigation }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('Usuário');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [massa, setMassa] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const { colors } = useTheme();
  const styles = StyleSheet.create({
    banner: {
      width: '100%',
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 0},
    header: { alignItems: 'center', marginBottom: 20 },
    avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
    campo: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: colors.branco, padding: 10, backgroundColor: colors.backgroundSecundario, borderRadius: 10 },
    editButton: {
      paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1,
      backgroundColor: colors.backCard
    },
    editText: { fontWeight: 'bold', color: colors.secundario },

    section: { marginBottom: 25, borderRadius: 100, padding: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.branco },

  });

  // Busca dados do usuário logado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.warn("Usuário não está logado");
      }
    });

    return () => unsubscribe();
  }, []);

  // Atualiza pontos e eletrônicos a cada 60s
  useEffect(() => {
    const fetchAnalytics = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const USER_URL = `${API_URL}/relatorio/${user.uid}`;
        const response = await axios.get(USER_URL);
        const analytics = response.data;

        setMassa(analytics.massa);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Atualiza a cada 10s

    return () => clearInterval(interval);
  }, []);

  const uploadImageAndSaveUrl = async (uri: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response_img = await fetch(uri); // baixa a imagem
      const blob = await response_img.blob(); // converte para blob

      const storage = getStorage();
      const filename = `gs://ecotrash-v2.firebasestorage.app/profile/${user.uid}/photo.jpg`;
      const imageRef = ref(storage, filename);

      await uploadBytes(imageRef, blob); // faz upload do blob pro Firebase
      const downloadURL = await getDownloadURL(imageRef); // pega a URL pública

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { fotoPerfil: downloadURL });

      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('🔥 Erro ao fazer upload da imagem:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
    }
  };

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasGalleryPermission(
        galleryStatus.status === 'granted' && cameraStatus.status === 'granted'
      );
    })();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setNome(data.nome || 'Usuário');
        setEmail(data.email || '');
        setTelefone(data.telefone || '');
        setCpf(data.cpf || '');
        setEndereco(data.endereco || '');
        setImageUri(data.fotoPerfil || null);
      }
    });

    return () => unsubscribe();
  }, []);

  const pickImageFromGallery = async () => {
    if (!hasGalleryPermission) {
      Alert.alert('Permissão necessária', 'Você precisa conceder permissão para acessar a galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      if (asset.uri) {
        console.log(asset.uri);
        setImageUri(asset.uri);
        await uploadImageAndSaveUrl(asset.uri);
      } else {
        console.warn('Imagem não possui URI válida:', asset);
      }
    }
  };

  const takePhoto = async () => {
    if (!hasGalleryPermission) {
      Alert.alert('Permissão necessária', 'Você precisa conceder permissão para usar a câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      if (asset.uri) {
        setImageUri(asset.uri);
        await uploadImageAndSaveUrl(asset.uri);
      } else {
        console.warn('Imagem não possui URI válida:', asset);
      }
    }
  };

  const changePhoto = () => {
    Alert.alert('Trocar foto', 'Escolha uma opção', [
      { text: 'Selecionar da galeria', onPress: pickImageFromGallery },
      { text: 'Tirar uma foto', onPress: takePhoto },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSalvarAlteracoes = async () => {
    if (userId) {
      try {
        await axios.put(`${API_URL}/users/${userId}`, {
          nome,
          email,
          telefone
        });
      Alert.alert('Sucesso', 'Alterações salvas com sucesso!');
        navigation.goBack();
      } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header - Foto + Nome + Editar */}
        <ImageBackground source={require('../../../assets/bannerHome.png')} style={styles.banner}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <Image source={require('../../../assets/default-avatar.png')} style={styles.avatar} />
          )}
          <TouchableOpacity style={styles.editButton} onPress={changePhoto}>
            <Text style={styles.editText}>EDITAR FOTO</Text>
          </TouchableOpacity>
        </ImageBackground>
        
        <View style={{marginVertical: 70, marginHorizontal: 15, gap: 15}}>
          <Input placeholder="Digite seu novo nome" value={nome} style={styles.campo} onChangeText={(newName) => setNome(newName)} />
          <Input placeholder="Digite seu novo email" value={email} style={styles.campo} onChangeText={(newEmail) => setEmail(newEmail)} />
          <Input placeholder="Digite seu novo telefone" value={telefone} style={styles.campo} onChangeText={(newPhone) => setTelefone(newPhone)} />
          <BotaoPrimario text={"SALVAR ALTERAÇÕES"} onPress={handleSalvarAlteracoes} style={{marginTop: 50}} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
