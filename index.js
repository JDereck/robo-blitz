const axios = require('axios');
const express = require('express');

const app = express();
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';
const URL_API = 'https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1';

let ultimoIdProcessado = null;
let buscandoDados = false; // TRAVA: impede o acúmulo de requisições simultâneas

async function lerResultados() {
    // Se o bot ainda estiver processando a chamada anterior, ele ignora esta rodada
    if (buscandoDados) return; 
    buscandoDados = true;

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
            
            // Adicionado timeout de 10s para evitar travamento caso o Google Sheets demore
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: parseInt(numero, 10),
                dataHora: maisRecente.created_at || new Date().toISOString()
            }, { timeout: 10000 }); 
        }
    } catch (erro) {
        console.error('❌ Erro:', erro.response ? erro.response.status : erro.message);
    } finally {
        // Libera a trava para a próxima checagem
        buscandoDados = false; 
    }
}

setInterval(lerResultados, 5000);

// Mantém o bot acordado para o Cron-job
app.get('/', (req, res) => res.send('Robô Blitz Europa 24h!'));

// Rota vital para o Render reiniciar o bot automaticamente se ele travar
app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
