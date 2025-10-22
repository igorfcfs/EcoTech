import Titulo from '@/components/Titulo';
import { useTheme } from '@/contexts/ThemeContext';
import { getGeneralStyles } from '@/styles/general';
import { StackScreenProps } from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { API_URL } from '../api';
import BotaoPrimario from '../components/BotaoPrimario';
import Input from '../components/Input';
import { auth, db } from '../firebaseConfig'; // Importando Firebase Authentication

type Props = StackScreenProps<'Cadastro'>;

export default function Cadastro({ navigation }: Props) { 
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [aceitou, setAceitou] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    const carregar = async () => {
      try {
        const valorSalvo = await AsyncStorage.getItem('@aceitou_termos');
        if (valorSalvo !== null) setAceitou(JSON.parse(valorSalvo));
      } catch (e) {
        console.log('Erro ao carregar estado:', e);
      }
    };
    carregar();
  }, []);

  const toggle = async (novoValor: any) => {
    try {
      setAceitou(novoValor);
      await AsyncStorage.setItem('@aceitou_termos', JSON.stringify(novoValor));
    } catch (e) {
      console.log('Erro ao salvar estado:', e);
    }
  };

  const { colors, theme } = useTheme();
  const general = getGeneralStyles(colors);

  async function sincronizarUIDs(oldUid: string, newUid: string) {
    console.log('🔄 Iniciando sincronização de UIDs...');
    console.log('oldUid:', oldUid);
    console.log('newUid:', newUid);

    const batch = writeBatch(db);

    // Atualizar documento com ID = oldUid em 'users'
    const userDocRef = doc(db, 'users', oldUid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const newUserDocRef = doc(db, 'users', newUid);
      batch.set(newUserDocRef, { ...data, uid: newUid });
      batch.delete(userDocRef);
      console.log('✅ Documento em "users" atualizado e movido com sucesso.');
    } else {
      console.warn('⚠️ Documento em "users" com o UID antigo não encontrado.');
    }

    // Atualizar documento com ID = oldUid em 'analytics'
    const analyticsDocRef = doc(db, 'analytics', oldUid);
    const analyticsDocSnap = await getDoc(analyticsDocRef);

    if (analyticsDocSnap.exists()) {
      const data = analyticsDocSnap.data();
      const newAnalyticsDocRef = doc(db, 'analytics', newUid);
      batch.set(newAnalyticsDocRef, { ...data, uid: newUid });
      batch.delete(analyticsDocRef);
      console.log('✅ Documento em "analytics" atualizado e movido com sucesso.');
    } else {
      console.warn('⚠️ Documento em "analytics" com o UID antigo não encontrado.');
    }

    // Atualizar todos os documentos em 'recycled_eletronics' com campo uid = oldUid
    const recicladosRef = collection(db, 'recycled_eletronics');
    const recicladosQuery = query(recicladosRef, where('uid', '==', oldUid));
    const recicladosSnap = await getDocs(recicladosQuery);

    if (!recicladosSnap.empty) {
      recicladosSnap.forEach(docSnap => {
        const ref = doc(db, 'recycled_eletronics', docSnap.id);
        batch.update(ref, { uid: newUid });
        console.log(`♻️ Documento reciclado "${docSnap.id}" atualizado.`);
      });
    } else {
      console.warn('⚠️ Nenhum documento encontrado em "recycled_eletronics" com uid antigo.');
    }

    // Commit final
    await batch.commit();
    console.log('✅ Sincronização de UIDs concluída com sucesso.');
  }

  function validarCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, "");

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (ex: 11111111111)
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Valida os dois dígitos verificadores
    for (let j = 9; j < 11; j++) {
      let soma = 0;
      for (let i = 0; i < j; i++) {
        soma += parseInt(cpf.charAt(i)) * (j + 1 - i);
      }
      let resto = (soma * 10) % 11;
      if (resto === 10) resto = 0;
      if (resto !== parseInt(cpf.charAt(j))) return false;
    }

    return true;
  }

  async function signUp() {
    if (!cpf || !email || !senha || !nome || !sobrenome || !telefone) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    if(!validarCPF(cpf)){
      Alert.alert('Erro', 'CPF Inválido!');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    if (!aceitou) {
      Alert.alert('Erro', 'Você precisa aceitar os termos de uso!');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('cpf', '==', cpf));
      const querySnapshot = await getDocs(q);

      let cadastrado = !querySnapshot.empty;
      let uidEncontrado: string = "";

      if (cadastrado) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.cpf === cpf) {
            uidEncontrado = data.uid; // ou doc.id
          }
        });
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        cpf,
        nome,
        sobrenome,
        telefone,
        email,
        fotoPerfil: ''
      };

      let responseUsers;
      console.log('Usuário encontrado:', cadastrado, 'UID:', uidEncontrado);

      if (cadastrado && uidEncontrado) {
        await sincronizarUIDs(uidEncontrado.trim(), user.uid);

        responseUsers = await axios.put(`${API_URL}/users/${user.uid}`, userData);
      } else {
        responseUsers = await axios.post(`${API_URL}/users`, userData);
      }

      if (responseUsers.status !== 200 && responseUsers.status !== 201) {
        throw new Error('Erro ao salvar usuário no banco de dados');
      }

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      navigation.navigate('Login');
      
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Erro', 'Email já está em uso!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Erro', 'Email inválido!');
        } else if (error.code === 'auth/weak-password') {
          Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres!');
        } else {
          Alert.alert('Erro', 'Não foi possível realizar o cadastro.');
          console.error('Erro no cadastro:', error);
        }
      } else {
        Alert.alert('Erro', 'Não foi possível realizar o cadastro.');
        console.error('Erro no cadastro:', error);
      }
    }
  }

 return (
  <>
    <SafeAreaView style={general.autenticacao.header}>
      <SafeAreaView style={{ position: 'absolute', left: 10, alignItems: 'flex-start', marginBottom: 20 }}>
        <Titulo text="Crie uma conta" style={{ color: colors.neutro, marginBottom: 0 }} />
        <Titulo text="para continuar" style={{ color: colors.neutro }} />
      </SafeAreaView>
      <Image
        source={require('../assets/logo.png')}
        style={{ marginLeft: 250, width: 120, height: 100, justifyContent: 'flex-end' }}
        resizeMode="contain"
      />
    </SafeAreaView>

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
    >
      <ScrollView
        contentContainerStyle={[general.autenticacao.container, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Botões Tabs */}
        <View style={general.autenticacao.tabContainer}>
          <TouchableOpacity
            style={general.autenticacao.tab}
            onPress={() => navigation.goBack()}
          >
            <Text style={general.autenticacao.tabText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={general.autenticacao.activeTabCadastro}
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={general.autenticacao.activeTabText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        {/* Campos de Cadastro */}
        <View style={styles.form}>
          <Titulo text="Nome" style={styles.title} />
          <Input placeholder="Insira seu nome" value={nome} onChangeText={setNome} />

          <Titulo text="Telefone" style={styles.title} />
          <Input
            placeholder="Telefone Ex: (DDD) 123456789"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
          />

          <Titulo text="CPF" style={styles.title} />
          <Input placeholder="Insira seu CPF" keyboardType="numeric" value={cpf} onChangeText={setCpf} />

          <Titulo text="Email" style={styles.title} />
          <Input
            placeholder="Insira seu email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Titulo text="Criar senha" style={styles.title} />
          <View style={general.passwordContainer}>
            <Input
              placeholder="Insira sua senha"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
              style={general.passwordInput}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={general.eyeButton}
              onPress={() => setMostrarSenha(!mostrarSenha)}
              activeOpacity={0.7}
            >
              <Image
                source={mostrarSenha ? require('../assets/icons/visible.png') : require('../assets/icons/non-visible.png')}
                style={general.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={general.passwordContainer}>
            <Input
              placeholder="Confirme sua senha"
              secureTextEntry={!mostrarConfirmarSenha}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              style={general.passwordInput}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={general.eyeButton}
              onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              activeOpacity={0.7}
            >
              <Image
                source={mostrarConfirmarSenha ? require('../assets/icons/visible.png') : require('../assets/icons/non-visible.png')}
                style={general.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={aceitou ? 'checked' : 'unchecked'}
              onPress={() => toggle(!aceitou)}
              color={colors.secundario}
            />
            <Text style={styles.label}>
              Aceito os{' '}
              <Text
                style={{ color: colors.primario, textDecorationLine: 'underline', fontWeight: '500' }}
                onPress={() => navigation.navigate('TermosDeUso')}
              >
                Termos de Uso
              </Text>
            </Text>
          </View>
        </View>

        {/* Botão Cadastrar */}
        <View style={{ width: '98%', alignItems: 'center' }}>
          <BotaoPrimario text="CADASTRAR" onPress={signUp} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </>
);

}

const styles = StyleSheet.create({
  form: {
    marginVertical: -30,
    width: '100%'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 🔹 Garante distribuição correta dos inputs
    alignItems: 'center',
    paddingHorizontal: 5,
    width: '100%',
  },
  inputHalf: {
    flex: 1,
    paddingVertical: 12, // 🔹 Aumenta a área interna para melhor visibilidade do placeholder
    fontSize: 16,
  },
  inputWithIcon: {
    flex: 1,
    marginLeft: 5,
  },
  flag: {
    width: 30,
    height: 20,
    resizeMode: 'contain',
    top: '50%',
    transform: [{ translateY: -40 }], // metade da altura do ícone
  },
  //
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
  },
  label: {
    fontSize: 16,
  },
  status: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  link: {
    color: '#007BFF',     // Azul padrão de link
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  // precisa

  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    backgroundColor: '#000',
    paddingVertical: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#000',
    borderRadius: 50,
    overflow: 'hidden',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  activeTab: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#cde500',
  },
  activeTabText: {
    color: '#000',
  },
  title: {
    alignSelf: 'flex-start', fontSize: 16, marginBottom: 3
  }
});

