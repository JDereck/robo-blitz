const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_ALVO = 'https://historicosblaze.com/results/blitz/double';

let ultimoHtml = null;

async function lerResultados() {
    console.log('🔎 A buscar novos resultados...');
    try {
        const { data } = await axios.get(URL_ALVO, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });
        const $ = cheerio.load(data);
        
        // Verifica se há bloqueio de Cloudflare
        if (data.includes('Cloudflare') || data.includes('Just a moment')) {
            console.log('🚨 Bloqueio do Cloudflare detetado!');
            return;
        }

        // Tenta várias classes comuns de histórico
        const ultimoResultado = $('.resultado-item, .roulette-tile, .sm-box, .box-roulette, .entry, .item').first(); 
        
        if (!ultimoResultado.length) {
            console.log('⚠️ Nenhuma caixinha de resultado encontrada. O site deve carregar via JavaScript oculto.');
            return;
        }

        const htmlAtual = ultimoResultado.html();
        const numeroText = ultimoResultado.text().replace(/[^0-9]/g, '');

        if (htmlAtual && htmlAtual !== ultimoHtml && numeroText !== '') {
            ultimoHtml = htmlAtual;
            const idGiro = 'BLITZ-' + Date.now();
            console.log(`✅ Novo giro detetado: ${numeroText}`);
            
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: parseInt(numeroText, 10),
                dataHora: new Date().toISOString()
            });
        } else {
            console.log(`⏳ Nenhum giro novo. Último lido: ${numeroText}`);
        }
    } catch (erro) {
        console.error('❌ Erro na leitura:', erro.message);
    }
}

setInterval(lerResultados, 20000);

app.get('/', (req, res) => res.send('Robô leitor Blitz4 a funcionar 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
