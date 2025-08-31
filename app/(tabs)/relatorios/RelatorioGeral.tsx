import { useTheme } from '@/contexts/ThemeContext';
import { getGeneralStyles } from '@/styles/general';
import { RelatorioTabScreenProps } from '@/types/navigation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { API_URL } from '../../../api';
import Titulo from '../../../components/Titulo';
import { auth } from '../../../firebaseConfig';

type Props = RelatorioTabScreenProps<"Estatísticas">

const RelatorioScreen = () => {
  const [massa, setMassa] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [dadosCategoria, setDadosCategoria] = useState(null as null | Record<string, { massa: number; porcentagem: number }>);
  const [error, setError] = useState(null);

  const { colors } = useTheme();
  const general = getGeneralStyles(colors);
  
  const fetchAnalytics = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const USER_URL = API_URL + '/relatorio' + '/' + user.uid;
      // console.log(USER_URL);
      const response = await axios.get(USER_URL);
      const analytics = response.data;

      setMassa(analytics.massa);
      setPontos(analytics.pontos);
      setDadosCategoria(analytics.por_categoria);
      // console.log('Analytics completo:', analytics);
      // console.log('Dados por categoria:', analytics.por_categoria);
    } catch (err: Error | any) {
      console.error('Erro ao buscar eletrônicos:', err);
      setError(err.message || 'Erro ao carregar dados');
    }
  }

  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 5000); // Atualiza a cada 5s
    fetchAnalytics(); // Chama imediatamente
    
    return () => clearInterval(interval);
  }, []);

  const quantidade = dadosCategoria ? {
    pilhas: dadosCategoria["Pilha"]?.massa || 0,
    baterias: dadosCategoria["Bateria"]?.massa || 0,
    celulares: dadosCategoria["Celular"]?.massa || 0,
    computadores: dadosCategoria["Computador"]?.massa || 0,
    outros: dadosCategoria["Outro"]?.massa || 0
  } : {};

  const porcentagem = dadosCategoria ? {
    pilhas: dadosCategoria["Pilha"]?.porcentagem || 0,
    baterias: dadosCategoria["Bateria"]?.porcentagem || 0,
    celulares: dadosCategoria["Celular"]?.porcentagem || 0,
    computadores: dadosCategoria["Computador"]?.porcentagem || 0,
    outros: dadosCategoria["Outro"]?.porcentagem || 0
  } : {};
  
  const relatorioCompleto = [
    { categoria: 'Pilhas', quantidade: quantidade.pilhas, porcentagem: porcentagem.pilhas },
    { categoria: 'Baterias', quantidade: quantidade.baterias, porcentagem: porcentagem.baterias },
    { categoria: 'Celulares', quantidade: quantidade.celulares, porcentagem: porcentagem.celulares },
    { categoria: 'Computadores', quantidade: quantidade.computadores, porcentagem: porcentagem.computadores },
    { categoria: 'Outros', quantidade: quantidade.outros, porcentagem: porcentagem.outros },
  ];

  const relatorio = relatorioCompleto.filter(item => item.quantidade !== undefined && item.quantidade > 0);
  
  // console.log('Relatório filtrado:', relatorio);
  // console.log('Dados categoria raw:', dadosCategoria);
  // console.log('Quantidade objeto:', quantidade);
  // console.log('Porcentagem objeto:', porcentagem);

  const screenWidth = Dimensions.get('window').width;

  // Dados para o gráfico de pizza (porcentagem) - agora com porcentagens como números
  const pieChartData = relatorio
    .filter(item => item.porcentagem !== undefined && item.porcentagem > 0)
    .map((item, index) => ({
      name: item.categoria,
      population: item.porcentagem,
      color: ['#B8D4A0', '#A0824A', '#8B6F47', '#9CAF88', '#7A9B57'][index % 5], // Cores mais próximas da imagem
      legendFontColor: '#333',
      legendFontSize: 13,
    }));

  // console.log('Dados do gráfico de pizza (após filtro):', pieChartData);

  // Dados para o gráfico de linhas (quantidade em gramas) - usando dados válidos apenas
  const lineChartData = relatorio.length > 0 ? {
    labels: relatorio.map(item => item.categoria.substring(0, 6)),
    datasets: [
      {
        data: relatorio.map(item => {
          const quantidade = Number(item.quantidade) || 0;
          // console.log(`${item.categoria}: quantidade=${item.quantidade}, convertida=${quantidade}`);
          return quantidade;
        }),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  } : null;

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
    // Configurações para evitar overflow
    paddingRight: 50,
    paddingLeft: 20,
  };

  return (
    <ScrollView style={general.container3}>
      <Titulo text="Conheça suas estatísticas!" />
      
      {relatorio.length > 0 ? (
        <>
          {/* Gráfico de Pizza - Porcentagem por Categoria */}
          {pieChartData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Matéria-prima descartada</Text>
              <View style={styles.pieChartWrapper}>
                <View style={styles.donutChart}>
                  <PieChart
                    data={pieChartData}
                    width={screenWidth - 80}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="40"
                    center={[40, 10]}
                    hasLegend={false}
                    avoidFalseZero={true}
                  />
                </View>
              </View>
              {/* Legenda como chips/tags embaixo */}
              <View style={styles.chipContainer}>
                {pieChartData.map((item, index) => (
                  <View key={index} style={[styles.chip, { backgroundColor: item.color }]}>
                    <Text style={styles.chipText}>
                      {item.name.toUpperCase()} {item.population}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Gráfico de Barras - Quantidade em Gramas por Categoria */}
          {relatorio.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Quantidade por Categoria (gramas)</Text>
              <BarChart
                data={{
                  labels: relatorio.map(item => {
                    const abreviacoes: Record<string, string> = {
                      'Pilhas': 'PILHAS',
                      'Baterias': 'BATERIAS', 
                      'Celulares': 'CELULARES',
                      'Computadores': 'COMPUTADORES',
                      'Outros': 'OUTROS'
                    };
                    return abreviacoes[item.categoria] || item.categoria.substring(0, 4);
                  }),
                  datasets: [
                    {
                      data: relatorio.map(item => Number(item.quantidade) || 0),
                    },
                  ],
                }}
                width={screenWidth - 100}
                height={220}
                yAxisLabel=""
                yAxisSuffix="g"
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.primario, // Verde sólido sem transparência
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.6,
                  fillShadowGradient: colors.secundario,
                  fillShadowGradientOpacity: 1,
                  fillShadowGradientFrom: colors.secundario,
                  fillShadowGradientTo: colors.secundario,
                  fillShadowGradientFromOpacity: 1, // Opacidade total
                  fillShadowGradientToOpacity: 1, // Opacidade total
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#e3e3e3',
                    strokeWidth: 1,
                  },
                  paddingRight: 100,
                }}
                style={styles.chart}
                verticalLabelRotation={30}
                showValuesOnTopOfBars={true}
                fromZero={true}
              />
            </View>
          )}
        </>
      ) : (
        <View style={styles.card}>
          <View style={styles.info}>
            <Text style={styles.tipo}>Nenhum eletrônico reciclado ainda</Text>
            <Text style={styles.marcaModelo}>
              Quando você reciclar, os dados aparecerão aqui 😄
            </Text>
          </View>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  donutChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    marginTop: -50, // Metade da altura para centralizar verticalmente
    marginLeft: -50, // Metade da largura para centralizar horizontalmente
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  centerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 16,
  },
  chipContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 80,
  },
  chipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  legendContainer: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  info: {
    alignItems: 'center',
  },
  tipo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  marcaModelo: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default RelatorioScreen;

