// Script para executar no console do navegador na página de distratos
// Cole este código no console (F12 → Console) enquanto estiver em http://localhost:9002/distratos-locacoes

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

// Função para inserir um distrato usando a API da página
async function inserirDistrato(distrato) {
  try {
    // Simular clique no botão "Adicionar Distrato"
    const botaoAdicionar = document.querySelector('button:has-text("Adicionar Distrato")') || 
                          Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Adicionar'));
    
    if (botaoAdicionar) {
      botaoAdicionar.click();
      
      // Aguardar modal abrir
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Preencher campos
      const inputPlaca = document.getElementById('placa');
      const inputFranqueado = document.getElementById('franqueado');
      const inputInicio = document.getElementById('inicio_ctt');
      const inputFim = document.getElementById('fim_ctt');
      const inputCausa = document.getElementById('causa');
      const inputMotivo = document.getElementById('motivo');
      
      if (inputPlaca) inputPlaca.value = distrato.placa;
      if (inputFranqueado) inputFranqueado.value = distrato.franqueado;
      if (inputInicio) inputInicio.value = distrato.inicio_ctt;
      if (inputFim) inputFim.value = distrato.fim_ctt;
      if (inputCausa) inputCausa.value = distrato.causa;
      if (inputMotivo) inputMotivo.value = distrato.motivo;
      
      // Triggerar eventos de mudança
      [inputPlaca, inputFranqueado, inputInicio, inputFim, inputCausa, inputMotivo].forEach(input => {
        if (input) {
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Aguardar um pouco e clicar em salvar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const botaoSalvar = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Salvar'));
      if (botaoSalvar) {
        botaoSalvar.click();
        console.log(`✅ Distrato ${distrato.placa} inserido`);
      }
      
      // Aguardar modal fechar
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
  } catch (error) {
    console.error(`❌ Erro ao inserir ${distrato.placa}:`, error);
  }
}

// Função principal para inserir todos os distratos
async function inserirTodosDistratos() {
  console.log('🔥 Iniciando inserção automática de distratos...');
  console.log(`📊 Total: ${dadosDistratos.length} registros`);
  
  for (let i = 0; i < dadosDistratos.length; i++) {
    console.log(`⏳ Inserindo ${i + 1}/${dadosDistratos.length}: ${dadosDistratos[i].placa}`);
    await inserirDistrato(dadosDistratos[i]);
    
    // Pausa entre inserções
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('🎉 Inserção automática concluída!');
}

// Para executar, cole no console e execute:
console.log('📋 Script carregado!');
console.log('🚀 Para inserir os distratos automaticamente, execute: inserirTodosDistratos()');
console.log('⚠️  Certifique-se de estar na página: http://localhost:9002/distratos-locacoes');

// Autoexecutar se estivermos na página correta
if (window.location.pathname === '/distratos-locacoes') {
  console.log('✅ Página correta detectada. Executando em 3 segundos...');
  setTimeout(() => {
    inserirTodosDistratos();
  }, 3000);
}