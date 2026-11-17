let JOGOS_EXEMPLO = {
    1: { id: 1, nome: `Ninja Assassin`, placeId: 1, jogando: 120, visitas: 98000000, icone: `img/jogo-padrao.svg` },
    2: { id: 2, nome: `Swordburst 2`, placeId: 2, jogando: 850, visitas: 420000000, icone: `img/jogo-padrao.svg` },
    3: { id: 3, nome: `Retail Tycoon`, placeId: 3, jogando: 300, visitas: 180000000, icone: `img/jogo-padrao.svg` },
    4: { id: 4, nome: `Survive the Disasters`, placeId: 4, jogando: 60, visitas: 75000000, icone: `img/jogo-padrao.svg` },
    5: { id: 5, nome: `Something Evil Will Happen`, placeId: 5, jogando: 40, visitas: 30000000, icone: `img/jogo-padrao.svg` },
    6: { id: 6, nome: `Deathrun`, placeId: 6, jogando: 900, visitas: 600000000, icone: `img/jogo-padrao.svg` },
    7: { id: 7, nome: `Natural Disaster Survival`, placeId: 7, jogando: 5200, visitas: 2500000000, icone: `img/jogo-padrao.svg` },
    8: { id: 8, nome: `Work at a Pizza Place`, placeId: 8, jogando: 4100, visitas: 3000000000, icone: `img/jogo-padrao.svg` }
};

function criarEmblemasExemplo() {
    let nomes = [`Bem-vindo!`, `Primeira vitória`, `Veterano`, `Sobrevivente`, `Chefe derrotado`,
        `Colecionador`, `Explorador`, `Mestre`, `Segredo encontrado`, `Lenda`];
    let lista = [];
    for (let i = 0; i < 48; i++) {
        let jogoId = (i % 8) + 1;
        let ano = 2017 + Math.floor(i / 6);
        let mes = (i * 5) % 12;
        let divisor = 1;
        if (i % 3 == 0) {
            divisor = 7;
        }
        let raridade = Number((((i * 37) % 100) / divisor + 0.3).toFixed(1));
        lista.push({
            id: 1000 + i,
            nome: `${nomes[i % nomes.length]} ${Math.floor(i / 10) + 1}`,
            descricao: `Emblema de exemplo do jogo ${JOGOS_EXEMPLO[jogoId].nome}.`,
            data: new Date(ano, mes, 1 + (i % 27)).toISOString(),
            raridade: raridade,
            conquistados: Math.round(raridade * 15000 + 300),
            jogoId: jogoId,
            jogoNome: JOGOS_EXEMPLO[jogoId].nome,
            icone: `img/sterben-emblema.svg`
        });
    }
    lista.sort(function (a, b) { return new Date(b.data) - new Date(a.data); });
    return lista;
}

function criarAmigosExemplo() {
    let lista = [];
    let nomes = [`Bacon_Ninja`, `NoobMestre`, `PizzaGuy2017`, `Sobrevivente_X`, `Tycoon_King`,
        `DeathrunPro`, `Guest_666`, `LendaAntiga`, `Swordsman_02`, `OldRobloxFan`];
    for (let i = 0; i < nomes.length; i++) {
        lista.push({ id: 500 + i, nome: nomes[i], apelido: nomes[i].replace(`_`, ` `), foto: `img/baconpfp.jpg` });
    }
    return lista;
}

let DADOS_EXEMPLO = {
    usuario: {
        id: 388413545,
        nome: `Sterben`,
        apelido: `Sterben`,
        descricao: `Jogando desde 2017. (descrição de exemplo)`,
        criado: `2017-01-15T12:00:00Z`,
        banido: false,
        verificado: false,
        foto: `img/baconpfp.jpg`,
        avatar: `img/avatar-padrao.svg`,
        amigos: 87,
        seguidores: 54,
        seguindo: 23,
        insigniasRoblox: [
            { nome: `Veteran`, descricao: `Membro há pelo menos um ano.`, imagem: `img/sterben-emblema.svg` },
            { nome: `Friendship`, descricao: `Fez 20 amigos.`, imagem: `img/sterben-emblema.svg` },
            { nome: `Homestead`, descricao: `Recebeu 100 visitas no próprio lugar.`, imagem: `img/sterben-emblema.svg` }
        ],
        nomesAntigos: [`SterbenBR`, `Sterben_2017`],
        grupos: [
            { id: 1, nome: `Comunidade Ninja Assassin`, membros: 120000, cargo: `Membro` },
            { id: 2, nome: `Swordburst Fans`, membros: 450000, cargo: `Membro` },
            { id: 3, nome: `Old Roblox Lovers`, membros: 8000, cargo: `Veterano` }
        ]
    },

    amigos: { total: 87, amigos: criarAmigosExemplo() },

    favoritos: {
        jogos: [JOGOS_EXEMPLO[3], JOGOS_EXEMPLO[2], JOGOS_EXEMPLO[5], JOGOS_EXEMPLO[1], JOGOS_EXEMPLO[6], JOGOS_EXEMPLO[4]]
    },

    emblemas: { total: 48, temMais: false, primeiraData: `2017-01-01T00:00:00Z`, ultimaData: `2024-12-17T00:00:00Z`, emblemas: criarEmblemasExemplo(), jogos: JOGOS_EXEMPLO },

    inventario: {
        podeVer: true,
        limitados: [
            { id: 1, nome: `Domino Crown (exemplo)`, serial: null, rap: 4200000, precoOriginal: null, imagem: `img/jogo-padrao.svg` },
            { id: 2, nome: `Bombastic Bandana (exemplo)`, serial: 312, rap: 15400, precoOriginal: 5000, imagem: `img/jogo-padrao.svg` },
            { id: 3, nome: `Classic Fedora (exemplo)`, serial: null, rap: 3900, precoOriginal: 1000, imagem: `img/jogo-padrao.svg` },
            { id: 4, nome: `Noob Attack Headphones (exemplo)`, serial: 1450, rap: 860, precoOriginal: 1200, imagem: `img/jogo-padrao.svg` }
        ],
        visual: [
            { id: 11, nome: `Bacon Hair`, preco: 0, aVenda: false, limitado: false, tipo: 41, criador: `Roblox`, imagem: `img/baconpfp.jpg` },
            { id: 12, nome: `Camisa Sterben (exemplo)`, preco: 5, aVenda: true, limitado: false, tipo: 11, criador: `Sterben`, imagem: `img/jogo-padrao.svg` },
            { id: 13, nome: `Calça preta (exemplo)`, preco: 5, aVenda: true, limitado: false, tipo: 12, criador: `Loja X`, imagem: `img/jogo-padrao.svg` },
            { id: 14, nome: `Rosto clássico`, preco: null, aVenda: false, limitado: false, tipo: 18, criador: `Roblox`, imagem: `img/face.png` },
            { id: 15, nome: `Espada nas costas (exemplo)`, preco: 150, aVenda: true, limitado: false, tipo: 47, criador: `Loja Y`, imagem: `img/jogo-padrao.svg` }
        ],
        rolimons: { valor: 4500000, rap: 4220460 },
        totalItens: 812,
        temMaisItens: false,
        totalPasses: 37,
        porTipo: { 'Chapéus': 210, 'Camisas clássicas': 140, 'Calças clássicas': 118, 'Rostos': 46, 'Cabelos': 61, 'Emotes': 22, 'Animações': 70, 'Equipamentos (gears)': 35, 'Costas': 44, 'Lugares': 9 },
        porAno: { 2017: 160, 2018: 210, 2019: 130, 2020: 95, 2021: 70, 2022: 60, 2023: 44, 2024: 28, 2025: 10, 2026: 5 },
        ultimos: [
            { id: 21, nome: `Item recente 1 (exemplo)`, criador: `Loja X`, tipo: `Chapéus`, data: `2026-10-20T00:00:00Z`, imagem: `img/jogo-padrao.svg` },
            { id: 22, nome: `Item recente 2 (exemplo)`, criador: `Roblox`, tipo: `Emotes`, data: `2026-09-02T00:00:00Z`, imagem: `img/jogo-padrao.svg` },
            { id: 23, nome: `Item recente 3 (exemplo)`, criador: `Loja Y`, tipo: `Camisas clássicas`, data: `2026-06-11T00:00:00Z`, imagem: `img/jogo-padrao.svg` }
        ],
        maisAntigo: { id: 20, nome: `Primeiro item (exemplo)`, criador: `Roblox`, tipo: `Chapéus`, data: `2017-01-15T00:00:00Z`, imagem: `img/jogo-padrao.svg` },
        avatar: {
            imagem: `img/avatar-padrao.svg`,
            tipo: `R15`,
            cores: { headColor3: `F5CD30`, torsoColor3: `1F6FD1`, rightArmColor3: `F5CD30`, leftArmColor3: `F5CD30`, rightLegColor3: `4CA64C`, leftLegColor3: `4CA64C` },
            escala: { height: 1, width: 1, head: 1 },
            emotes: [{ nome: `Dança (exemplo)`, posicao: 1 }, { nome: `Acenar (exemplo)`, posicao: 2 }]
        },
        roupas: [
            { id: 1, nome: `Visual 2017 (exemplo)`, imagem: `img/avatar-padrao.svg` },
            { id: 2, nome: `Ninja (exemplo)`, imagem: `img/avatar-padrao.svg` },
            { id: 3, nome: `Bacon clássico (exemplo)`, imagem: `img/avatar-padrao.svg` }
        ]
    },

    busca: {
        resultados: [
            { id: 388413545, nome: `Sterben`, apelido: `Sterben`, foto: `img/baconpfp.jpg`, exato: true },
            { id: 501, nome: `NoobMestre`, apelido: `Noob Mestre`, foto: `img/baconpfp.jpg` },
            { id: 502, nome: `PizzaGuy2017`, apelido: `Pizza Guy`, foto: `img/baconpfp.jpg` }
        ]
    }
};
