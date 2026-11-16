let tela = canvas_tela;
let pincel = tela.getContext(`2d`);

let CHAO = 270;
let GRAVIDADE = 0.9;
let FORCA_PULO = -15;

let jogador;
let obstaculos;
let velocidade;
let distancia;
let estado;
let quadros;

let recorde = 0;
if (localStorage.getItem(`sterben_recorde_obby`) != null) {
    recorde = Number(localStorage.getItem(`sterben_recorde_obby`));
}
div_recorde.innerHTML = recorde;

function reiniciar() {
    jogador = { x: 90, y: CHAO - 60, largura: 30, altura: 60, velocidadeY: 0, noChao: true };
    obstaculos = [];
    velocidade = 6;
    distancia = 0;
    quadros = 0;
    estado = `jogando`;
}

function pular() {
    if (estado == `parado` || estado == `fim`) {
        reiniciar();
        return;
    }
    if (jogador.noChao) {
        jogador.velocidadeY = FORCA_PULO;
        jogador.noChao = false;
    }
}

function criarObstaculo() {
    let altura = 30 + Math.floor(Math.random() * 3) * 15;
    let largura = 30 + Math.floor(Math.random() * 2) * 30;
    obstaculos.push({ x: tela.width, y: CHAO - altura, largura: largura, altura: altura });
}

function encostou(a, b) {
    return a.x < b.x + b.largura && a.x + a.largura > b.x &&
        a.y < b.y + b.altura && a.y + a.altura > b.y;
}

function atualizar() {
    if (estado != `jogando`) {
        return;
    }
    quadros++;

    jogador.velocidadeY += GRAVIDADE;
    jogador.y += jogador.velocidadeY;
    if (jogador.y >= CHAO - jogador.altura) {
        jogador.y = CHAO - jogador.altura;
        jogador.velocidadeY = 0;
        jogador.noChao = true;
    }

    let ultimo = obstaculos[obstaculos.length - 1];
    if (ultimo == null || ultimo.x < tela.width - (260 + Math.random() * 300)) {
        if (Math.random() < 0.04) {
            criarObstaculo();
        }
    }

    for (let i = 0; i < obstaculos.length; i++) {
        obstaculos[i].x -= velocidade;
        let corpo = { x: jogador.x + 4, y: jogador.y + 4, largura: jogador.largura - 8, altura: jogador.altura - 4 };
        if (encostou(corpo, obstaculos[i])) {
            fimDeJogo();
        }
    }
    let aindaNaTela = [];
    for (let i = 0; i < obstaculos.length; i++) {
        if (obstaculos[i].x + obstaculos[i].largura > 0) {
            aindaNaTela.push(obstaculos[i]);
        }
    }
    obstaculos = aindaNaTela;

    distancia += velocidade / 10;
    velocidade += 0.002;
    div_pontos.innerHTML = Math.floor(distancia);
}

function fimDeJogo() {
    estado = `fim`;
    if (Math.floor(distancia) > recorde) {
        recorde = Math.floor(distancia);
        localStorage.setItem(`sterben_recorde_obby`, recorde);
        div_recorde.innerHTML = recorde;
    }
}

function desenharBoneco(x, y) {
    let corPele = `#F5CD30`;
    pincel.fillStyle = corPele;
    pincel.fillRect(x + 5, y, 20, 18);
    pincel.fillStyle = `#0F0F12`;
    pincel.fillRect(x + 9, y + 6, 3, 3);
    pincel.fillRect(x + 18, y + 6, 3, 3);
    pincel.fillStyle = `#1F6FD1`;
    pincel.fillRect(x, y + 18, 30, 22);
    pincel.fillStyle = corPele;
    let balanco = -4;
    if (jogador.noChao) {
        balanco = Math.sin(quadros / 4) * 3;
    }
    pincel.fillRect(x - 7, y + 19 + balanco, 7, 18);
    pincel.fillRect(x + 30, y + 19 - balanco, 7, 18);
    pincel.fillStyle = `#4CA64C`;
    pincel.fillRect(x + 2, y + 40, 12, 20);
    pincel.fillRect(x + 16, y + 40, 12, 20);
}

function desenhar() {
    pincel.fillStyle = `#16171C`;
    pincel.fillRect(0, 0, tela.width, tela.height);
    pincel.fillStyle = `#2E3038`;
    pincel.fillRect(0, CHAO, tela.width, tela.height - CHAO);
    pincel.fillStyle = `#3A3D47`;
    for (let x = -(distancia * 10 % 60); x < tela.width; x += 60) {
        pincel.fillRect(x, CHAO + 10, 30, 6);
    }

    for (let i = 0; i < obstaculos.length; i++) {
        let o = obstaculos[i];
        pincel.fillStyle = `#E2231A`;
        pincel.fillRect(o.x, o.y, o.largura, o.altura);
        pincel.fillStyle = `#FF8A3D`;
        pincel.fillRect(o.x, o.y, o.largura, 6);
    }

    desenharBoneco(jogador.x, jogador.y);

    pincel.textAlign = `center`;
    pincel.fillStyle = `#F4F4F4`;
    if (estado == `parado`) {
        pincel.font = `bold 30px Chakra Petch, Arial`;
        pincel.fillText(`Aperte ESPAÇO ou clique para começar`, tela.width / 2, 120);
    }
    if (estado == `fim`) {
        pincel.font = `bold 40px Chakra Petch, Arial`;
        pincel.fillText(`Oof!`, tela.width / 2, 100);
        pincel.font = `22px Chakra Petch, Arial`;
        pincel.fillText(`Distância: ${Math.floor(distancia)}  ·  Recorde: ${recorde}`, tela.width / 2, 140);
        pincel.fillText(`Aperte ESPAÇO ou clique para tentar de novo`, tela.width / 2, 180);
    }
}

function quadro() {
    atualizar();
    desenhar();
}

document.onkeydown = function (evento) {
    if (evento.code == `Space` || evento.code == `ArrowUp`) {
        evento.preventDefault();
        pular();
    }
};

reiniciar();
estado = `parado`;
setInterval(quadro, 16);
