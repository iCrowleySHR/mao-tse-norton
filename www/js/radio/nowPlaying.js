import { elements } from "../ui/elements.js";
import { state } from "../player/state.js";
import { RADIOS } from "../config/radios.js";
import { updateStatus } from "../ui/status.js";

export function stopNowPlaying() {
    if (state.nowPlayingInterval) {
        clearInterval(state.nowPlayingInterval);
        state.nowPlayingInterval = null;
    }
}

export async function updateNowPlaying() {
    if (!state.isRadio) return;

    const item =
        state.playlist[state.currentIndex];

    if (!item?.radioId) return;

    const radio = RADIOS[item.radioId];

    if (!radio?.nowPlaying) return;

    try {
        const response = await fetch(
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

        const parser =
            new DOMParser();

        const xml =
            parser.parseFromString(
                xmlText,
                "application/xml"
            );

        const nowPlaying =
            xml.querySelector(
                "nowplaying-info"
            );

        if (!nowPlaying) return;

        const properties = {};

        nowPlaying
            .querySelectorAll("property")
            .forEach(property => {
                const name =
                    property.getAttribute("name");

                properties[name] =
                    property.textContent.trim();
            });

        const title =
            properties.cue_title || "";

        const artist =
            properties.track_artist_name || "";

        if (!title && !artist) return;

        let displayTitle;

        if (artist && title) {
            displayTitle =
                `${artist} — ${title}`;
        } else {
            displayTitle =
                title || artist;
        }

        if (
            elements.musicTitle.dataset.nowPlaying ===
            displayTitle
        ) {
            return;
        }

        elements.musicTitle.dataset.nowPlaying =
            displayTitle;

        elements.musicTitle.textContent =
            displayTitle;

        elements.musicSource.textContent =
            radio.title;

        updateStatus(
            `${radio.title} • Tocando agora`
        );

    } catch (error) {
        console.warn(
            `Erro ao consultar Now Playing da ${radio.title}:`,
            error
        );
    }
}

export function startNowPlaying() {
    stopNowPlaying();

    if (!state.isRadio) return;

    updateNowPlaying();

    state.nowPlayingInterval =
        setInterval(
            updateNowPlaying,
            10000
        );
}

