const fs = require('fs');

// Ler o CSV
const csv = fs.readFileSync('dados-distratos-completos.csv', 'utf8');
const lines = csv.trim().split('\n');

// Processar dados
const data = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    
    if (char === '"' && (j === 0 || line[j-1] === ',')) {
      inQuotes = true;
    } else if (char === '"' && (j === line.length-1 || line[j+1] === ',')) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  if (values.length >= 6) {
    data.push({
      placa: values[0],
      franqueado: values[1],
      inicio_ctt: values[2],
      fim_ctt: values[3],
      motivo: values[4].replace(/^"|"$/g, ''),
      causa: values[5]
    });
  }
}

console.log('// TODOS OS REGISTROS DISPONÍVEIS (' + data.length + ' registros)');
console.log('const dadosPlanilha = ' + JSON.stringify(data, null, 2) + ';');
console.log('');
console.log('console.log("Total de registros:", dadosPlanilha.length);');