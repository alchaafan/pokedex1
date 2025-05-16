function generatePokemonCard(pokemon, types) {
  const typeClass = pokemon.types[0].type.name;
  return `
    <div class="pokemon-card ${typeClass}" data-name="${pokemon.name}">
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <h2>#${pokemon.id} ${pokemon.name.toUpperCase()}</h2>
      <h3>${types}</h3>
    </div>
  `;
}





function generateOverlayContentTabs(pokemon) {
  return `
    <div class="tabs">
      <button class="tab-button" onclick="switchTab('info')">Info</button>
      <button class="tab-button" onclick="switchTab('stats')">Stats</button>
      <button class="tab-button" onclick="switchTab('flavor')">Flavor Text</button>
    </div>

    <div class="tab-content" id="tab-info">
         
      <div class="pDiv"> <p class="pTab">Height:</p> <p class="pDetails">${pokemon.height}</p></div>
     <div class="pDiv"> <p class="pTab">Weight:</p><p class="pDetails">${pokemon.weight}</p></div>
     <div class="pDiv"> <p class="pTab">Base Experience:</p><p class="pDetails">${pokemon.base_experience}</p></div>
    <div class="pDiv" id="abid">  <p class="pTab">Abilities:</p><p class="pDetails">${pokemon.abilities}</p></div>
    
      
    </div>

    <div class="tab-content hide" id="tab-stats">
      ${generateStatsHTML(pokemon.stats)}
    </div>

 
    <div class="tab-content hide" id="tab-flavor">
      <p id="flavor-text">Wird geladen...</p>
    </div>
       <div id="navDiv">
     <button id="prevBtn" onclick="prevPokemon()"><</button>
        <button id="nextBtn" onclick="nextPokemon()">></button>
</div>

          
      </div>
      
    </div>
  `;
}

function generatePokemonData(details) {
  return {
    id: details.id,
    img: details.sprites.front_default, // Normales kleines Bild
    overlayImg: details.sprites.other["official-artwork"].front_default, // Hochauflösendes Bild fürs Overlay
    name: details.name,
    types: formatTypes(details.types),
    abilities: getAbilities(details.abilities),
    height: details.height,
    weight: details.weight,
    base_experience: details.base_experience,
    stats: details.stats
  };
}

function generateStatRow(statName, percentage) {
  return `
    <div class="stat-row">
      <span class="stat-label">${statName}:</span>
      <div class="stat-bar">
        <div class="stat-fill" style="width: ${percentage}%;"></div>
      </div>
    </div>
  `;
}
