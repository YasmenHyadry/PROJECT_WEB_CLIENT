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
  const deletePlaylistBtn = document.getElementById("deletePlaylistBtn");
  const newPlaylistBtn = document.getElementById("newPlaylistBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const player = document.getElementById("player");
  const playerFrame = document.getElementById("playerFrame");

  usernameSpan.innerText = currentUser.username;

  logoutBtn.onclick = () => {
    sessionStorage.clear();
    location.href = "login.html";
  };

  // DATA
  let playlists = JSON.parse(localStorage.getItem("playlists")) || {};
  if (!playlists[currentUser.username]) {
    playlists[currentUser.username] = {};
  }

  let currentPlaylist = null;
  let currentSongs = [];

  // PLAYER
  function playVideoInside(videoId) {
    player.classList.remove("d-none");
    playerFrame.src =
      "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
  }

  // STARS
  window.rateSong = function (videoId, value) {
    const list = playlists[currentUser.username][currentPlaylist];
    const song = list.find(s => s.videoId === videoId);
    if (!song) return;

    song.rating = value;
    localStorage.setItem("playlists", JSON.stringify(playlists));
    loadPlaylist(currentPlaylist);
  };

  function renderStars(song) {
    const rating = song.rating || 0;
    let html = "";

    for (let i = 1; i <= 5; i++) {
      html += `
        <span
          style="cursor:pointer;color:${i <= rating ? "#ffc107" : "#ccc"}"
          onclick="rateSong('${song.videoId}', ${i})">
          ★
        </span>
      `;
    }
    return html;
  }

  // PLAYLISTS
  function renderPlaylists() {
    playlistList.innerHTML = "";
    const names = Object.keys(playlists[currentUser.username]);

    if (names.length === 0) {
      playlistList.innerHTML =
        `<li class="list-group-item text-muted">אין פלייליסטים</li>`;
      return;
    }

    names.forEach(name => {
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action text-center fw-semibold";
      li.innerText = name;
      li.onclick = () => loadPlaylist(name);
      playlistList.appendChild(li);
    });
  }

  function loadPlaylist(name) {
    currentPlaylist = name;
    currentSongs = [...playlists[currentUser.username][name]];
    playlistTitle.innerText = name;
    renderSongs(currentSongs);
  }

  function renderSongs(list) {
    songsDiv.innerHTML = "";
    songsCount.innerText = `Songs: ${list.length}`;

    if (list.length === 0) {
      songsDiv.innerHTML =
        `<p class="text-muted">No songs in this playlist</p>`;
      return;
    }

    list.forEach(song => {
      const col = document.createElement("div");
      col.className = "col-md-6";

      col.innerHTML = `
        <div class="card h-100">
          <img src="${song.thumbnail}" class="card-img-top">
          <div class="card-body">
            <h6>${song.title}</h6>

            <div class="mb-2">
              ${renderStars(song)}
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-primary">▶ Play</button>
              <button class="btn btn-sm btn-danger">Remove</button>
            </div>
          </div>
        </div>
      `;

      col.querySelector(".btn-primary").onclick = () =>
        playVideoInside(song.videoId);

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

  // SEARCH
  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase();
    renderSongs(currentSongs.filter(s =>
      s.title.toLowerCase().includes(q)
    ));
  };

  // SORT
  sortSelect.onchange = () => {
    let sorted = [...currentSongs];

    if (sortSelect.value === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortSelect.value === "za") {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortSelect.value === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    renderSongs(sorted);
  };

  // DELETE PLAYLIST
  deletePlaylistBtn.onclick = () => {
    if (!currentPlaylist) return;
    if (!confirm("למחוק את הפלייליסט?")) return;

    delete playlists[currentUser.username][currentPlaylist];
    localStorage.setItem("playlists", JSON.stringify(playlists));

    currentPlaylist = null;
    playlistTitle.innerText = "בחרי פלייליסט";
    songsDiv.innerHTML = "";
    songsCount.innerText = "Songs: 0";
    player.classList.add("d-none");
    renderPlaylists();
  };

  // ADD PLAYLIST
  const addModal = new bootstrap.Modal(
    document.getElementById("addPlaylistModal")
  );
  const newPlaylistName = document.getElementById("newPlaylistName");
  const confirmAddPlaylist = document.getElementById("confirmAddPlaylist");

  newPlaylistBtn.onclick = () => {
    newPlaylistName.value = "";
    addModal.show();
  };

  confirmAddPlaylist.onclick = () => {
    const name = newPlaylistName.value.trim();
    if (!name) return alert("יש להזין שם");
    if (playlists[currentUser.username][name])
      return alert("פלייליסט כבר קיים");

    playlists[currentUser.username][name] = [];
    localStorage.setItem("playlists", JSON.stringify(playlists));
    addModal.hide();
    renderPlaylists();
  };

  renderPlaylists();
});
