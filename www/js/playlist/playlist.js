import { elements } from "../ui/elements.js";
import { state } from "../player/state.js";

export function updatePlaylistUI(loadMusic) {
    elements.playlistItems.innerHTML = "";

    state.playlist.forEach((item, index) => {
        const li = document.createElement("li");

        if (index === state.currentIndex) {
            li.classList.add("active");
        }

        const titleSpan =
            document.createElement("span");

        titleSpan.textContent =
            item.title || `Música ${index + 1}`;

        const removeBtn =
            document.createElement("button");

        removeBtn.className = "remove-btn";
        removeBtn.textContent = "✕";

        removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeFromPlaylist(index, loadMusic);
        };

        li.appendChild(titleSpan);
        li.appendChild(removeBtn);

        li.onclick = () => {
            loadMusic(index);
            elements.playlist.classList.add("hidden");
        };

        elements.playlistItems.appendChild(li);
    });
}

export function addToPlaylist(
    title,
    src,
    isRadio = false,
    radioId = null,
    loadMusic
) {
    state.playlist.push({
        title,
        src,
        isRadio,
        radioId
    });

    updatePlaylistUI(loadMusic);

    if (state.playlist.length === 1) {
        loadMusic(0);
    }
}

export function removeFromPlaylist(
    index,
    loadMusic,
    stopMusic
) {
    if (index === state.currentIndex) {
        stopMusic();
    }

    state.playlist.splice(index, 1);

    if (index < state.currentIndex) {
        state.currentIndex--;
    } else if (
        index === state.currentIndex &&
        state.playlist.length > 0
    ) {
        if (
            state.currentIndex >=
            state.playlist.length
        ) {
            state.currentIndex =
                state.playlist.length - 1;
        }

        loadMusic(state.currentIndex);
    } else if (
        state.playlist.length === 0
    ) {
        state.currentIndex = 0;
    }

    updatePlaylistUI(loadMusic);
}

export function clearPlaylist(stopMusic, loadMusic) {
    stopMusic();

    state.playlist = [];
    state.currentIndex = 0;

    updatePlaylistUI(loadMusic);
}

