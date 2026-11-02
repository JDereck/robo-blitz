const axios = require('axios');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_API = 'https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1';

let ultimoGiroId = null;

async function lerResultadosApi() {
    try {
        const response = await axios.get(URL_API, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            timeout: 10000
        });

        const itens = response.data;
        if (!Array.isArray(itens) || itens.length === 0) return;

        // O primeiro item da lista é o giro mais recente
        const maisRecente = itens[0];
        const idGiro = maisRecente.id;
        const numero = parseInt(maisRecente.roll, 10);

        // Se for um ID novo que ainda não processamos
        if (idGiro && idGiro !== ultimoGiroId) {
            ultimoGiroId = idGiro;
            console.log(`✅ Novo giro detetado na API Blitz4: ID ${idGiro}, Número ${numero}`);

            // Envia para a planilha via Webhook
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: numero,
                dataHora: maisRecente.created_at || new Date().toISOString()
            });
        }
    } catch (erro) {
        console.error('❌ Erro ao consultar a API da Blitz4:', erro.message);
    }
}

// Consulta a API a cada 3 segundos (muito mais rápido e seguro que scraping)
setInterval(lerResultadosApi, 3000);

app.get('/', (req, res) => res.send('Robô API Blitz4 a funcionar 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
