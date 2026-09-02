
import { elements } from "../ui/elements.js";
import { state } from "./state.js";
import { RADIOS } from "../config/radios.js";
import { updateStatus } from "../ui/status.js";
import {
    startNowPlaying,
    stopNowPlaying
} from "../radio/nowPlaying.js";
import {
    showCasterPlayer,
    hideCasterPlayer
} from "../radio/caster.js";
import { updatePlaylistUI } from "../playlist/playlist.js";

export function loadMusic(index) {
    if (state.playlist.length === 0) {
        elements.musicTitle.textContent =
            "Nenhuma música na playlist";

        elements.musicSource.textContent =
            "Adicione músicas para começar";

        return;
    }

    if (
        index < 0 ||
        index >= state.playlist.length
    ) {
        index = 0;
    }

    state.currentIndex = index;

    const item =
        state.playlist[state.currentIndex];

    stopNowPlaying();

    // Esconde o Caster ao trocar de faixa
    hideCasterPlayer();

    // Destrói HLS anterior
    if (state.hls) {
        state.hls.destroy();
        state.hls = null;
    }

    // Para áudio anterior
    elements.musica.pause();

    state.isRadio =
        item.isRadio || false;

    if (state.isRadio) {
        loadRadio(item);
    } else {
        loadLocalMusic(item);
    }

    updatePlaylistUI(loadMusic);
}


function loadRadio(item) {
    elements.musicTitle.dataset.nowPlaying = "";
    elements.musicTitle.textContent = item.title;

    const radio =
        item.radioId
            ? RADIOS[item.radioId]
            : null;

    /*
     * ============================================
     * MAO TSE NORTON
     * ============================================
     *
     * Não usamos o <audio> diretamente.
     * O Caster.fm controla o próprio player.
     */

    if (item.radioId === "maoTseNorton") {

        // Para qualquer áudio anterior
        elements.musica.pause();
        elements.musica.removeAttribute("src");
        elements.musica.load();

        // Para HLS anterior
        if (state.hls) {
            state.hls.destroy();
            state.hls = null;
        }

        // Mostra Caster.fm
        showCasterPlayer();

        elements.musicTitle.textContent =
            "📻 Mao Tse Norton";

        elements.musicSource.textContent =
            "📻 Caster.fm";

        updateStatus(
            "📻 Mao Tse Norton • Tocando"
        );

        /*
         * O botão do player principal não controla
         * o áudio do Caster.fm.
         *
         * Portanto deixamos como indicação de rádio.
         */
        state.isPlaying = true;

        elements.btnPlayPause.textContent = "⏸";

        return;
    }

    /*
     * ============================================
     * OUTRAS RÁDIOS
     * ============================================
     */

    hideCasterPlayer();

    elements.musicSource.textContent =
        radio?.nowPlaying
            ? "📻 Conectando..."
            : "📻 Tocando";

    if (item.src.includes(".m3u8")) {

        loadHLS(item);

    } else if (item.src.includes(".m3u")) {

        loadM3U(item);

    } else {

        loadAAC(item);
    }

    if (item.radioId) {
        startNowPlaying();
    }
}


async function loadM3U(item) {
    try {
        const response = await fetch(item.src, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();

        const streamUrl = text
            .split("\n")
            .map(line => line.trim())
            .find(line =>
                line &&
                !line.startsWith("#")
            );

        if (!streamUrl) {
            throw new Error("Nenhum stream encontrado no M3U");
        }

        elements.musica.src = streamUrl;
        elements.musica.load();

        await elements.musica.play();

        state.isPlaying = true;
        elements.btnPlayPause.textContent = "⏸";

        updateStatus(`${item.title} • Tocando`);

    } catch (error) {
        console.error("Erro ao carregar M3U:", error);

        updateStatus(
            `❌ Não foi possível conectar à ${item.title}`
        );
    }
}

function loadHLS(item) {
    if (Hls.isSupported()) {
        state.hls =
            new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

        state.hls.loadSource(item.src);
        state.hls.attachMedia(elements.musica);

        state.hls.on(
            Hls.Events.MANIFEST_PARSED,
            () => {
                elements.musica
                    .play()
                    .catch(() => {});

                state.isPlaying = true;

                elements.btnPlayPause.textContent =
                    "⏸";

                updateStatus(
                    `${item.title} • Tocando`
                );
            }
        );

        state.hls.on(
            Hls.Events.ERROR,
            (event, data) => {
                if (data.fatal) {
                    state.hls.destroy();
                    state.hls = null;

                    updateStatus(
                        `❌ Erro na ${item.title}`
                    );
                }
            }
        );

    } else if (
        elements.musica.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ) {
        elements.musica.src = item.src;

        elements.musica
            .play()
            .catch(() => {});

        state.isPlaying = true;

        elements.btnPlayPause.textContent =
            "⏸";

    } else {
        updateStatus(
            "❌ Navegador não suporta HLS"
        );
    }
}

function loadAAC(item) {
    elements.musica.src = item.src;
    elements.musica.load();

    elements.musica
        .play()
        .catch(() => {});

    state.isPlaying = true;

    elements.btnPlayPause.textContent =
        "⏸";

    updateStatus(
        `${item.title} • Tocando`
    );
}

function loadLocalMusic(item) {
    elements.musica.src = item.src;
    elements.musica.load();

    elements.musica
        .play()
        .catch(() => {});

    state.isPlaying = true;

    elements.btnPlayPause.textContent =
        "⏸";

    elements.musicTitle.dataset.nowPlaying = "";

    elements.musicTitle.textContent =
        item.title || "Arquivo de áudio";

    elements.musicSource.textContent =
        "🎵 Arquivo local";

    updateStatus(
        "🎵 Tocando música"
    );
}

export function togglePlayPause() {
    const currentItem = state.playlist[state.currentIndex];

    if (state.playlist.length === 0) {
        updateStatus("⚠️ Adicione músicas na playlist");
        return;
    }

    /*
     * Mao Tse Norton usa o player do Caster.fm.
     * O <audio id="musica"> não controla esse player.
     */
    if (currentItem?.radioId === "maoTseNorton") {
        updateStatus("📻 Use o controle do Caster.fm");
        return;
    }

    /*
     * Player normal
     */
    if (state.isPlaying) {
        elements.musica.pause();

        state.isPlaying = false;

        elements.btnPlayPause.textContent = "▶";

        updateStatus("⏸ Pausado");
    } else {
        elements.musica
            .play()
            .catch(() => {});

        state.isPlaying = true;

        elements.btnPlayPause.textContent = "⏸";

        updateStatus(
            state.isRadio
                ? "📻 Tocando rádio"
                : "🎵 Tocando música"
        );
    }
}

export function nextMusic() {
    if (state.playlist.length === 0) {
        return;
    }

    if (state.isRadio) {
        loadMusic(state.currentIndex);
        return;
    }

    const nextIndex =
        (state.currentIndex + 1) %
        state.playlist.length;

    loadMusic(nextIndex);
}

export function prevMusic() {
    if (state.playlist.length === 0) {
        return;
    }

    if (state.isRadio) {
        loadMusic(state.currentIndex);
        return;
    }

    const prevIndex =
        (
            state.currentIndex -
            1 +
            state.playlist.length
        ) %
        state.playlist.length;

    loadMusic(prevIndex);
}

export function stopMusic() {
    const currentItem =
        state.playlist[state.currentIndex];

    /*
     * Mao Tse Norton usa o player Caster.fm
     */
    if (currentItem?.radioId === "maoTseNorton") {
        state.isPlaying = false;

        elements.btnPlayPause.textContent = "▶";

        hideCasterPlayer();

        updateStatus("⏹ Rádio parada");

        return;
    }

    /*
     * Player normal
     */
    elements.musica.pause();

    if (!state.isRadio) {
        elements.musica.currentTime = 0;
    }

    state.isPlaying = false;

    elements.btnPlayPause.textContent = "▶";

    elements.progressBar.value = 0;

    elements.timeCurrent.textContent = "0:00";

    elements.timeTotal.textContent = "0:00";

    stopNowPlaying();

    updateStatus("⏹ Parado");
}