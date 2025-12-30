const API_KEY = "AIzaSyAtw1E_FhHYsvGW_Vlbten_m0A2t21gKwU";
const MAX_RESULTS = 10;

const usernameEl = document.getElementById("username");
const searchInput = document.getElementById("searchInput");
const resultsEl = document.getElementById("results");
const videoFrame = document.getElementById("videoFrame");

usernameEl.textContent = currentUser.username;

document.getElementById("searchBtn").onclick = startSearch;
document.getElementById("logoutBtn").onclick = logout;

let selectedVideo = null;

// LOGOUT
function logout() {
  sessionStorage.clear();
  location.href = "login.html";
}

// SEARCH
async function startSearch() {
  const q = searchInput.value.trim();
  if (!q) return;

  resultsEl.innerHTML = "Loading...";

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(q)}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  resultsEl.innerHTML = "";
  data.items.forEach(item => renderVideo(item));
}

// RENDER VIDEO
function renderVideo(item) {
  const videoId = item.id.videoId;
  const title = item.snippet.title;
  const thumb = item.snippet.thumbnails.medium.url;

  const favKey = "favorites_" + currentUser.username;
  const favorites = JSON.parse(localStorage.getItem(favKey)) || [];
  const isFav = favorites.some(v => v.videoId === videoId);

  const card = document.createElement("div");
  card.className = "card p-3 position-relative";

  card.innerHTML = `
    ${isFav ? `<div class="position-absolute top-0 end-0 m-2 bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width:28px;height:28px;">✓</div>` : ""}

    <div class="row g-3 align-items-center">
      <div class="col-md-3">
        <img src="${thumb}" class="img-fluid rounded" style="cursor:pointer">
      </div>

      <div class="col-md-9">
        <h6 style="cursor:pointer">${title}</h6>

        <div class="mt-2 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-primary">➕ Add to Playlist</button>

          <button class="btn btn-sm ${isFav ? "btn-danger" : "btn-outline-danger"}">
            ❤️ ${isFav ? "Added ✓" : "Add to Favorites"}
          </button>
        </div>
      </div>
    </div>
  `;

  // PLAY
  card.querySelector("img").onclick =
  card.querySelector("h6").onclick = () => playVideo(videoId);

  // ADD TO PLAYLIST
  card.querySelector(".btn-primary").onclick = () =>
    openPlaylist({ videoId, title, thumbnail: thumb });

  // FAVORITES
  const favBtn = card.querySelector(".btn-outline-danger, .btn-danger");
  favBtn.onclick = () =>
    toggleFavorite({ videoId, title, thumbnail: thumb }, favBtn, card);

  resultsEl.appendChild(card);
}

// PLAY VIDEO
function playVideo(id) {
  videoFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
  new bootstrap.Modal(document.getElementById("videoModal")).show();
}

// OPEN PLAYLIST MODAL
function openPlaylist(video) {
  selectedVideo = video;

  const playlists = JSON.parse(localStorage.getItem("playlists")) || {};
  playlists[currentUser.username] ??= {};

  const select = document.getElementById("playlistSelect");
  select.innerHTML = "";

  const names = Object.keys(playlists[currentUser.username]);
  if (names.length === 0) {
    select.innerHTML = `<option value="">No playlists yet</option>`;
  } else {
    names.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  }

  document.getElementById("newPlaylist").value = "";
  new bootstrap.Modal(document.getElementById("playlistModal")).show();
}

// SAVE TO PLAYLIST
document.getElementById("addToPlaylistBtn").onclick = () => {
  const playlists = JSON.parse(localStorage.getItem("playlists")) || {};
  playlists[currentUser.username] ??= {};

  const selectVal = document.getElementById("playlistSelect").value;
  const newVal = document.getElementById("newPlaylist").value.trim();
  const name = newVal || selectVal;

  if (!name) return alert("Choose or create playlist");

  playlists[currentUser.username][name] ??= [];

  const list = playlists[currentUser.username][name];
  if (list.some(v => v.videoId === selectedVideo.videoId)) {
    return alert("Already added");
  }

  list.push(selectedVideo);
  localStorage.setItem("playlists", JSON.stringify(playlists));

  bootstrap.Modal.getInstance(document.getElementById("playlistModal")).hide();
};

// FAVORITES
function toggleFavorite(video, btn, card) {
  const key = "favorites_" + currentUser.username;
  let favorites = JSON.parse(localStorage.getItem(key)) || [];

  const index = favorites.findIndex(v => v.videoId === video.videoId);

  if (index === -1) {
    favorites.push(video);
    btn.className = "btn btn-sm btn-danger";
    btn.innerHTML = "❤️ Added ✓";

    const badge = document.createElement("div");
    badge.className = "position-absolute top-0 end-0 m-2 bg-success text-white rounded-circle d-flex align-items-center justify-content-center";
    badge.style.width = "28px";
    badge.style.height = "28px";
    badge.textContent = "✓";
    card.appendChild(badge);

  } else {
    favorites.splice(index, 1);
    btn.className = "btn btn-sm btn-outline-danger";
    btn.innerHTML = "❤️ Add to Favorites";

    const badge = card.querySelector(".bg-success");
    if (badge) badge.remove();
  }

  localStorage.setItem(key, JSON.stringify(favorites));
}
