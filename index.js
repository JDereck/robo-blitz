const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_ALVO = 'https://historicosblaze.com/results/blitz/double';

let ultimoHtml = null;

async function lerResultados() {
    try {
        const { data } = await axios.get(URL_ALVO, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const $ = cheerio.load(data);
        
        const ultimoResultado = $('.resultado-item').first(); 
        if (!ultimoResultado.length) return;

        const htmlAtual = ultimoResultado.html();
        const numeroText = ultimoResultado.text().replace(/[^0-9]/g, '');

        if (htmlAtual && htmlAtual !== ultimoHtml && numeroText !== '') {
            ultimoHtml = htmlAtual;
            const idGiro = 'BLITZ-' + Date.now();
            console.log(`Novo giro detectado: ${numeroText}`);
            
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: parseInt(numeroText, 10),
                dataHora: new Date().toISOString()
            });
        }
    } catch (erro) {
        console.error('Erro na leitura:', erro.message);
    }
}

setInterval(lerResultados, 20000);

app.get('/', (req, res) => res.send('Robô leitor Blitz4 funcionando 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
