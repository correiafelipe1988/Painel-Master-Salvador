// Script temporário para inserir dados de distratos
const fs = require('fs');

// Dados da planilha
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
  // ... Continue com todos os outros dados...
];

console.log('🔥 DADOS PARA IMPORTAÇÃO MANUAL - DISTRATOS LOCAÇÕES');
console.log('');
console.log('📋 Para inserir os dados manualmente:');
console.log('1. Acesse: http://localhost:9002/distratos-locacoes');
console.log('2. Clique em "Importar CSV"');
console.log('3. Selecione o arquivo: dados-distratos-completos.csv');
console.log('');
console.log('📊 DADOS PREPARADOS:');
console.log(`Total de registros: ${dadosDistratos.length}`);
console.log('');

dadosDistratos.slice(0, 5).forEach((item, index) => {
  console.log(`--- EXEMPLO ${index + 1}/5 ---`);
  console.log(`Placa: ${item.placa}`);
  console.log(`Franqueado: ${item.franqueado}`);
  console.log(`Período: ${item.inicio_ctt} → ${item.fim_ctt}`);
  console.log(`Causa: ${item.causa}`);
  console.log('');
});

console.log('✅ Use o arquivo CSV criado para importação rápida de todos os dados!');