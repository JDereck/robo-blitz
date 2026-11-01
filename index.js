const axios = require('axios');
const cheerio = require('cheerio');

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_ALVO = 'https://historicosblaze.com/results/blitz/double';

let ultimoIdProcessado = null;

async function lerResultados() {
    try {
        const { data } = await axios.get(URL_ALVO, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        const $ = cheerio.load(data);
        // Ajustaremos o seletor exato na fase de testes, caso o site mude
        const ultimoResultado = $('.resultado-item').first(); 
        
        if (!ultimoResultado.length) return;

        const numero = ultimoResultado.text().trim();
        const idGiro = 'BLITZ-' + Date.now(); // ID provisório para evitar duplicidade rápida
        
        if (numero && idGiro !== ultimoIdProcessado) {
            ultimoIdProcessado = idGiro;
            console.log(`Novo giro detectado: ${numero}`);
            
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: parseInt(numero, 10),
                dataHora: new Date().toISOString()
            });
        }
    } catch (erro) {
        console.error('Erro na leitura:', erro.message);
    }
}

// Roda a cada 20 segundos para não bloquear a nuvem
setInterval(lerResultados, 20000);
console.log('Robô leitor iniciado...');
