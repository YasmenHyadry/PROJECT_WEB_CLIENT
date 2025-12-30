document.addEventListener("DOMContentLoaded", () => {

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) return location.href = "login.html";

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

  usernameSpan.textContent = currentUser.username;

  logoutBtn.onclick = () => {
    sessionStorage.clear();
    location.href = "login.html";
  };

  let playlists = JSON.parse(localStorage.getItem("playlists")) || {};
  playlists[currentUser.username] ??= {};

  let currentPlaylist = null;
  let currentSongs = [];

  function renderPlaylists() {
    playlistList.innerHTML = "";
    const names = Object.keys(playlists[currentUser.username]);

    if (!names.length) {
      playlistList.innerHTML =
        `<li class="list-group-item text-muted">אין פלייליסטים</li>`;
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
    currentSongs = playlists[currentUser.username][name];
    playlistTitle.textContent = name;
    renderSongs(currentSongs);
  }

  function renderSongs(list) {
    songsDiv.innerHTML = "";
    songsCount.textContent = `Songs: ${list.length}`;

    list.forEach(song => {
      const col = document.createElement("div");
      col.className = "col-md-6";

      col.innerHTML = `
        <div class="card h-100">
          <img src="${song.thumbnail || 'https://via.placeholder.com/320x180'}"
               class="card-img-top">
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

      col.querySelector(".btn-primary").onclick = () => {
        player.classList.remove("d-none");
        playerFrame.src =
          `https://www.youtube.com/embed/${song.videoId}?autoplay=1`;
      };

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

  sortSelect.onchange = () => {
    const sorted = [...currentSongs].sort((a, b) =>
      sortSelect.value === "rating"
        ? (b.rating || 0) - (a.rating || 0)
        : a.title.localeCompare(b.title)
    );
    renderSongs(sorted);
  };

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase();
    renderSongs(currentSongs.filter(s =>
      s.title.toLowerCase().includes(q)
    ));
  };

  deletePlaylistBtn.onclick = () => {
    if (!currentPlaylist) return;
    if (!confirm("למחוק את הפלייליסט?")) return;

    delete playlists[currentUser.username][currentPlaylist];
    localStorage.setItem("playlists", JSON.stringify(playlists));
    currentPlaylist = null;
    songsDiv.innerHTML = "";
    playlistTitle.textContent = "בחרי פלייליסט";
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

    playlists[currentUser.username][name] = [];
    localStorage.setItem("playlists", JSON.stringify(playlists));
    modal.hide();
    renderPlaylists();
  };

  renderPlaylists();
});
