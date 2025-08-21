const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh0-QDFODgxFhQoUy7HFKrQ1PswMM5l80",
  authDomain: "painel-master-salvador.firebaseapp.com",
  projectId: "painel-master-salvador",
  storageBucket: "painel-master-salvador.firebasestorage.app",
  messagingSenderId: "710076982580",
  appId: "1:710076982580:web:bdcf6e15067fda6c4b1c1b",
  measurementId: "G-VSKFGRXB3H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDuplicates() {
  try {
    console.log('Buscando dados de vendas...');
    const snapshot = await getDocs(collection(db, 'vendas_motos'));
    const vendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Total de registros: ${vendas.length}`);
    
    // Criar chave única para cada registro baseada em campos importantes
    const recordMap = new Map();
    const duplicates = [];
    
    vendas.forEach(venda => {
      // Criar chave única combinando data, CNPJ, quantidade, marca, modelo e valor
      const key = `${venda.data_compra}_${venda.cnpj}_${venda.quantidade}_${venda.marca}_${venda.modelo}_${venda.valor_total}`;
      
      if (recordMap.has(key)) {
        // Encontrou duplicata
        duplicates.push({
          key,
          original: recordMap.get(key),
          duplicate: venda
        });
      } else {
        recordMap.set(key, venda);
      }
    });
    
    console.log(`\nDuplicatas encontradas: ${duplicates.length}`);
    
    if (duplicates.length > 0) {
      console.log('\n=== RELATÓRIO DE DUPLICATAS ===');
      
      duplicates.forEach((dup, index) => {
        console.log(`\nDuplicata ${index + 1}:`);
        console.log(`Data: ${dup.original.data_compra}`);
        console.log(`CNPJ: ${dup.original.cnpj}`);
        console.log(`Razão Social: ${dup.original.razao_social}`);
        console.log(`Quantidade: ${dup.original.quantidade}`);
        console.log(`Marca/Modelo: ${dup.original.marca} ${dup.original.modelo}`);
        console.log(`Valor Total: R$ ${dup.original.valor_total?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
        console.log(`ID Original: ${dup.original.id}`);
        console.log(`ID Duplicata: ${dup.duplicate.id}`);
        console.log('---');
      });
      
      // Agrupar por chave para ver quantas duplicatas de cada tipo
      const duplicateGroups = new Map();
      duplicates.forEach(dup => {
        if (duplicateGroups.has(dup.key)) {
          duplicateGroups.get(dup.key).push(dup);
        } else {
          duplicateGroups.set(dup.key, [dup]);
        }
      });
      
      console.log('\n=== RESUMO POR GRUPO ===');
      duplicateGroups.forEach((group, key) => {
        console.log(`Chave: ${key.substring(0, 50)}...`);
        console.log(`Número de duplicatas: ${group.length + 1} registros`); // +1 para incluir o original
      });
      
      // Calcular impacto nos totais
      let duplicateRevenue = 0;
      let duplicateQuantity = 0;
      
      duplicates.forEach(dup => {
        duplicateRevenue += dup.duplicate.valor_total || 0;
        duplicateQuantity += dup.duplicate.quantidade || 0;
      });
      
      console.log('\n=== IMPACTO NOS TOTAIS ===');
      console.log(`Receita duplicada: R$ ${duplicateRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log(`Quantidade duplicada: ${duplicateQuantity} motos`);
      
      // Calcular totais corretos (sem duplicatas)
      const totalRevenue = vendas.reduce((sum, venda) => sum + (venda.valor_total || 0), 0);
      const totalQuantity = vendas.reduce((sum, venda) => sum + (venda.quantidade || 0), 0);
      
      console.log('\n=== TOTAIS ATUAIS (COM DUPLICATAS) ===');
      console.log(`Receita total: R$ ${totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log(`Quantidade total: ${totalQuantity} motos`);
      
      console.log('\n=== TOTAIS CORRETOS (SEM DUPLICATAS) ===');
      console.log(`Receita correta: R$ ${(totalRevenue - duplicateRevenue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
      console.log(`Quantidade correta: ${totalQuantity - duplicateQuantity} motos`);
      
    } else {
      console.log('\nNenhuma duplicata encontrada! ✅');
    }
    
  } catch (error) {
    console.error('Erro ao verificar duplicatas:', error);
  }
}

checkDuplicates();