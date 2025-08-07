// Script para adicionar dados de junho dos rastreadores
// Execute com: node add-june-data.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Configuração do Firebase (substitua pelos valores reais do seu projeto)
const firebaseConfig = {
  // Adicione sua configuração do Firebase aqui
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dados de junho baseados na tabela fornecida
const junhoData = [
  {
    cnpj: "60.909.378/", empresa: "ASF LOCAÇÃO ALIATIR", franqueado: "99HSH175S TGW606", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "19/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.909.378/", empresa: "ASF LOCAÇÃO ALIATIR", franqueado: "99HSH175S TGW957", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "19/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.909.378/", empresa: "ASF LOCAÇÃO ALIATIR", franqueado: "99HSH175S TGW316", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "19/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.909.378/", empresa: "ASF LOCAÇÃO ALIATIR", franqueado: "99HSH175S TGW6C0", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "19/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.909.378/", empresa: "ASF LOCAÇÃO ALIATIR", franqueado: "99HSH175S TGW873", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "19/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.909.378/", empresa: "ASF LOCAÇÃO ALIATIR", franqueado: "99HSH175S TGW324", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "19/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.909.378/", empresa: "ASF LOCAÇÃO ALIATIR", franqueado: "99HSH175S TGW901", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "19/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "59.621.282/", empresa: "CG MOTOS LTDA Fernando Macedo", franqueado: "99HSH175S TGV1E56", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "59.621.282/", empresa: "CG MOTOS LTDA Fernando Macedo", franqueado: "99HSH175S TGV0H39", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "59.621.282/", empresa: "CG MOTOS LTDA Fernando Macedo", franqueado: "99HSH175S TGV1A25", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "59.621.282/", empresa: "CG MOTOS LTDA Fernando Macedo", franqueado: "99HSH175S TGV7F83", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "59.621.282/", empresa: "CG MOTOS LTDA Fernando Macedo", franqueado: "99HSH175S TGV5E26", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "05/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.940.578/", empresa: "LIT SERVIÇOS TARSILA ROBERTA", franqueado: "99SVZ82E55T TGW1F57", chassi: "ALLCOM", placa: "DAFRA", rastreador: "NH 190", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.940.578/", empresa: "LIT SERVIÇOS TARSILA ROBERTA", franqueado: "99SVZ82E55T TGW4F14", chassi: "ALLCOM", placa: "DAFRA", rastreador: "NH 190", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.940.578/", empresa: "LIT SERVIÇOS TARSILA ROBERTA", franqueado: "99SVZ82E55T TGW7J25", chassi: "ALLCOM", placa: "DAFRA", rastreador: "NH 190", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.940.578/", empresa: "LIT SERVIÇOS TARSILA ROBERTA", franqueado: "99SVZ82E55T TGW307", chassi: "ALLCOM", placa: "DAFRA", rastreador: "NH 190", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.940.578/", empresa: "LIT SERVIÇOS TARSILA ROBERTA", franqueado: "99SVZ82E55T TGW438", chassi: "ALLCOM", placa: "DAFRA", rastreador: "NH 190", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.940.578/", empresa: "LIT SERVIÇOS TARSILA ROBERTA", franqueado: "99SVZ82E55T TGW529", chassi: "ALLCOM", placa: "DAFRA", rastreador: "NH 190", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.940.578/", empresa: "LIT SERVIÇOS TARSILA ROBERTA", franqueado: "99SVZ82E55T TGW5E97", chassi: "ALLCOM", placa: "DAFRA", rastreador: "NH 190", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.940.578/", empresa: "LIT SERVIÇOS TARSILA ROBERTA", franqueado: "99SVZ82E55T TGW6F09", chassi: "ALLCOM", placa: "DAFRA", rastreador: "NH 190", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "56.993.324/", empresa: "MG RENTAL - Fernando Marcelo", franqueado: "99NPCRBYISC TJH918", chassi: "MELOCALIZA", placa: "SUZUKI", rastreador: "DK 150", tipo: "18/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "56.993.324/", empresa: "MG RENTAL - Fernando Marcelo", franqueado: "99NPCRBYISC TIV8490", chassi: "MELOCALIZA", placa: "SUZUKI", rastreador: "DK 150", tipo: "18/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "56.993.324/", empresa: "MG RENTAL - Fernando Marcelo", franqueado: "99NPCRBYISC TJI7370", chassi: "MELOCALIZA", placa: "SUZUKI", rastreador: "DK 150", tipo: "18/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "56.993.324/", empresa: "MG RENTAL - Fernando Marcelo", franqueado: "99NPCRBYISC TLI1H80", chassi: "MELOCALIZA", placa: "SUZUKI", rastreador: "DK 150", tipo: "18/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "56.993.324/", empresa: "MG RENTAL - Fernando Marcelo", franqueado: "99SVZ82E55T TGW029", chassi: "MELOCALIZA", placa: "DAFRA", rastreador: "NH 190", tipo: "18/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.407.011/", empresa: "NC LOCMAIS - Caio Fernandes", franqueado: "99HSH175S TGV5H59", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175", tipo: "16/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.407.011/", empresa: "NC LOCMAIS - Caio Fernandes", franqueado: "99HSH175S TGV6C01", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "05/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.407.011/", empresa: "NC LOCMAIS - Caio Fernandes", franqueado: "99HSH175S TGV3D69", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "05/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.407.011/", empresa: "NC LOCMAIS - Caio Fernandes", franqueado: "99HSH175S TGV1A91", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "05/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.407.011/", empresa: "NC LOCMAIS - Caio Fernandes", franqueado: "99HSH175S TGV2E75", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "05/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.407.011/", empresa: "NC LOCMAIS - Caio Fernandes", franqueado: "99HSH175S TGV6G16", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "05/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.407.011/", empresa: "NC LOCMAIS - Caio Fernandes", franqueado: "99HSH175S TGV2D29", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "05/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  },
  {
    cnpj: "60.407.011/", empresa: "NC LOCMAIS - Caio Fernandes", franqueado: "99HSH175S TGV0J53", chassi: "ALLCOM", placa: "SHINERAY", rastreador: "SH 175 EFI", tipo: "05/06/2025", moto: "JUNHO", mes: "JUNHO", valor: "150"
  }
];

// Função para adicionar os dados
async function addJuneData() {
  try {
    console.log('Iniciando inserção dos dados de junho...');
    
    for (let i = 0; i < junhoData.length; i++) {
      const data = junhoData[i];
      console.log(`Inserindo item ${i + 1}/${junhoData.length}...`);
      
      await addDoc(collection(db, 'rastreadores'), data);
    }
    
    console.log('Todos os dados de junho foram inseridos com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    process.exit(1);
  }
}

// Executar a função
addJuneData();