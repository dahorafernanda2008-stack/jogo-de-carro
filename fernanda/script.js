
const canvas = document.getElementById("pista");
const ctx = canvas.getContext("2d");

// Elementos da tela
const pontosTexto = document.getElementById("pontos");
const velocidadeTexto = document.getElementById("velocidade");
const recordeTexto = document.getElementById("recorde");

const telaInicial = document.getElementById("telaInicial");
const telaFinal = document.getElementById("telaFinal");
const telaPausa = document.getElementById("telaPausa");

const botaoJogar = document.getElementById("botaoJogar");
const botaoReiniciar = document.getElementById("botaoReiniciar");
const botaoPausar = document.getElementById("pausar");
const botaoContinuar = document.getElementById("botaoContinuar");

// Configurações da pista
const larguraPista = 400;
const alturaPista = 600;
const centroFaixas = [100, 200, 300];

let jogador;
let obstaculos = [];
let pontos = 0;
let velocidade = 4;
let contadorFrames = 0;
let movimentoPista = 0;

let estado = "inicio";
let recorde = 0;

// Recupera o recorde salvo no navegador
try {
    recorde = Number(localStorage.getItem("recordeTurbo")) || 0;
} catch (erro) {
    recorde = 0;
}

recordeTexto.textContent = recorde;

// Desenha um carro
function desenharCarro(x, y, cor, jogadorPrincipal = false) {
    ctx.save();

    // Rodas
    ctx.fillStyle = "#111111";
    ctx.fillRect(x - 4, y + 10, 7, 18);
    ctx.fillRect(x + 33, y + 10, 7, 18);
    ctx.fillRect(x - 4, y + 48, 7, 18);
    ctx.fillRect(x + 33, y + 48, 7, 18);

    // Corpo do carro
    ctx.fillStyle = cor;
    ctx.fillRect(x, y, 36, 70);

    // Para-brisa dianteiro
    ctx.fillStyle = "#9ee7ff";
    ctx.fillRect(x + 5, y + 10, 26, 15);

    // Para-brisa traseiro
    ctx.fillStyle = "#8bd5ee";
    ctx.fillRect(x + 6, y + 43, 24, 12);

    // Detalhes laterais
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(x + 2, y + 28, 3, 9);
    ctx.fillRect(x + 31, y + 28, 3, 9);

    // Faróis ou lanternas
    if (jogadorPrincipal) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 3, y + 2, 8, 5);
        ctx.fillRect(x + 25, y + 2, 8, 5);
    } else {
        ctx.fillStyle = "#ff2222";
        ctx.fillRect(x + 3, y + 62, 8, 5);
        ctx.fillRect(x + 25, y + 62, 8, 5);
    }

    ctx.restore();
}

// Desenha a estrada e as faixas
function desenharPista() {
    // Grama
    ctx.fillStyle = "#218c43";
    ctx.fillRect(0, 0, larguraPista, alturaPista);

    // Estrada
    ctx.fillStyle = "#383838";
    ctx.fillRect(40, 0, 320, alturaPista);

    // Bordas da pista
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(40, 0, 5, alturaPista);
    ctx.fillRect(355, 0, 5, alturaPista);

    // Linhas tracejadas
    ctx.fillStyle = "#ffffff";

    for (let y = -60; y < alturaPista; y += 100) {
        const posicaoY = y + movimentoPista;

        ctx.fillRect(146, posicaoY, 5, 50);
        ctx.fillRect(249, posicaoY, 5, 50);
    }

    // Detalhes na grama
    ctx.fillStyle = "#35b957";

    for (let y = 20; y < alturaPista; y += 80) {
        ctx.fillRect(12, (y + movimentoPista * 0.5) % alturaPista, 12, 20);
        ctx.fillRect(375, (y + movimentoPista * 0.5) % alturaPista, 12, 20);
    }
}

// Reinicia os dados da partida
function prepararJogo() {
    jogador = {
        faixa: 1,
        x: centroFaixas[1] - 18,
        y: 490,
        largura: 36,
        altura: 70
    };

    obstaculos = [];
    pontos = 0;
    velocidade = 4;
    contadorFrames = 0;
    movimentoPista = 0;

    atualizarPainel();
}

// Atualiza os números na tela
function atualizarPainel() {
    pontosTexto.textContent = pontos;
    velocidadeTexto.textContent = Math.floor(velocidade);
    recordeTexto.textContent = recorde;
}

// Cria carros obstáculos
function criarObstaculo() {
    const faixa = Math.floor(Math.random() * 3);

    // Evita criar dois carros quase juntos na mesma faixa
    const faixaOcupada = obstaculos.some(obstaculo =>
        obstaculo.faixa === faixa && obstaculo.y < 140
    );

    if (faixaOcupada) return;

    const cores = [
        "#ff3333",
        "#2196f3",
        "#ff9800",
        "#bd55ff",
        "#f5f5f5"
    ];

    obstaculos.push({
        faixa: faixa,
        x: centroFaixas[faixa] - 18,
        y: -80,
        largura: 36,
        altura: 70,
        cor: cores[Math.floor(Math.random() * cores.length)]
    });
}

// Verifica se dois carros se encostaram
function houveColisao(a, b) {
    const margem = 7;

    return (
        a.x + margem < b.x + b.largura - margem &&
        a.x + a.largura - margem > b.x + margem &&
        a.y + margem < b.y + b.altura - margem &&
        a.y + a.altura - margem > b.y + margem
    );
}

// Move os carros e verifica as colisões
function atualizarJogo() {
    contadorFrames++;
    movimentoPista = (movimentoPista + velocidade) % 100;

    // Aumenta a dificuldade com o tempo
    velocidade = Math.min(4 + pontos / 150, 12);

    // Cria obstáculos em intervalos
    const intervalo = Math.max(35, 85 - Math.floor(pontos / 20));

    if (contadorFrames % intervalo === 0) {
        criarObstaculo();
    }

    // Move os obstáculos
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        const obstaculo = obstaculos[i];

        obstaculo.y += velocidade;

        // Conta pontos quando o carro passa
        if (obstaculo.y > alturaPista) {
            obstaculos.splice(i, 1);
            pontos += 10;
            continue;
        }

        // Verifica colisão
        if (houveColisao(jogador, obstaculo)) {
            finalizarJogo();
            return;
        }
    }

    // Atualiza o painel de informações
    atualizarPainel();
}

// Desenha tudo na tela
function desenharJogo() {
    desenharPista();

    // Desenha obstáculos
    obstaculos.forEach(obstaculo => {
        desenharCarro(
            obstaculo.x,
            obstaculo.y,
            obstaculo.cor
        );
    });

    // Desenha o jogador
    if (jogador) {
        desenharCarro(jogador.x, jogador.y, "#00c8ff", true);
    }
}

// Inicia uma partida
function iniciarJogo() {
    prepararJogo();
    estado = "jogando";

    telaInicial.classList.add("escondido");
    telaFinal.classList.add("escondido");
    telaPausa.classList.add("escondido");

    botaoPausar.textContent = "⏸️ Pausar";
}

// Finaliza quando há uma colisão
function finalizarJogo() {
    estado = "fim";

    if (pontos > recorde) {
        recorde = pontos;

        try {
            localStorage.setItem("recordeTurbo", recorde);
        } catch (erro) {
            // O jogo continua mesmo se o navegador bloquear o salvamento.
        }
    }

    atualizarPainel();

    document.getElementById("pontosFinais").textContent = pontos;
    telaFinal.classList.remove("escondido");
}

// Move o jogador entre as faixas
function moverJogador(direcao) {
    if (estado !== "jogando") return;

    jogador.faixa += direcao;

    // Impede sair dos limites da pista
    jogador.faixa = Math.max(0, Math.min(2, jogador.faixa));

    jogador.x = centroFaixas[jogador.faixa] - 18;
}

// Pausa ou continua a partida
function alternarPausa() {
    if (estado === "jogando") {
        estado = "pausado";
        telaPausa.classList.remove("escondido");
        botaoPausar.textContent = "▶️ Continuar";
    } else if (estado === "pausado") {
        estado = "jogando";
        telaPausa.classList.add("escondido");
        botaoPausar.textContent = "⏸️ Pausar";
    }
}

// Controles pelo teclado
document.addEventListener("keydown", function(evento) {
    if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(evento.key)
    ) {
        evento.preventDefault();
    }

    if (evento.key === "ArrowLeft" || evento.key.toLowerCase() === "a") {
        moverJogador(-1);
    }

    if (evento.key === "ArrowRight" || evento.key.toLowerCase() === "d") {
        moverJogador(1);
    }

    if (evento.key === " " && !evento.repeat) {
        alternarPausa();
    }
});

// Botões da tela
botaoJogar.addEventListener("click", iniciarJogo);
botaoReiniciar.addEventListener("click", iniciarJogo);
botaoPausar.addEventListener("click", alternarPausa);
botaoContinuar.addEventListener("click", alternarPausa);

// Controles para celular e mouse
document.getElementById("esquerda").addEventListener("click", () => {
    moverJogador(-1);
});

document.getElementById("direita").addEventListener("click", () => {
    moverJogador(1);
});

// Loop principal do jogo
function loop() {
    if (estado === "jogando") {
        atualizarJogo();
    }

    desenharJogo();
    requestAnimationFrame(loop);
}

// Desenha a tela inicial
prepararJogo();
desenharJogo();
loop();
