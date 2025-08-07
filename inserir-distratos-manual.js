// Instruções para inserção manual de distratos - um por um
const dadosCompletos = [
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
  },
  {
    placa: "SKP7J89",
    franqueado: "D & M LOCADORA DE VEICULOS LTDA",
    inicio_ctt: "02/08/2025",
    fim_ctt: "04/08/2025",
    motivo: "Contrato cancelado a pedido do locatário por não adaptação ao modelo da motocicleta. A decisão foi tomada logo após o início da locação. Caução será devolvida/descontada conforme previsto contratualmente.",
    causa: "não adaptação ao modelo da motocicleta"
  },
  {
    placa: "SKT5D63",
    franqueado: "FBF LOCACOES E SERVICOS LTDA",
    inicio_ctt: "04/08/2025",
    fim_ctt: "04/08/2025",
    motivo: "TROCA DE MOTO",
    causa: "TROCA DE MOTO"
  },
  {
    placa: "TGR8J52",
    franqueado: "NC LOCMAIS SERVICOS LTDA",
    inicio_ctt: "02/05/2025",
    fim_ctt: "04/08/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato",
    causa: "inadimplência"
  },
  {
    placa: "TGW1C51",
    franqueado: "LIT SERVICOS LTDA",
    inicio_ctt: "21/07/2025",
    fim_ctt: "04/08/2025",
    motivo: "O locatário informou que está sem condições financeiras para continuar com a locação, solicitando o encerramento antecipado do contrato. Devido à rescisão antes do prazo mínimo, será retido o valor do caução e aplicada a multa contratual conforme as cláusulas previstas no contrato de locação.",
    causa: "sem condições financeiras"
  },
  {
    placa: "SKJ8E68",
    franqueado: "W&W LOCADORA DE VEICULOS LTDA",
    inicio_ctt: "31/07/2025",
    fim_ctt: "01/08/2025",
    motivo: "Liberação de placa/desistência",
    causa: "Liberação de placa/desistência"
  }
];

console.log('🔥 INSERÇÃO MANUAL DE DISTRATOS - PASSO A PASSO');
console.log('');
console.log('📍 Acesse: http://localhost:9002/distratos-locacoes');
console.log('📍 Para cada registro abaixo:');
console.log('   1. Clique em "Adicionar Distrato"');
console.log('   2. Preencha os campos conforme mostrado');
console.log('   3. Clique em "Salvar"');
console.log('   4. Repita para o próximo registro');
console.log('');

dadosCompletos.forEach((item, index) => {
  console.log(`════════ REGISTRO ${index + 1}/${dadosCompletos.length} ════════`);
  console.log(`Placa: ${item.placa}`);
  console.log(`Franqueado: ${item.franqueado}`);
  console.log(`Início Contrato: ${item.inicio_ctt}`);
  console.log(`Fim Contrato: ${item.fim_ctt}`);
  console.log(`Causa: ${item.causa}`);
  console.log(`Motivo: ${item.motivo}`);
  console.log('');
});

console.log('✅ Total de registros para inserir:', dadosCompletos.length);
console.log('⏱️  Tempo estimado: ~20 minutos (2 min por registro)');

// Gerar também um arquivo JSON para facilitar copy-paste
const fs = require('fs');
fs.writeFileSync('distratos-para-copiar.json', JSON.stringify(dadosCompletos, null, 2));
console.log('📄 Arquivo JSON criado: distratos-para-copiar.json (para copy-paste)');