const axios = require('axios');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_API = 'https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1';

let ultimoIdProcessado = null;

async function lerResultados() {
    console.log('🔎 A consultar a API do Blitz4...');
    try {
        const response = await axios.get(URL_API, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        const lista = response.data;
        if (!Array.isArray(lista) || lista.length === 0) {
            console.log('⚠️ API vazia ou formato inesperado.');
            return;
        }

        // Pega o jogo mais recente (o primeiro da lista)
        const maisRecente = lista[0];
        const idGiro = maisRecente.id;
        const numero = maisRecente.roll;

        if (idGiro && idGiro !== ultimoIdProcessado) {
            ultimoIdProcessado = idGiro;
            console.log(`✅ Novo giro detetado via API! ID: ${idGiro}, Número: ${numero}`);
            
            // Envia para o Webhook da Planilha
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

// Consulta a cada 15 segundos
setInterval(lerResultados, 15000);

app.get('/', (req, res) => res.send('Robô API Blitz4 a funcionar 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
