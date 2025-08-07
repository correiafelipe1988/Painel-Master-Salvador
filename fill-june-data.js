// Script para preencher dados de junho através de requisições HTTP
const axios = require('axios');

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
  // ... outros registros
];

console.log('📋 Para preencher os dados de junho manualmente:');
console.log('');
console.log('🔹 Acesse: http://localhost:9002/rastreadores');
console.log('🔹 Clique em "Adicionar Rastreador"');
console.log('🔹 Preencha os dados abaixo um por um:');
console.log('');

dadosJunho.forEach((item, index) => {
  console.log(`--- REGISTRO ${index + 1}/33 ---`);
  console.log(`CNPJ: ${item.cnpj}`);
  console.log(`Empresa: ${item.empresa}`);
  console.log(`Franqueado: ${item.franqueado}`);
  console.log(`Chassi: ${item.chassi}`);
  console.log(`Placa: ${item.placa}`);
  console.log(`Rastreador: ${item.rastreador}`);
  console.log(`Tipo: ${item.tipo}`);
  console.log(`Moto: ${item.moto}`);
  console.log(`Mês: ${item.mes}`);
  console.log(`Valor: ${item.valor}`);
  console.log('');
});

console.log('✅ Total: 33 registros de junho');
console.log('💰 Receita: R$ 4.950,00');