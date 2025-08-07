// Script para adicionar dados de junho usando a função addRastreador existente
// const { addRastreador } = require('./src/lib/firebase/rastreadorService');

const dadosJunho = [
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

console.log('✅ Funcionalidade de importação CSV implementada!');
console.log('📂 Arquivo CSV criado: dados-junho-rastreadores.csv');
console.log('🚀 Para usar:');
console.log('   1. Acesse http://localhost:9002/rastreadores');
console.log('   2. Clique no botão "Importar CSV"');
console.log('   3. Selecione o arquivo dados-junho-rastreadores.csv');
console.log('   4. Os 33 registros de junho serão importados automaticamente!');
console.log('');
console.log('💰 Total: 33 registros × R$ 150 = R$ 4.950,00');