document.addEventListener("DOMContentLoaded", () => {

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    location.href = "login.html";
    return;
  }

  // ELEMENTS
  const usernameSpan = document.getElementById("username");
  const playlistList = document.getElementById("playlistList");
  const playlistTitle = document.getElementById("playlistTitle");
  const songsCount = document.getElementById("songsCount");
  const songsDiv = document.getElementById("songs");
  const searchInput = document.getElementById("searchInPlaylist");
  const sortSelect = document.getElementById("sortSelect");
  const playPlaylistBtn = document.getElementById("playPlaylistBtn");
  const deletePlaylistBtn = document.getElementById("deletePlaylistBtn");
  const newPlaylistBtn = document.getElementById("newPlaylistBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const player = document.getElementById("player");
  const playerFrame = document.getElementById("playerFrame");

  usernameSpan.textContent = currentUser.username;

  logoutBtn.onclick = () => {
    sessionStorage.clear();
    location.href = "login.html";
  };

  // ---------------- DATA ----------------

  let playlists = JSON.parse(localStorage.getItem("playlists")) || {};
  playlists[currentUser.username] ??= {};

  // ⭐ יצירת Favorites אוטומטית
  if (!playlists[currentUser.username]["Favorites"]) {
    playlists[currentUser.username]["Favorites"] = [];
    localStorage.setItem("playlists", JSON.stringify(playlists));
  }

  let currentPlaylist = null;
  let currentSongs = [];
  let playIndex = 0;

  // ---------------- PLAYLISTS ----------------

  function renderPlaylists() {
    playlistList.innerHTML = "";

    const names = Object.keys(playlists[currentUser.username]);

    if (!names.length) {
      playlistList.innerHTML =
        `<li class="list-group-item text-muted text-center">אין פלייליסטים</li>`;
      return;
    }

    names.forEach(name => {
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action text-center";
      li.textContent = name;
      li.onclick = () => loadPlaylist(name);
      playlistList.appendChild(li);
    });
  }

  function loadPlaylist(name) {
    currentPlaylist = name;
    currentSongs = [...playlists[currentUser.username][name]];
    playlistTitle.textContent = name;
    renderSongs(currentSongs);
  }

  // ---------------- SONGS ----------------

  function renderSongs(list) {
    songsDiv.innerHTML = "";
    songsCount.textContent = `Songs: ${list.length}`;

    if (!list.length) {
      songsDiv.innerHTML =
        `<p class="text-muted text-center">No songs in this playlist</p>`;
      return;
    }

    list.forEach(song => {
      const col = document.createElement("div");
      col.className = "col-md-6";

      col.innerHTML = `
        <div class="card h-100">
          <img src="${song.thumbnail}" class="card-img-top" style="cursor:pointer">
          <div class="card-body">
            <h6 style="cursor:pointer">${song.title}</h6>

            <div class="mb-2">${renderStars(song)}</div>

            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-primary">▶ Play</button>
              <button class="btn btn-sm btn-danger">Remove</button>
            </div>
          </div>
        </div>
      `;

      col.querySelector("img").onclick =
      col.querySelector("h6").onclick = () => playSingle(song.videoId);

      col.querySelector(".btn-danger").onclick = () => {
        playlists[currentUser.username][currentPlaylist] =
          playlists[currentUser.username][currentPlaylist]
            .filter(s => s.videoId !== song.videoId);

        localStorage.setItem("playlists", JSON.stringify(playlists));
        loadPlaylist(currentPlaylist);
      };

      songsDiv.appendChild(col);
    });
  }

  // ---------------- PLAYER ----------------

  function playSingle(videoId) {
    player.classList.remove("d-none");
    playerFrame.src =
      `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  function playSongAtIndex(index) {
    if (index >= currentSongs.length) {
      playerFrame.src = "";
      return;
    }

    playSingle(currentSongs[index].videoId);

    playerFrame.onended = () => {
      playIndex++;
      playSongAtIndex(playIndex);
    };
  }

  playPlaylistBtn.onclick = () => {
    if (!currentPlaylist) return alert("יש לבחור פלייליסט");
    if (!currentSongs.length) return alert("הפלייליסט ריק");

    playIndex = 0;
    playSongAtIndex(playIndex);
  };

  // ---------------- STARS ----------------

  function renderStars(song) {
    let html = "";
    const rating = song.rating || 0;

    for (let i = 1; i <= 5; i++) {
      html += `
        <span style="cursor:pointer;color:${i <= rating ? "#ffc107" : "#ccc"}"
              onclick="rateSong('${song.videoId}', ${i})">★</span>`;
    }
    return html;
  }

  window.rateSong = (id, value) => {
    const song =
      playlists[currentUser.username][currentPlaylist]
        .find(s => s.videoId === id);

    song.rating = value;
    localStorage.setItem("playlists", JSON.stringify(playlists));
    loadPlaylist(currentPlaylist);
  };

  // ---------------- SEARCH / SORT ----------------

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase();
    renderSongs(
      currentSongs.filter(s => s.title.toLowerCase().includes(q))
    );
  };

  sortSelect.onchange = () => {
    const sorted = [...currentSongs];

    if (sortSelect.value === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderSongs(sorted);
  };

  // ---------------- DELETE / ADD PLAYLIST ----------------

  deletePlaylistBtn.onclick = () => {
    if (!currentPlaylist) return;

    if (currentPlaylist === "Favorites") {
      alert("לא ניתן למחוק את Favorites");
      return;
    }

    if (!confirm("למחוק את הפלייליסט?")) return;

    delete playlists[currentUser.username][currentPlaylist];
    localStorage.setItem("playlists", JSON.stringify(playlists));

    currentPlaylist = null;
    playlistTitle.textContent = "בחרי פלייליסט";
    songsDiv.innerHTML = "";
    songsCount.textContent = "Songs: 0";
    player.classList.add("d-none");

    renderPlaylists();
  };

  const modal = new bootstrap.Modal(
    document.getElementById("addPlaylistModal")
  );

  newPlaylistBtn.onclick = () => modal.show();

  document.getElementById("confirmAddPlaylist").onclick = () => {
    const name =
      document.getElementById("newPlaylistName").value.trim();

    if (!name) return alert("יש להזין שם");
    if (playlists[currentUser.username][name])
      return alert("פלייליסט כבר קיים");

    playlists[currentUser.username][name] = [];
    localStorage.setItem("playlists", JSON.stringify(playlists));

    modal.hide();
    renderPlaylists();
  };

  renderPlaylists();
});
