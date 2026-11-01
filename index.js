const axios = require('axios');
const express = require('express');
const app = express();

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyU95UPcYF6KHB8YpdogzMvbj5pCRSpf4pddhdyfO92N36e_HFB63DONaNHc-0wz7_E2A/exec';

// 1. URL DA API (Mude para o link da Blitz4 se for o caso)
const URL_API = 'https://blitz4.casino/api/singleplayer-originals/originals/roulette_games/recent/1';

// 2. OS SEUS HEADERS E COOKIES (A chave para furar o bloqueio)
const HEADERS_FALSOS = {
    'accept': 'application/json, text/plain, */*',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    'referer': 'https://blaze.bet.br/pt/games/double',
    
    // IMPORTANTE: Cole os seus cookies todos aqui numa única linha, separados por ponto e vírgula
    'cookie': '_gcl_au=1.1.2102203207.1781728316; _fbp=fb.2.1781728316021.466905658269241325; kwai_uuid=5743d16a5a45b64f04bc56c8fec02bcf;'
};

let check = [];

async function lerResultados() {
    try {
        const { data } = await axios.get(URL_API, { headers: HEADERS_FALSOS });
        
        // Extrai apenas o número "roll" tal como no código Python
        const resultadosAtuais = data.map(item => parseInt(item.roll, 10));

        // Só atualiza quando houver mudança na API
        if (JSON.stringify(resultadosAtuais) !== JSON.stringify(check)) {
            check = [...resultadosAtuais];
            
            const numeroRecente = resultadosAtuais[0];
            const idGiro = 'API-' + Date.now();
            
            console.log(`✅ Novo giro detetado via API: ${numeroRecente}`);
            
            await axios.post(WEBHOOK_URL, {
                id: idGiro,
                numero: numeroRecente,
                dataHora: new Date().toISOString()
            });
        }
    } catch (erro) {
        console.error('❌ Erro na API (Cookies vencidos ou link errado):', erro.message);
    }
}

// Verifica a API a cada 3 segundos
setInterval(lerResultados, 3000);

app.get('/', (req, res) => res.send('Robô da API a funcionar 24h!'));
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
