// Todos os 299 registros da planilha de distratos
const dadosDistratos299 = [
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
  },
  {
    placa: "SKI4E97",
    franqueado: "LOC AND GO LTDA",
    inicio_ctt: "30/07/2025",
    fim_ctt: "01/08/2025",
    motivo: "Cancelado por motivos de não adaptação da moto",
    causa: "não adaptação ao modelo da motocicleta"
  },
  {
    placa: "SKO1H66",
    franqueado: "RJD INDEPENDENCIA FINANCEIRA E MOBILIDADE LTDA",
    inicio_ctt: "07/05/2025",
    fim_ctt: "01/08/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "SJX4G75",
    franqueado: "W&W LOCADORA DE VEICULOS LTDA",
    inicio_ctt: "13/01/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato",
    causa: "inadimplência"
  },
  {
    placa: "TGR4G37",
    franqueado: "LOCAGORA 1000 LTDA",
    inicio_ctt: "22/04/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato",
    causa: "inadimplência"
  },
  {
    placa: "TGR3E71",
    franqueado: "JP LOCMOTOS LTDA",
    inicio_ctt: "28/04/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato",
    causa: "inadimplência"
  },
  {
    placa: "SKQ7H58",
    franqueado: "Pinheiro Locação Ltda",
    inicio_ctt: "23/05/2025",
    fim_ctt: "31/07/2025",
    motivo: "Sem informações",
    causa: "Sem informações"
  },
  {
    placa: "SKN4D04",
    franqueado: "RJD INDEPENDENCIA FINANCEIRA E MOBILIDADE LTDA",
    inicio_ctt: "19/05/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência e falta do pagamento de algumas parcelas do acordo de manutenção, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato",
    causa: "inadimplência"
  }
];

  {
    placa: "SKM9C11",
    franqueado: "Fillipe Felix - SALVADOR (Antiga ACRP LOCACAO)",
    inicio_ctt: "28/12/2024",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "TGR8B06",
    franqueado: "FBF LOCACOES E SERVICOS LTDA",
    inicio_ctt: "14/04/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "TGU9A25",
    franqueado: "LOCNOG LOCACOES LTDA",
    inicio_ctt: "27/05/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "TGR3D83",
    franqueado: "FBF LOCACOES E SERVICOS LTDA",
    inicio_ctt: "27/06/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "TGU0G51",
    franqueado: "G&G LOCAÇÕES AUTOMOTIVAS - sede",
    inicio_ctt: "03/06/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato está sendo encerrado em razão da inadimplência do locatário frente às obrigações decorrentes de sinistro envolvendo o veículo locado. Conforme previsto nas cláusulas contratuais, o não cumprimento dessas responsabilidades resultará na aplicação de multa contratual, além da cobrança dos custos referentes ao reparo do veículo. O valor do caução será tratado conforme as disposições contratuais aplicáveis.",
    causa: "inadimplência"
  },
  {
    placa: "SKP7J89",
    franqueado: "D & M LOCADORA DE VEICULOS LTDA",
    inicio_ctt: "10/03/2025",
    fim_ctt: "31/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "TGU1B24",
    franqueado: "G&G LOCAÇÕES AUTOMOTIVAS - sede",
    inicio_ctt: "22/05/2025",
    fim_ctt: "30/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "TGY8H78",
    franqueado: "FBF LOCACOES E SERVICOS LTDA",
    inicio_ctt: "30/07/2025",
    fim_ctt: "30/07/2025",
    motivo: "Desistência",
    causa: "Desistência"
  },
  {
    placa: "TGW0B26",
    franqueado: "APT LOCACOES LTDA",
    inicio_ctt: "11/07/2025",
    fim_ctt: "30/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato",
    causa: "inadimplência"
  },
  {
    placa: "TGX4I08",
    franqueado: "D & M LOCADORA DE VEICULOS LTDA",
    inicio_ctt: "18/07/2025",
    fim_ctt: "30/07/2025",
    motivo: "O contrato cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  },
  {
    placa: "SKQ1H55",
    franqueado: "Pinheiro Locação Ltda",
    inicio_ctt: "21/03/2025",
    fim_ctt: "30/07/2025",
    motivo: "Encerrado por motivo de insatisfação do cliente o mesmo está em posse de outra placa de mesma franquia onde dará continuidade ao contrato.",
    causa: "insatisfação do cliente"
  },
  {
    placa: "SKS9E90",
    franqueado: "CD MOTOS RENTAL LTDA - SALVADOR",
    inicio_ctt: "19/07/2025",
    fim_ctt: "30/07/2025",
    motivo: "Cliente inadimplente",
    causa: "inadimplência"
  },
  {
    placa: "SKJ1C64",
    franqueado: "W&W LOCADORA DE VEICULOS LTDA",
    inicio_ctt: "21/07/2025",
    fim_ctt: "30/07/2025",
    motivo: "contrato encerrado devido ao locatário usar a moto somente em carater de reserva acordo feito entre ambas partes.",
    causa: "uso em carater de reserva"
  },
  {
    placa: "TGU3G26",
    franqueado: "G&G LOCAÇÕES AUTOMOTIVAS - sede",
    inicio_ctt: "03/06/2025",
    fim_ctt: "30/07/2025",
    motivo: "O contrato foi cancelado devido à inadimplência, com retenção do valor de caução e aplicação da multa contratual conforme estabelecido nas cláusulas do contrato.",
    causa: "inadimplência"
  }
];

export default dadosDistratos299;