// Script para inserir dados de vendas de motos
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase config (usar as mesmas configurações do projeto)
const firebaseConfig = {
  // As configurações virão do .env.local
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rawData = `08/11/2024    PRIME    PAGO        Fabio Weyhrother de Oliveira    58.122.712/0001-63    FVE LOCACOES E SERVICOS LTDA    2    Shineray    SHI175cc - Injetada     R$ 15.900,00      R$ 31.800,00 
08/11/2024    PRIME    PAGO        Fabio Weyhrother de Oliveira    58.122.712/0001-63    FVE LOCACOES E SERVICOS LTDA    5    Shineray    SHI175cc - Carburada     R$ 13.500,00      R$ 67.500,00 
25/11/2024    PRIME    PAGO            57.791.375/0001-34    LOCNOW LTDA    5    Shineray    SHI175cc - Carburada     R$ 12.800,00      R$ 64.000,00 
25/11/2024    PRIME    PAGO            57.713.021/0001-71    ACRP LOCACAO LTDA    20    Shineray    SHI175cc - Carburada     R$ 12.800,00      R$ 256.000,00 
25/11/2024    PRIME    PAGO    SIM    Gileno Fernando Araujo    57.656.066/0001-51    G&G LOCAÇÕES AUTOMOTIVAS LTDA    10    Shineray    SHI175cc - Carburada     R$ 12.800,00      R$ 128.000,00 
27/12/2024    MEGA    PAGO    SIM    Andre Moscoso Cicarelli    58.333.572/0001-72    HUB MOTOS LTDA    2    Shineray    SHI175cc - Injetada     R$ 15.550,00      R$ 31.100,00 
30/12/2024    MEGA    PAGO    SIM    Gabriela Pinheiro    59.162.864/0001-52    PINHEIROS LOCAÇÕES LTDA    5    Shineray    SHI175cc - Injetada     R$ 15.550,00      R$ 77.750,00 
23/01/2025    MEGA    PAGO    SIM    Wilson Rezende Ribeiro Júnior    59.935.205/0001-49    H4S SERVIÇOS DE LOCAÇÕES DE MOTOS LTDA    8    Shineray    SHI175cc - Carburada     R$ 14.400,00      R$ 115.200,00 
07/02/2025    MEGA    PAGO    SIM    José Alves Nascimento Filho    03.268.997/0001-53    REALIZAR LOCAÇÃO DE AUTOMOVEIS LTDA    9    Dafra    NH190cc - Injetada     R$ 19.500,00      R$ 175.500,00 
04/02/2025    MEGA    PAGO    SIM    Fabio Weyhrother de Oliveira    58.122.712/0001-63    FVE LOCACOES E SERVICOS LTDA    1    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 16.900,00 
14/02/2025    MEGA    PAGO    SIM    Fabio Weyhrother de Oliveira    58.122.712/0001-63    FVE LOCACOES E SERVICOS LTDA    1    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 16.900,00 
17/02/2025    MEGA    PAGO    SIM    Rodrigo Rogério Oehlmeyer    58.513.802/0001-85    RJD INDEPENDENCIA FINANCEIRA E MOBILIDADE LTDA    2    Dafra    NH190cc - Injetada     R$ 19.750,00      R$ 39.500,00 
19/02/2025    MEGA    PAGO    SIM    Luiz Fernando Moreno Santos e Silva    53.282.205/0001-73    LOC AND GO LTDA    2    Shineray    SHI175cc - Carburada     R$ 14.550,00      R$ 29.100,00 
24/02/2025    MEGA    PAGO    SIM    Gabriela Pinheiro    59.162.864/0001-52    PINHEIROS LOCAÇÕES LTDA    3    Dafra    NH190cc - Injetada     R$ 19.825,00      R$ 59.475,00 
24/02/2025    MEGA    PAGO    SIM    Lana Shely de Freitas Ferreira    58.236.596/0001-03    SAMPAIO FREITAS C. E SERVIÇOS DE LOCAÇÃO LTDA    2    Dafra    NH190cc - Injetada     R$ 19.900,00      R$ 39.800,00 
28/02/2024    MEGA    PAGO    SIM    Andre Moscoso Cicarelli    58.333.572/0001-72    HUB MOTOS LTDA    1    Shineray    SHI175cc - Carburada     R$ 14.500,00      R$ 14.500,00 
08/03/2025    MEGA    PAGO    SIM    Fabio Weyhrother de Oliveira    58.122.712/0001-63    FVE Locadoções e Serviços LTDA    1    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 16.900,00 
24/03/2025    MEGA    PAGO    SIM    Fabio Weyhrother de Oliveira    60.074.308/0001-03    FBF Locações e Serviços LTDA    17    Shineray    SHI175cc - Injetada     R$ 16.800,00      R$ 285.600,00 
25/03/2025    MEGA    PAGO    SIM    João Paulo Melcore    60.218.068/0001-73    JP LocMotos    10    Dafra    NH190cc - Injetada     R$ 20.400,00      R$ 204.000,00 
31/03/2025    MEGA    PAGO    SIM    Fernando Maia Rezende    59.621.282/0001-97    CG Motos LTDA    5    Dafra    NH190cc - Injetada     R$ 20.450,00      R$ 102.250,00 
01/04/2025    MEGA    PAGO    SIM    João Henrique Caló de Oliveira Tourinho    ???    ???    15    Shineray    SHI175cc - Carburada     R$ 14.500,00      R$ 217.500,00 
03/04/2025    MEGA    PAGO    SIM    Wilson Rezende Ribeiro Júnior    59.020.244/0001-89    Locagora 1000 LTDA    5    Shineray    SHI175cc - Carburada     R$ 14.400,00      R$ 72.000,00 
04/04/2025    MEGA    20% PAGO    SIM    Antonio Carlos S Costa/Marcel    60.407.011/0001-12    NC LOCMAIS SERVIÇOS    10    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 169.000,00 
12/04/2025    HABBYZUCA    PAGO    SIM    Fabio Weyhrother de Oliveira    58.122.712/0001-63    FVE LOCAÇÕES E SERVIÇOS LTDA    1    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 16.900,00 
14/04/2025    MEGA    PAGO    SIM    Antonio Carlos S Costa    60.407.011/0001-12    NC LOCMAIS SERVIÇOS    10    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 169.000,00 
30/04/2025    MEGA    PAGO    SIM    Washington Souza Nogueira    60.645.220/0001-02    LOCNOG LOCAÇÕES LTDA    10    Dafra    NH190cc - Injetada     R$ 19.990,00      R$ 199.900,00 
05/05/2025    HABBYZUCA    PAGANDO    SIM    Fabio Weyhrother de Oliveira    58.122.712/0001-63    FVE LOCAÇÕES E SERVIÇOS LTDA    2    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 33.800,00 
05/05/2025    HABBYZUCA    PAGANDO    SIM    Fabio Weyhrother de Oliveira    60.074.308/0001-03    FBF LOCAÇÕES E SERVIÇOS LTDA    3    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 50.700,00 
05/05/2025    HABBYZUCA    PAGANDO    SIM    Gileno Fernando Araujo    57.656.066/0001-51    G&G LOCAÇÕES AUTOMOTIVAS LTDA    20    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 338.000,00 
05/05/2025    MEGA    PAGANDO    SIM    José Alves Nascimento Filho    03.268.997/0001-53    REALIZAR LOCAÇÃO DE AUTOMOVEIS LTDA    6    Dafra    NH190cc - Injetada     R$ 19.990,00      R$ 119.940,00 
13/05/2025    HABBYZUCA    PAGO    SIM    Andrei Tavares de Souza Casaes    60.642.191/0001-17    LOCAT LOCAÇOES DE VEICULOS LTDA    4    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 67.600,00 
13/05/2025    MEGA    PAGO    SIM    Manuoel Biluca de Andrade Neto    60.729.864/0001-70    ADSUMUS LOCAÇÕES LTDA    3    Dafra    NH190cc - Injetada     R$ 20.400,00      R$ 61.200,00 
13/05/2025    MEGA    PAGO    01 ENTREGUE    Manuoel Biluca de Andrade Neto    60.729.864/0001-70    ADSUMUS LOCAÇÕES LTDA    3    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 50.700,00 
14/05/2025    HABBYZUCA    PAGO    SIM    Antonio Carlos S Costa    60.407.011/0001-12    NC LOCMAIS SERVIÇOS LTDA    5    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 84.500,00 
16/05/2025    HABBYZUCA    PAGO    SIM    Rodolfo Victor Ribeiro    60.821.271/0001-30    RODOLFO VICTOR RIBEIRO    7    Shineray    SHI175cc - Carburada     R$ 14.600,00      R$ 102.200,00 
19/05/2025    MEGA    PAGO    05 ENTREGUES    Ignacio Ricardo Lucero    60.940.578/0001-50    LIT SERVIÇOS LTDA    17    Dafra    NH190cc - Injetada     R$ 19.990,00      R$ 339.830,00 
19/05/2025    MEGA    PAGANDO    SIM    Fernando Maia Rezende    59.621.282/0001-97    CG MOTOS LTDA    1    Dafra    NH190cc - Injetada     R$ 19.990,00      R$ 19.990,00 
22/05/2025    MEGA    PAGO    07 ENTREGUES    Antonio Carlos S Costa/Marcel    60.407.011/0001-12    NC LOCMAIS SERVIÇOS    8    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 135.200,00 
22/05/2025    MEGA    PAGANDO    NÃO    Fernando Maia Rezende    59.621.282/0001-97    CG MOTOS LTDA    4    Dafra    NH190cc - Injetada     R$ 19.990,00      R$ 79.960,00 
23/05/2025    MEGA    PAGO    NÃO    João Paulo Melcore    60.218.068/0001-73    JP LOCMOTOS LTDA    2    Dafra    NH190cc - Injetada     R$ 19.990,00      R$ 39.980,00 
23/05/2025    HABBYZUCA    PAGO    SIM    Fernando Maia Rezende    59.621.282/0001-97    CG MOTOS LTDA    5    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 84.500,00 
02/06/2025    HABBYZUCA    PAGO    NÃO    Marcelo Figueiredo Machado    56.993.324/0001-22    MG RENTAL MOTOS LTDA    1    Dafra    NH190cc - Injetada     R$ 20.400,00      R$ 20.400,00 
02/06/2025    HABBYZUCA    PAGO    NÃO    Ana Paula Pegado Ribeiro    60.975.805/0001-82    APT LOCAÇÕES LTDA    3    Shineray    SHI175cc - Carburada     R$ 14.600,00      R$ 43.800,00 
10/06/2025    HABBYZUCA    PAGO    NÃO    Aliatir Silveira Filho    60.909.378/0001-34    ASF LOCAÇÕES LTDA    12    Shineray    SHI175cc - Injetada     R$ 16.900,00      R$ 202.800,00 
10/06/2025    MEGA    PAGO    NÃO    Eduardo de Toledo Bruder    61.222.438/0001-09    ITAPOA MOBILIDADE LTDA    10    Dafra    NH190cc - Injetada     R$ 19.990,00      R$ 199.900,00`;

// Função para processar os dados
function processData() {
  const lines = rawData.split('\n').filter(line => line.trim());
  const vendasData = [];
  
  lines.forEach(line => {
    const values = line.split('\t').map(v => v.trim()).filter(v => v);
    
    if (values.length >= 12) {
      // Função para converter data DD/MM/YYYY para YYYY-MM-DD
      const formatDate = (dateStr) => {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return dateStr;
      };
      
      // Função para converter valores monetários
      const parseMonetaryValue = (str) => {
        if (!str) return 0;
        let cleanStr = str.replace(/R\$\s*/g, '').replace(/\s/g, '').replace(/\./g, '');
        cleanStr = cleanStr.replace(',', '.');
        return parseFloat(cleanStr) || 0;
      };
      
      const vendaData = {
        data_compra: formatDate(values[0]),
        parceiro: values[1],
        status: values[2],
        entregue: values[3],
        franqueado: values[4],
        cnpj: values[5],
        razao_social: values[6],
        quantidade: parseInt(values[7]) || 0,
        marca: values[8],
        modelo: values[9],
        valor_unitario: parseMonetaryValue(values[10]),
        valor_total: parseMonetaryValue(values[11])
      };
      
      vendasData.push(vendaData);
    }
  });
  
  return vendasData;
}

// Função para inserir dados no Firestore
async function insertData() {
  try {
    const vendasData = processData();
    console.log(`Inserindo ${vendasData.length} registros...`);
    
    for (const venda of vendasData) {
      await addDoc(collection(db, 'vendas_motos'), venda);
      console.log(`Inserido: ${venda.data_compra} - ${venda.franqueado}`);
    }
    
    console.log('Todos os dados foram inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
  }
}

// Executar a inserção
insertData();