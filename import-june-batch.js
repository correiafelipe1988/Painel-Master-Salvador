// Script para importar dados de junho em lote
// Este script usa a função de importação em lote existente

import { importRastreadoresBatch } from './src/lib/firebase/rastreadorService.js';

const junhoData = [
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
  },
  {
    cnpj: "60.909.378/",
    empresa: "ASF LOCACAO ALIATIR",
    franqueado: "ASF LOCACAO ALIATIR",
    chassi: "99HSH175S TGW316",
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
    chassi: "99HSH175S TGW6C0",
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
    chassi: "99HSH175S TGW873",
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
    chassi: "99HSH175S TGW324",
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
    chassi: "99HSH175S TGW901",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "19/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "59.621.282/",
    empresa: "CG MOTOS LTDA Fernando Macedo",
    franqueado: "CG MOTOS LTDA Fernando Macedo",
    chassi: "99HSH175S TGV1E56",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "59.621.282/",
    empresa: "CG MOTOS LTDA Fernando Macedo", 
    franqueado: "CG MOTOS LTDA Fernando Macedo",
    chassi: "99HSH175S TGV0H39",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "59.621.282/",
    empresa: "CG MOTOS LTDA Fernando Macedo",
    franqueado: "CG MOTOS LTDA Fernando Macedo",
    chassi: "99HSH175S TGV1A25",
    placa: "ALLCOM", 
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "16/06/2025",
    mes: "junho", 
    valor: "150"
  },
  {
    cnpj: "59.621.282/",
    empresa: "CG MOTOS LTDA Fernando Macedo",
    franqueado: "CG MOTOS LTDA Fernando Macedo",
    chassi: "99HSH175S TGV7F83",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "59.621.282/",
    empresa: "CG MOTOS LTDA Fernando Macedo",
    franqueado: "CG MOTOS LTDA Fernando Macedo", 
    chassi: "99HSH175S TGV5E26",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "05/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.940.578/",
    empresa: "LIT SERVICOS TARSILA ROBERTA",
    franqueado: "LIT SERVICOS TARSILA ROBERTA",
    chassi: "99SVZ82E55T TGW1F57",
    placa: "ALLCOM",
    rastreador: "DAFRA",
    tipo: "NH 190",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.940.578/",
    empresa: "LIT SERVICOS TARSILA ROBERTA",
    franqueado: "LIT SERVICOS TARSILA ROBERTA",
    chassi: "99SVZ82E55T TGW4F14",
    placa: "ALLCOM",
    rastreador: "DAFRA",
    tipo: "NH 190",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.940.578/",
    empresa: "LIT SERVICOS TARSILA ROBERTA", 
    franqueado: "LIT SERVICOS TARSILA ROBERTA",
    chassi: "99SVZ82E55T TGW7J25",
    placa: "ALLCOM",
    rastreador: "DAFRA",
    tipo: "NH 190",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.940.578/",
    empresa: "LIT SERVICOS TARSILA ROBERTA",
    franqueado: "LIT SERVICOS TARSILA ROBERTA",
    chassi: "99SVZ82E55T TGW307",
    placa: "ALLCOM",
    rastreador: "DAFRA",
    tipo: "NH 190", 
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.940.578/",
    empresa: "LIT SERVICOS TARSILA ROBERTA",
    franqueado: "LIT SERVICOS TARSILA ROBERTA",
    chassi: "99SVZ82E55T TGW438",
    placa: "ALLCOM",
    rastreador: "DAFRA",
    tipo: "NH 190",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.940.578/",
    empresa: "LIT SERVICOS TARSILA ROBERTA",
    franqueado: "LIT SERVICOS TARSILA ROBERTA",
    chassi: "99SVZ82E55T TGW529",
    placa: "ALLCOM", 
    rastreador: "DAFRA",
    tipo: "NH 190",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.940.578/",
    empresa: "LIT SERVICOS TARSILA ROBERTA",
    franqueado: "LIT SERVICOS TARSILA ROBERTA",
    chassi: "99SVZ82E55T TGW5E97",
    placa: "ALLCOM",
    rastreador: "DAFRA",
    tipo: "NH 190",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.940.578/",
    empresa: "LIT SERVICOS TARSILA ROBERTA",
    franqueado: "LIT SERVICOS TARSILA ROBERTA",
    chassi: "99SVZ82E55T TGW6F09",
    placa: "ALLCOM",
    rastreador: "DAFRA",
    tipo: "NH 190", 
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "56.993.324/",
    empresa: "MG RENTAL Fernando Marcelo",
    franqueado: "MG RENTAL Fernando Marcelo",
    chassi: "99NPCRBYISC TJH918",
    placa: "MELOCALIZA",
    rastreador: "SUZUKI",
    tipo: "DK 150",
    moto: "18/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "56.993.324/",
    empresa: "MG RENTAL Fernando Marcelo",
    franqueado: "MG RENTAL Fernando Marcelo", 
    chassi: "99NPCRBYISC TIV8490",
    placa: "MELOCALIZA",
    rastreador: "SUZUKI",
    tipo: "DK 150",
    moto: "18/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "56.993.324/",
    empresa: "MG RENTAL Fernando Marcelo",
    franqueado: "MG RENTAL Fernando Marcelo",
    chassi: "99NPCRBYISC TJI7370",
    placa: "MELOCALIZA",
    rastreador: "SUZUKI",
    tipo: "DK 150",
    moto: "18/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "56.993.324/",
    empresa: "MG RENTAL Fernando Marcelo",
    franqueado: "MG RENTAL Fernando Marcelo",
    chassi: "99NPCRBYISC TLI1H80",
    placa: "MELOCALIZA",
    rastreador: "SUZUKI", 
    tipo: "DK 150",
    moto: "18/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "56.993.324/",
    empresa: "MG RENTAL Fernando Marcelo",
    franqueado: "MG RENTAL Fernando Marcelo",
    chassi: "99SVZ82E55T TGW029",
    placa: "MELOCALIZA",
    rastreador: "DAFRA",
    tipo: "NH 190",
    moto: "18/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.407.011/",
    empresa: "NC LOCMAIS Caio Fernandes",
    franqueado: "NC LOCMAIS Caio Fernandes",
    chassi: "99HSH175S TGV5H59",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175",
    moto: "16/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.407.011/",
    empresa: "NC LOCMAIS Caio Fernandes",
    franqueado: "NC LOCMAIS Caio Fernandes",
    chassi: "99HSH175S TGV6C01",
    placa: "ALLCOM", 
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "05/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.407.011/",
    empresa: "NC LOCMAIS Caio Fernandes",
    franqueado: "NC LOCMAIS Caio Fernandes",
    chassi: "99HSH175S TGV3D69",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "05/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.407.011/",
    empresa: "NC LOCMAIS Caio Fernandes",
    franqueado: "NC LOCMAIS Caio Fernandes",
    chassi: "99HSH175S TGV1A91",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI", 
    moto: "05/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.407.011/",
    empresa: "NC LOCMAIS Caio Fernandes",
    franqueado: "NC LOCMAIS Caio Fernandes",
    chassi: "99HSH175S TGV2E75",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "05/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.407.011/",
    empresa: "NC LOCMAIS Caio Fernandes",
    franqueado: "NC LOCMAIS Caio Fernandes",
    chassi: "99HSH175S TGV6G16",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "05/06/2025", 
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.407.011/",
    empresa: "NC LOCMAIS Caio Fernandes", 
    franqueado: "NC LOCMAIS Caio Fernandes",
    chassi: "99HSH175S TGV2D29",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "05/06/2025",
    mes: "junho",
    valor: "150"
  },
  {
    cnpj: "60.407.011/",
    empresa: "NC LOCMAIS Caio Fernandes",
    franqueado: "NC LOCMAIS Caio Fernandes",
    chassi: "99HSH175S TGV0J53",
    placa: "ALLCOM",
    rastreador: "SHINERAY",
    tipo: "SH 175 EFI",
    moto: "05/06/2025",
    mes: "junho",
    valor: "150"
  }
];

async function importJuneData() {
  try {
    console.log('Iniciando importação dos dados de junho...');
    console.log(`Total de registros: ${junhoData.length}`);
    
    const result = await importRastreadoresBatch(junhoData);
    console.log('Dados importados com sucesso!', result);
    
  } catch (error) {
    console.error('Erro na importação:', error);
  }
}

// Executar
importJuneData();