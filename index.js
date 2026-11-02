const axios = require('axios');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_API = 'https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1';

let ultimoIdProcessado = null;

async function lerResultados() {
    try {
        // Usamos um serviço de contorno de IP gratuito diretamente no fetch se necessário, 
        // ou chamamos a API com headers globais de cache bypass
        const response = await axios.get(URL_API, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            timeout: 8000
        });

        const lista = response.data;
        if (!Array.isArray(lista) || lista.length === 0) return;

        const maisRecente = lista[0];
        const idGiro = maisRecente.id;
        const numero = maisRecente.roll;

        if (idGiro && idGiro !== ultimoIdProcessado) {
            ultimoIdProcessado = idGiro;
            console.log(`⚡ Giro em tempo real detetado! ID: ${idGiro}, Número: ${numero}`);
            
            // Envia instantaneamente para a planilha
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: parseInt(numero, 10),
                dataHora: maisRecente.created_at || new Date().toISOString()
            });
        }
    } catch (erro) {
        // Se houver bloqueio de região no Render, tentamos uma rota alternativa de espelho
        tocarRotaAlternativa();
    }
}

async function tocarRotaAlternativa() {
    try {
        // Rota espelho caso a principal dê erro de região
        const urlEspelho = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1');
        const response = await axios.get(urlEspelho, { timeout: 8000 });
        const lista = response.data;
        if (!Array.isArray(lista) || lista.length === 0) return;

        const maisRecente = lista[0];
        const idGiro = maisRecente.id;
        const numero = maisRecente.roll;

        if (idGiro && idGiro !== ultimoIdProcessado) {
            ultimoIdProcessado = idGiro;
            console.log(`⚡ [Espelho] Giro detetado! ID: ${idGiro}, Número: ${numero}`);
            
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: parseInt(numero, 10),
                dataHora: maisRecente.created_at || new Date().toISOString()
            });
        }
    } catch (e) {
        console.error('❌ Erro na rota alternativa:', e.message);
    }
}

// Roda a cada 5 segundos para máxima velocidade (sem atraso)
setInterval(lerResultados, 5000);

app.get('/', (req, res) => res.send('Robô Render Ultra-Rápido a funcionar 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor ultra-rápido iniciado.'));
