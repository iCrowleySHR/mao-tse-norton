const telaInicial = document.getElementById("telaInicial");
const musica = document.getElementById("musica");

telaInicial.addEventListener("click", () => {

    // Começa as animações
    document.body.classList.add("playing");

    // Esconde a tela inicial
    telaInicial.style.display = "none";

    // Lista de músicas
    const musicas = [
        "./msc/duran.mp3",
        "./msc/china.mp3"
    ];

    // Escolhe uma música aleatoriamente
    const musicaAleatoria = musicas[Math.floor(Math.random() * musicas.length)];

    // Define a música escolhida
    musica.src = musicaAleatoria;

    // Começa a música
    musica.play();

});

