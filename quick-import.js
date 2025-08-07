const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, connectFirestoreEmulator } = require('firebase/firestore');

// Dados de junho simplificados (primeiros 5 registros para teste)
const dados = [
  {
    cnpj: "60.909.378/",
    empresa: "ASF LOCACAO ALIATIR",
    franqueado: "ASF LOCACAO ALIATIR", 
    chassi: "99HSH175S TGW606",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "19/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.909.378/",
    empresa: "ASF LOCACAO ALIATIR", 
    franqueado: "ASF LOCACAO ALIATIR",
    chassi: "99HSH175S TGW957",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI", 
    moto: "19/06/2025",
    mes: "junho",
    valor: "150"
  }
];

console.log('Script carregado. Para executar a importação, você precisará:');
console.log('1. Configurar as credenciais do Firebase');
console.log('2. Executar: node quick-import.js');
console.log(`Dados preparados: ${dados.length} registros`);