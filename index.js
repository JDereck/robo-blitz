const axios = require('axios');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_API = 'https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1';

let ultimoIdProcessado = null;

async function lerResultados() {
    try {
        const response = await axios.get(URL_API, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 8000
        });

        const lista = response.data;
        if (!Array.isArray(lista) || lista.length === 0) return;

        const maisRecente = lista[0];
        const idGiro = maisRecente.id;
        const numero = maisRecente.roll;

        if (idGiro && idGiro !== ultimoIdProcessado) {
            ultimoIdProcessado = idGiro;
            console.log(`⚡ SUCESSO! Giro em tempo real: ${numero}`);
            
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: parseInt(numero, 10),
                dataHora: maisRecente.created_at || new Date().toISOString()
            });
        }
    } catch (erro) {
        console.error('❌ Erro:', erro.response ? erro.response.status : erro.message);
    }
}

setInterval(lerResultados, 5000);
app.get('/', (req, res) => res.send('Robô Blitz Europa 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
