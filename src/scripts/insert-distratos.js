// Script para inserir distratos diretamente no Firebase
// Este script simula a inserção manual através da interface

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  // Configuração do Firebase - será lida do .env.local
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dadosDistratos = [
  {
    placa: "SKM6J04",
    franqueado: "PH LOCACAO DE VEICULOS LTDA",
    inicio_ctt: "06/01/2025",
    fim_ctt: "05/08/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "TGV3D69",
    franqueado: "NC LOCMAIS SERVICOS LTDA",
    inicio_ctt: "16/06/2025",
    fim_ctt: "05/08/2025",
    motivo: "Cancelamento de Contrato por Desistência - O contrato foi encerrado a pedido do locatário, por motivo de desistência da continuidade da locação. Conforme disposto nas cláusulas contratuais previamente acordadas, o valor referente ao caução não será restituído, considerando que a rescisão ocorreu por iniciativa do locatário, sem cumprimento do prazo mínimo estabelecido.",
    causa: "Desistencia"
  },
  {
    placa: "TLF2I80",
    franqueado: "MG RENTAL MOTOS - Salvador",
    inicio_ctt: "10/04/2025",
    fim_ctt: "05/08/2025",
    motivo: "Sem informações",
    causa: "Sem informações"
  },
  {
    placa: "SKR6E74",
    franqueado: "REALIZAR LOCACAO DE AUTOMOVEIS LTDA",
    inicio_ctt: "19/03/2025",
    fim_ctt: "04/08/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "SKP5E44",
    franqueado: "D & M LOCADORA DE VEICULOS LTDA",
    inicio_ctt: "24/07/2025",
    fim_ctt: "04/08/2025",
    motivo: "O contrato foi encerrado por decisão do locatário, que solicitou a devolução do veículo por motivos pessoais, sem apontar insatisfação com o serviço ou produto. A caução será tratada conforme as cláusulas contratuais.",
    causa: "motivos pessoais"
  }
];

const insertDistratos = async () => {
  console.log('🔥 Inserindo distratos no Firebase...');
  
  for (let i = 0; i < dadosDistratos.length; i++) {
    const distrato = dadosDistratos[i];
    
    try {
      const docRef = await addDoc(collection(db, 'distratos'), distrato);
      console.log(`✅ ${i + 1}/${dadosDistratos.length} - ${distrato.placa} inserido com ID: ${docRef.id}`);
    } catch (error) {
      console.error(`❌ Erro ao inserir ${distrato.placa}:`, error);
    }
    
    // Pausa de 500ms entre inserções para simular inserção manual
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🎉 Inserção completada!');
};

// Para usar este script, você precisa:
// 1. Ter as configurações do Firebase no .env.local
// 2. Executar em um ambiente Node.js com suporte a ES6 modules
// insertDistratos();

console.log('📋 Script preparado para inserção automática');
console.log('⚠️  Para executar, descomente a última linha e configure o Firebase');
console.log(`📊 Total de registros: ${dadosDistratos.length}`);