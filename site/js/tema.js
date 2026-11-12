// ===== BOTÃO "MODO 2017" =====
// Liga e desliga a classe "modo-2017" no <body>.
// O CSS troca as cores quando essa classe existe.

const botao2017 = document.querySelector('.btn-2017');

// Se o usuário já tinha ligado o modo antes, liga de novo ao abrir a página
if (localStorage.getItem('modo2017') == 'sim') {
    document.body.classList.add('modo-2017');
    botao2017.innerHTML = 'Modo Sterben';
}

botao2017.addEventListener('click', function () {
    document.body.classList.toggle('modo-2017');

    if (document.body.classList.contains('modo-2017')) {
        botao2017.innerHTML = 'Modo Sterben';
        localStorage.setItem('modo2017', 'sim');
    } else {
        botao2017.innerHTML = 'Modo 2017';
        localStorage.setItem('modo2017', 'nao');
    }
});
