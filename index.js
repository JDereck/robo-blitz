const axios = require('axios');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_API = 'https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1';

let ultimoIdProcessado = null;

async function lerResultados() {
    console.log('🔎 A consultar a API do Blitz4 com cabeçalhos de navegador...');
    try {
        const response = await axios.get(URL_API, {
            headers: { 
                'Host': 'blitz4.casino',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://blitz4.casino/pt/games/double',
                'Origin': 'https://blitz4.casino',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"'
            }
        });

        const lista = response.data;
        if (!Array.isArray(lista) || lista.length === 0) {
            console.log('⚠️ API vazia ou formato inesperado.');
            return;
        }

        const maisRecente = lista[0];
        const idGiro = maisRecente.id;
        const numero = maisRecente.roll;

        if (idGiro && idGiro !== ultimoIdProcessado) {
            ultimoIdProcessado = idGiro;
            console.log(`✅ Sucesso! Novo giro detetado: ID ${idGiro}, Número ${numero}`);
            
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: parseInt(numero, 10),
                dataHora: maisRecente.created_at || new Date().toISOString()
            });
        } else {
            console.log(`⏳ Nenhum giro novo. Último ID visto: ${idGiro}`);
        }
    } catch (erro) {
        console.error('❌ Erro ao consultar API:', erro.response ? `${erro.response.status} - ${JSON.stringify(erro.response.data)}` : erro.message);
    }
}

setInterval(lerResultados, 15000);

app.get('/', (req, res) => res.send('Robô API Blitz4 a funcionar 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
