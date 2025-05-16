let loadOffset = 0;
const limit = 25;
let currentIndex = 0;
let pokemonList = [];

async function initializeApp() {
  showLoadingOverlay();
  await getData();
  hideLoadingOverlay();
}
setupEventListeners();

function setupEventListeners() {
  document.addEventListener("DOMContentLoaded", initializeApp);
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.addEventListener('input', handleSearch);
  }
}

async function getData() {
  setLoadingState(true);
  document.getElementById('no-results').classList.add('hide');
  const data = await fetchPokemonList(loadOffset, limit);
  await renderPokemonCards(data.results);
  addClickEventToCards();
  setLoadingState(false);
  loadOffset += limit;
}

async function fetchPokemonList(offset, limit) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  return await response.json();
}

async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  return await response.json();
}

async function renderPokemonCards(pokemons) {
  const content = document.getElementById('content');
  for (let i = 0; i < pokemons.length; i++) {
    const details = await fetchPokemonDetails(pokemons[i].url);
    if (!isAlreadyLoaded(details.id)) {
      const pokemonData = generatePokemonData(details);
      pokemonList.push(pokemonData);
      filteredPokemonList.push(pokemonData);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generatePokemonCard(details, pokemonData.types, pokemonList.length - 1);
      content.appendChild(tempDiv.firstElementChild);
    }
  }
}

function isAlreadyLoaded(id) {
  for (let i = 0; i < pokemonList.length; i++) {
    if (pokemonList[i].id === id) return true;
  }
  return false;
}

function formatTypes(typesArray) {
  let types = "";
  for (let i = 0; i < typesArray.length; i++) {
    types += typesArray[i].type.name;
    if (i < typesArray.length - 1) types += ", ";
  }
  return types;
}

function getAbilities(abilitiesArray) {
  let abilities = "<ul>";
  for (let i = 0; i < abilitiesArray.length; i++) {
    abilities += `<li>${abilitiesArray[i].ability.name}</li>`;
  }
  abilities += "</ul>";
  return abilities;
}

async function openOverlay(index) {
  currentIndex = index;
  ensureFilteredListInitialized();

  const pokemon = filteredPokemonList[currentIndex];
  if (!pokemon) {
    console.error("Fehler: Pokémon nicht gefunden!", currentIndex);
    return;
  }

  renderOverlayContent(pokemon);
  await loadFlavorText(pokemon.name);
  updateStatsOverlay(pokemon);
  initializeOverlayView();
}

// Hilfsfunktion: Filterliste initialisieren
function ensureFilteredListInitialized() {
  if (filteredPokemonList.length === 0) {
    filteredPokemonList = [...pokemonList];
  }
}

// Hilfsfunktion: HTML-Inhalt im Overlay setzen
function renderOverlayContent(pokemon) {
  const overlayContent = `
    <img src="${pokemon.overlayImg}" alt="${pokemon.name}" class="pokemon-image">
    ${generateOverlayContentTabs(pokemon)}
  `;
  document.getElementById('overlay-content').innerHTML = overlayContent;
}

// Hilfsfunktion: Flavor-Text laden
async function loadFlavorText(name) {
  const flavorText = await fetchFlavorText(name);
  document.getElementById('flavor-text').innerText = flavorText;
}

// Hilfsfunktion: Ansicht aktivieren
function initializeOverlayView() {
  document.getElementById('overlay').classList.remove('hide');
  document.body.style.overflow = 'hidden';
  document.querySelector('.stat-container').style.display = "block";
  switchTab('info');
}


function closeOverlay(event) {
  if (event.target.id === 'overlay') {
    document.getElementById('overlay').classList.add('hide');
    document.body.style.overflow = "";
  }
}

function prevPokemon() {
  if (filteredPokemonList.length > 0) {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : filteredPokemonList.length - 1;
    updateOverlay(filteredPokemonList[currentIndex]);
  }
}

function nextPokemon() {
  if (filteredPokemonList.length > 0) {
    currentIndex = currentIndex < filteredPokemonList.length - 1 ? currentIndex + 1 : 0;
    updateOverlay(filteredPokemonList[currentIndex]);
  }
}

async function updateOverlay(pokemon) {
  document.getElementById('overlay-content').innerHTML = `
    <img src="${pokemon.overlayImg}" alt="${pokemon.name}" class="pokemon-image">
    ${generateOverlayContentTabs(pokemon)}
  `;

  const flavorText = await fetchFlavorText(pokemon.name);
  document.getElementById('flavor-text').innerText = flavorText;

  updateStatsOverlay(pokemon);
  document.querySelector('.stat-container').style.display = "block";
  switchTab('info');
}

async function fetchFlavorText(name) {
  const url = `https://pokeapi.co/api/v2/pokemon-species/${name}`;
  const res = await fetch(url);
  const data = await res.json();
  for (let i = 0; i < data.flavor_text_entries.length; i++) {
    if (data.flavor_text_entries[i].language.name === "en") {
      return data.flavor_text_entries[i].flavor_text.replace(/\f/g, ' ');
    }
  }
  return "Kein Flavor Text gefunden.";
}

function switchTab(tabName) {
  const allTabs = document.getElementsByClassName('tab-content');
  for (let i = 0; i < allTabs.length; i++) {
    allTabs[i].classList.add('hide');
  }
  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) {
    activeTab.classList.remove('hide');
  }
}

// Suche
let filteredPokemonList = []; // Speichert nur gefilterte Pokémon
function handleSearch() {
  const searchTerm = getSearchTerm();
  const cards = document.getElementsByClassName('pokemon-card');
  const noResults = document.getElementById('no-results');
  const hintMessage = document.getElementById('search-hint');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  updateHintMessage(hintMessage, searchTerm);
  updateLoadMoreButton(loadMoreBtn, searchTerm);
  processSearchResults(searchTerm, cards, noResults);
  updateFilteredPokemonList(searchTerm); // Aktualisiere gefilterte Liste
  addClickEventToCards(); // Eventlistener nach der Suche erneut setzen
}

function addClickEventToCards() {
  const cards = document.getElementsByClassName('pokemon-card');
  for (let i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', function () {
      const name = this.getAttribute('data-name');
      const index = filteredPokemonList.findIndex(p => p.name === name);
      openOverlay(index);
    });
  }
}


// Funktion zum Aktualisieren der Liste 
function updateFilteredPokemonList(searchTerm) {
  if (searchTerm.length === 0) {
    filteredPokemonList = [...pokemonList];
  } else {
    filteredPokemonList = pokemonList.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm)
    );
  }
}

function updateLoadMoreButton(loadMoreBtn, searchTerm) {
  loadMoreBtn.style.display = searchTerm.length > 0 ? "none" : "block";
}

function updateHintMessage(hintMessage, searchTerm) {
  if (searchTerm.length === 0) {
    hintMessage.classList.add('hide'); // Hinweis ausblenden, wenn Suchfeld leer ist
  } else {
    hintMessage.classList.toggle('hide', searchTerm.length >= 3); // Hinweis nur anzeigen wenn weniger als 3 Buchstaben
  }
}

function processSearchResults(searchTerm, cards, noResults) {
  if (searchTerm.length === 0) {
    showAllCards(cards, noResults);
    return;
  }

  if (shouldHideResults(searchTerm)) {
    noResults.classList.add('hide');
    return;
  }

  const found = filterCards(cards, searchTerm);
  updateNoResults(found, noResults);
}

function hideNoResults(noResults) {
  noResults.classList.add('hide');
}

function getSearchTerm() {
  return document.getElementById('searchBox').value.toLowerCase();
}

function shouldShowAllCards(searchTerm) {
  return searchTerm.length === 0;
}

function shouldHideResults(searchTerm) {
  return searchTerm.length < 3;
}

function showAllCards(cards, noResults) {
  for (let card of cards) {
    card.style.display = "";
  }
  noResults.classList.add('hide');
}

function filterCards(cards, searchTerm) {
  let found = 0;
  for (let card of cards) {
    const name = card.querySelector('h2').innerText.toLowerCase();
    if (name.includes(searchTerm)) {
      card.style.display = "";
      found++;
    } else {
      card.style.display = "none";
    }
  }
  return found;
}

function updateNoResults(found, noResults) {
  const statContainer = document.querySelector('.stat-container');

  if (found === 0) {
    noResults.classList.remove('hide');
    if (statContainer) {
      statContainer.style.display = "none";
    }
  } else {
    noResults.classList.add('hide');
    if (statContainer) {
      statContainer.style.display = "";
    }
  }
}

function generateStatsHTML(statsArray) {
  let html = "";
  for (let i = 0; i < statsArray.length; i++) {
    html += `<p class="pTab">${statsArray[i].stat.name}: ${statsArray[i].base_stat}</p>`;
  }
  return html;
}

function showLoadingOverlay() {
  document.getElementById('loading-overlay').style.display = "flex";
  document.body.style.overflow = "hidden";
}

function hideLoadingOverlay() {
  document.getElementById('loading-overlay').style.display = "none";
  document.body.style.overflow = "";
}

function setLoadingState(isLoading) {
  const btn = document.getElementById('loadMoreBtn');
  btn.disabled = isLoading;
  btn.style.opacity = isLoading ? "0.5" : "1";
  if (isLoading) showLoadingOverlay();
  else hideLoadingOverlay();
}

function generateStatBars(stats) {
  let statHTML = '<div class="stat-container">';

  for (let i = 0; i < stats.length; i++) {
    const percentage = (stats[i].base_stat / 150) * 100;
    statHTML += generateStatRow(stats[i].stat.name, percentage);
  }

  statHTML += '</div>';
  return statHTML;
}

function updateStatsOverlay(pokemon) {
  document.getElementById('tab-stats').innerHTML = generateStatBars(pokemon.stats);
}