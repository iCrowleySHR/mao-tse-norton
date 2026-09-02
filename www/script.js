// ======================================================
// ELEMENTOS
// ======================================================

const telaInicial = document.getElementById("telaInicial");
const player = document.getElementById("player");
const musica = document.getElementById("musica");
const audioStatus = document.getElementById("audioStatus");

const btnPlayPause = document.getElementById("btnPlayPause");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnStop = document.getElementById("btnStop");

const progressBar = document.getElementById("progressBar");
const volumeControl = document.getElementById("volumeControl");

const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");

const musicTitle = document.getElementById("musicTitle");
const musicSource = document.getElementById("musicSource");

const playlistItems = document.getElementById("playlistItems");

const btnTogglePlaylist =
    document.getElementById("btnTogglePlaylist");

const playlist =
    document.getElementById("playlist");

const btnAddMusic =
    document.getElementById("btnAddMusic");

const btnClearPlaylist =
    document.getElementById("btnClearPlaylist");

const fileInput =
    document.getElementById("fileInput");

const btnLoadPreset1 =
    document.getElementById("btnLoadPreset1");

const btnLoadPreset2 =
    document.getElementById("btnLoadPreset2");


// ======================================================
// VARIÁVEIS
// ======================================================

let playlistArray = [];
let currentIndex = 0;

let isPlaying = false;
let isRadio = false;

let hls = null;

let nowPlayingInterval = null;


// ======================================================
// CONFIGURAÇÃO DAS RÁDIOS
// ======================================================

const RADIOS = {

    kiss: {

        title: "📻 Kiss FM",

        stream:
            "https://24413.live.streamtheworld.com/RADIO_KISSFM_ADP/HLS/playlist.m3u8",

        nowPlaying:
            "https://np.tritondigital.com/public/nowplaying?mountName=RADIO_KISSFM&numberToFetch=1"

    },


    aspen: {

        title: "📻 Aspen FM",

        stream:
            "https://24283.live.streamtheworld.com/ASPENAAC.aac",

        nowPlaying:
            "https://np.tritondigital.com/public/nowplaying?mountName=ASPEN&numberToFetch=1"

    },

    maoTseNorton: {
        title: "📻 Mao Tse Norton",
        stream:
            "https://morcast.caster.fm:19111/r70CY?token=d2bb83708667cfa9a7908c9dc245faeb"
    }

};


// ======================================================
// PRESETS
// ======================================================

const PRESETS = {

    classicas: [

        {
            title: "Duran Duran",
            src: "./msc/duran.mp3"
        },

        {
            title: "China",
            src: "./msc/china.mp3"
        }

    ],


    radio: [

        {
            title: RADIOS.kiss.title,

            src: RADIOS.kiss.stream,

            isRadio: true,

            radioId: "kiss"

        },

        {
            title: RADIOS.aspen.title,

            src: RADIOS.aspen.stream,

            isRadio: true,

            radioId: "aspen"

        },

        {
            title: RADIOS.maoTseNorton.title,
            src: RADIOS.maoTseNorton.stream,
            isRadio: true,
            radioId: "maoTseNorton"
        }

    ]

};


// ======================================================
// FORMATAR TEMPO
// ======================================================

function formatTime(seconds) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";

    }


    const mins =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);


    return `${mins}:${secs
        .toString()
        .padStart(2, "0")}`;

}


// ======================================================
// ATUALIZAR PROGRESSO
// ======================================================

function updateProgress() {

    if (isRadio) {

        progressBar.value = 0;

        timeCurrent.textContent = "LIVE";
        timeTotal.textContent = "LIVE";

        return;

    }


    if (musica.duration) {

        const progress =
            (musica.currentTime /
                musica.duration) * 100;


        progressBar.value =
            progress;


        timeCurrent.textContent =
            formatTime(
                musica.currentTime
            );


        timeTotal.textContent =
            formatTime(
                musica.duration
            );

    }

}


// ======================================================
// PARAR NOW PLAYING
// ======================================================

function stopNowPlaying() {

    if (nowPlayingInterval) {

        clearInterval(
            nowPlayingInterval
        );

        nowPlayingInterval = null;

    }

}


// ======================================================
// BUSCAR NOW PLAYING
// ======================================================



async function updateNowPlaying() {
    if (!isRadio) {
        return;
    }

    const item = playlistArray[currentIndex];

    if (!item) {
        return;
    }

    if (!item.radioId) {
        return;
    }

    const radio = RADIOS[item.radioId];

    if (!radio) {
        return;
    }

    // Rádio sem Now Playing
    if (!radio.nowPlaying) {
        return;
    }

    try {

        const response =
            await fetch(
                radio.nowPlaying,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const xmlText =
            await response.text();


        // Converter XML

        const parser =
            new DOMParser();


        const xml =
            parser.parseFromString(
                xmlText,
                "application/xml"
            );


        // Procurar informação da música

        const nowPlaying =
            xml.querySelector(
                "nowplaying-info"
            );


        if (!nowPlaying) {

            console.warn(
                `Nenhuma informação encontrada para ${radio.title}`
            );

            return;

        }


        // Ler propriedades

        const properties = {};


        nowPlaying
            .querySelectorAll("property")
            .forEach(property => {

                const name =
                    property.getAttribute(
                        "name"
                    );


                const value =
                    property.textContent.trim();


                properties[name] =
                    value;

            });


        const title =
            properties.cue_title || "";


        const artist =
            properties.track_artist_name || "";


        // Se não houver informação

        if (
            !title &&
            !artist
        ) {

            return;

        }


        // Montar texto

        let displayTitle;


        if (
            artist &&
            title
        ) {

            displayTitle =
                `${artist} — ${title}`;

        }

        else if (title) {

            displayTitle =
                title;

        }

        else {

            displayTitle =
                artist;

        }


        // Evitar atualização desnecessária

        if (
            musicTitle.dataset.nowPlaying ===
            displayTitle
        ) {

            return;

        }


        musicTitle.dataset.nowPlaying =
            displayTitle;


        musicTitle.textContent =
            displayTitle;


        musicSource.textContent =
            radio.title;


        updateStatus(
            `${radio.title} • Tocando agora`
        );


    }

    catch (error) {

        console.warn(
            `Erro ao consultar Now Playing da ${radio.title}:`,
            error
        );

    }

}


// ======================================================
// INICIAR NOW PLAYING
// ======================================================

function startNowPlaying() {

    stopNowPlaying();


    if (!isRadio) {
        return;
    }


    // Buscar imediatamente

    updateNowPlaying();


    // Atualizar a cada 10 segundos

    nowPlayingInterval =
        setInterval(
            updateNowPlaying,
            10000
        );

}


// ======================================================
// CARREGAR MÚSICA
// ======================================================

function loadMusic(index) {

    if (
        index < 0 ||
        index >= playlistArray.length
    ) {

        if (
            playlistArray.length === 0
        ) {

            musicTitle.textContent =
                "Nenhuma música na playlist";


            musicSource.textContent =
                "Adicione músicas para começar";


            return;

        }


        index = 0;

    }


    currentIndex = index;


    const item =
        playlistArray[currentIndex];


    // Parar Now Playing anterior

    stopNowPlaying();


    // Destruir HLS anterior

    if (hls) {

        hls.destroy();

        hls = null;

    }


    // Configurações

    isRadio =
        item.isRadio || false;


    // ==================================================
    // RÁDIO
    // ==================================================

    if (isRadio) {

        // Limpar título antigo

        musicTitle.dataset.nowPlaying = "";


        musicTitle.textContent =
            item.title;


        if (item.radioId && RADIOS[item.radioId].nowPlaying) {
            musicSource.textContent = "📻 Conectando...";
        } else {
            musicSource.textContent = "📻 Tocando";
        }


        // ----------------------------------------------
        // HLS
        // ----------------------------------------------

        if (
            item.src.includes(".m3u8")
        ) {


            if (Hls.isSupported()) {

                hls =
                    new Hls({

                        enableWorker: true,

                        lowLatencyMode: true

                    });


                hls.loadSource(
                    item.src
                );


                hls.attachMedia(
                    musica
                );


                hls.on(
                    Hls.Events.MANIFEST_PARSED,
                    () => {

                        musica
                            .play()
                            .catch(() => { });


                        isPlaying = true;


                        btnPlayPause.textContent =
                            "⏸";


                        updateStatus(
                            `${item.title} • Tocando`
                        );

                    }
                );


                hls.on(
                    Hls.Events.ERROR,
                    (event, data) => {

                        if (
                            data.fatal
                        ) {

                            hls.destroy();

                            hls = null;


                            updateStatus(
                                `❌ Erro na ${item.title}`
                            );

                        }

                    }
                );

            }


            else if (
                musica.canPlayType(
                    "application/vnd.apple.mpegurl"
                )
            ) {

                musica.src =
                    item.src;


                musica.play()
                    .catch(() => { });


                isPlaying = true;


                btnPlayPause.textContent =
                    "⏸";

            }


            else {

                updateStatus(
                    "❌ Navegador não suporta HLS"
                );

            }

        }


        // ----------------------------------------------
        // AAC
        // ----------------------------------------------

        else {

            musica.src =
                item.src;


            musica.load();


            musica.play()
                .catch(() => { });


            isPlaying = true;


            btnPlayPause.textContent =
                "⏸";


            updateStatus(
                `${item.title} • Tocando`
            );

        }


        // Iniciar consulta da rádio

        if (
            item.radioId
        ) {

            startNowPlaying();

        }

    }


    // ==================================================
    // ARQUIVO LOCAL
    // ==================================================

    else {

        musica.src =
            item.src;


        musica.load();


        musica.play()
            .catch(() => { });


        isPlaying = true;


        btnPlayPause.textContent =
            "⏸";


        musicTitle.dataset.nowPlaying =
            "";


        musicTitle.textContent =
            item.title ||
            "Arquivo de áudio";


        musicSource.textContent =
            "🎵 Arquivo local";


        updateStatus(
            "🎵 Tocando música"
        );

    }


    // Atualizar playlist

    updatePlaylistUI();

}


// ======================================================
// STATUS
// ======================================================

function updateStatus(text) {

    audioStatus.textContent =
        text;

}


// ======================================================
// PLAY / PAUSE
// ======================================================

function togglePlayPause() {

    if (
        playlistArray.length === 0
    ) {

        updateStatus(
            "⚠️ Adicione músicas na playlist"
        );

        return;

    }


    if (isPlaying) {

        musica.pause();

        isPlaying = false;


        btnPlayPause.textContent =
            "▶";


        updateStatus(
            "⏸ Pausado"
        );

    }

    else {

        musica.play()
            .catch(() => { });


        isPlaying = true;


        btnPlayPause.textContent =
            "⏸";


        updateStatus(
            isRadio
                ? "📻 Tocando rádio"
                : "🎵 Tocando música"
        );

    }

}


// ======================================================
// PRÓXIMA
// ======================================================

function nextMusic() {

    if (
        playlistArray.length === 0
    ) {
        return;
    }


    if (isRadio) {

        loadMusic(
            currentIndex
        );

        return;

    }


    const nextIndex =
        (
            currentIndex + 1
        ) %
        playlistArray.length;


    loadMusic(
        nextIndex
    );

}


// ======================================================
// ANTERIOR
// ======================================================

function prevMusic() {

    if (
        playlistArray.length === 0
    ) {
        return;
    }


    if (isRadio) {

        loadMusic(
            currentIndex
        );

        return;

    }


    const prevIndex =
        (
            currentIndex -
            1 +
            playlistArray.length
        ) %
        playlistArray.length;


    loadMusic(
        prevIndex
    );

}


// ======================================================
// STOP
// ======================================================

function stopMusic() {

    musica.pause();


    if (!isRadio) {

        musica.currentTime = 0;

    }


    isPlaying = false;


    btnPlayPause.textContent =
        "▶";


    progressBar.value = 0;


    timeCurrent.textContent =
        "0:00";


    timeTotal.textContent =
        "0:00";


    stopNowPlaying();


    updateStatus(
        "⏹ Parado"
    );

}


// ======================================================
// ATUALIZAR PLAYLIST
// ======================================================

function updatePlaylistUI() {

    playlistItems.innerHTML =
        "";


    playlistArray.forEach(
        (item, index) => {

            const li =
                document.createElement(
                    "li"
                );


            if (
                index === currentIndex
            ) {

                li.classList.add(
                    "active"
                );

            }


            const titleSpan =
                document.createElement(
                    "span"
                );


            titleSpan.textContent =
                item.title ||
                `Música ${index + 1}`;


            const removeBtn =
                document.createElement(
                    "button"
                );


            removeBtn.className =
                "remove-btn";


            removeBtn.textContent =
                "✕";


            removeBtn.onclick =
                (e) => {

                    e.stopPropagation();

                    removeFromPlaylist(
                        index
                    );

                };


            li.appendChild(
                titleSpan
            );


            li.appendChild(
                removeBtn
            );


            li.onclick =
                () => {

                    loadMusic(index);

                    playlist.classList.add("hidden");

                };


            playlistItems.appendChild(
                li
            );

        }
    );

}


// ======================================================
// ADICIONAR PLAYLIST
// ======================================================

function addToPlaylist(
    title,
    src,
    isRadio = false,
    radioId = null
) {

    playlistArray.push({

        title,
        src,

        isRadio,

        radioId

    });


    updatePlaylistUI();


    if (
        playlistArray.length === 1
    ) {

        loadMusic(0);

    }

}


// ======================================================
// REMOVER
// ======================================================

function removeFromPlaylist(index) {

    if (
        index === currentIndex
    ) {

        stopMusic();


        if (hls) {

            hls.destroy();

            hls = null;

        }

    }


    playlistArray.splice(
        index,
        1
    );


    if (
        index < currentIndex
    ) {

        currentIndex--;

    }


    else if (
        index === currentIndex &&
        playlistArray.length > 0
    ) {

        if (
            currentIndex >=
            playlistArray.length
        ) {

            currentIndex =
                playlistArray.length - 1;

        }


        loadMusic(
            currentIndex
        );

    }


    else if (
        playlistArray.length === 0
    ) {

        currentIndex = 0;


        musicTitle.textContent =
            "Nenhuma música na playlist";


        musicSource.textContent =
            "Adicione músicas para começar";


        updateStatus(
            "📋 Playlist vazia"
        );

    }


    updatePlaylistUI();

}


// ======================================================
// LIMPAR PLAYLIST
// ======================================================

function clearPlaylist() {

    stopMusic();


    if (hls) {

        hls.destroy();

        hls = null;

    }


    playlistArray = [];


    currentIndex = 0;


    musicTitle.textContent =
        "Nenhuma música na playlist";


    musicSource.textContent =
        "Adicione músicas para começar";


    updateStatus(
        "📋 Playlist limpa"
    );


    updatePlaylistUI();

}


// ======================================================
// CARREGAR PRESET
// ======================================================

function loadPreset(preset) {
    clearPlaylist();

    preset.forEach(item => {
        playlistArray.push({
            title: item.title,
            src: item.src,
            isRadio: item.isRadio || false,
            radioId: item.radioId || null
        });
    });

    currentIndex = -1;

    musicTitle.textContent = "Selecione uma rádio";
    musicSource.textContent = "Escolha uma rádio na playlist";

    updateStatus("Selecione uma rádio");

    updatePlaylistUI();
}


// ======================================================
// TELA INICIAL
// ======================================================

telaInicial.addEventListener(
    "click",
    () => {

        telaInicial.classList.add(
            "hidden"
        );


        player.classList.add(
            "visible"
        );


        document.body.classList.add(
            "playing"
        );


        updateStatus(
            "📋 Adicione músicas à playlist"
        );

    }
);


// ======================================================
// TECLADO
// ======================================================

document.addEventListener(
    "keydown",
    (e) => {

        if (
            !player.classList.contains(
                "visible"
            )
        ) {

            if (
                e.code === "Space" ||
                e.code === "Enter"
            ) {

                e.preventDefault();

                telaInicial.click();

            }

            return;

        }


        switch (e.code) {

            case "Space":

                e.preventDefault();

                togglePlayPause();

                break;


            case "ArrowRight":

                e.preventDefault();

                nextMusic();

                break;


            case "ArrowLeft":

                e.preventDefault();

                prevMusic();

                break;


            case "KeyS":

                stopMusic();

                break;

        }

    }
);


// ======================================================
// BOTÕES
// ======================================================

btnPlayPause.addEventListener(
    "click",
    togglePlayPause
);


btnNext.addEventListener(
    "click",
    nextMusic
);


btnPrev.addEventListener(
    "click",
    prevMusic
);


btnStop.addEventListener(
    "click",
    stopMusic
);


// ======================================================
// PROGRESSO
// ======================================================

progressBar.addEventListener(
    "input",
    (e) => {

        if (
            musica.duration &&
            !isRadio
        ) {

            const newTime =
                (
                    e.target.value /
                    100
                ) *
                musica.duration;


            musica.currentTime =
                newTime;

        }

    }
);


// ======================================================
// VOLUME
// ======================================================

volumeControl.addEventListener(
    "input",
    (e) => {

        musica.volume =
            e.target.value / 100;

    }
);


// ======================================================
// PLAYLIST
// ======================================================

btnTogglePlaylist.addEventListener(
    "click",
    () => {

        playlist.classList.toggle(
            "hidden"
        );

    }
);


btnAddMusic.addEventListener(
    "click",
    () => {

        fileInput.click();

    }
);


btnClearPlaylist.addEventListener(
    "click",
    clearPlaylist
);


// ======================================================
// ARQUIVOS
// ======================================================

fileInput.addEventListener(
    "change",
    (e) => {

        const files =
            e.target.files;


        for (
            const file of files
        ) {

            const url =
                URL.createObjectURL(
                    file
                );


            addToPlaylist(

                file.name.replace(
                    /\.[^/.]+$/,
                    ""
                ),

                url

            );

        }


        fileInput.value = "";

    }
);


// ======================================================
// PRESETS
// ======================================================

btnLoadPreset1.addEventListener(
    "click",
    () => {

        loadPreset(
            PRESETS.classicas
        );

    }
);


btnLoadPreset2.addEventListener(
    "click",
    () => {

        loadPreset(
            PRESETS.radio
        );

    }
);


// ======================================================
// EVENTOS DO ÁUDIO
// ======================================================

musica.addEventListener(
    "ended",
    () => {

        if (!isRadio) {

            nextMusic();

        }

    }
);


musica.addEventListener(
    "timeupdate",
    updateProgress
);


musica.addEventListener(
    "loadedmetadata",
    () => {

        if (!isRadio) {

            timeTotal.textContent =
                formatTime(
                    musica.duration
                );

        }

    }
);


musica.addEventListener(
    "play",
    () => {

        isPlaying = true;

        btnPlayPause.textContent =
            "⏸";

    }
);


musica.addEventListener(
    "pause",
    () => {

        isPlaying = false;

        btnPlayPause.textContent =
            "▶";

    }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

setInterval(
    updateProgress,
    500
);


// ======================================================
// DESABILITAR SELEÇÃO
// ======================================================

document.addEventListener(
    "selectstart",
    (e) => {

        e.preventDefault();

    }
);


window.addEventListener(
    "contextmenu",
    (e) => {

        e.preventDefault();

    }
);


// ======================================================
// LIMPEZA
// ======================================================

window.addEventListener(
    "beforeunload",
    () => {

        stopNowPlaying();


        if (hls) {

            hls.destroy();

        }

    }
);


// ======================================================
// DRAG AND DROP
// ======================================================

document.addEventListener(
    "dragover",
    (e) => {

        e.preventDefault();

    }
);


document.addEventListener(
    "drop",
    (e) => {

        e.preventDefault();


        if (
            player.classList.contains(
                "visible"
            )
        ) {

            const files =
                e.dataTransfer.files;


            for (
                const file of files
            ) {

                if (
                    file.type.startsWith(
                        "audio/"
                    )
                ) {

                    const url =
                        URL.createObjectURL(
                            file
                        );


                    addToPlaylist(

                        file.name.replace(
                            /\.[^/.]+$/,
                            ""
                        ),

                        url

                    );

                }

            }

        }

    }
);

