const axios = require('axios');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
// Usamos um proxy CORS/geohub público e gratuito para mascarar o servidor dos EUA
const URL_API = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1');

let ultimoIdProcessado = null;

async function lerResultados() {
    console.log('🔎 A consultar a API via Proxy...');
    try {
        const response = await axios.get(URL_API, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
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
        console.error('❌ Erro ao consultar API:', erro.message);
    }
}

setInterval(lerResultados, 15000);

app.get('/', (req, res) => res.send('Robô API Proxy Blitz4 a funcionar 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
