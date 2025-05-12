let loadOffset = 0;
const limit = 25;
let currentIndex = 0;
let pokemonList = [];

// holt die Daten aus dem Link
async function getData() {

    //mehr laden wird deaktiviert während des Ladens
    let loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.disabled=true;
    loadMoreBtn.style.opacity = "0.5";
    document.getElementById('spinner').style.display='block';
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=25&offset=${loadOffset}`);
    let responseToJson = await response.json();
    
await render(responseToJson.results);
document.getElementById('spinner').style.display='none';

//mehr laden wird wieder aktiviert
loadMoreBtn.disabled = false;
loadMoreBtn.style.opacity = "1"
loadOffset += limit;
}


//Ladeanimation bleibt eingeblendet, bis alle Daten geladen sind
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('spinner').style.display='block';
});


//blindet den Inhalt ein
async function render(pokemons) {
 let content = document.getElementById('content');

 for(let i=0; i <pokemons.length; i++) {
    const pokemon = pokemons[i];
    let pokemonDetails = await fetch(pokemon.url);
    let pokemonJson = await pokemonDetails.json();

        //Typ einblenden mit for Schleife
    let types = "";

    for(let t=0; t <pokemonJson.types.length; t++) {
        types += pokemonJson.types[t].type.name;
        if(t<pokemonJson.types.length -1) {
            types += ", ";
        }
    }

    pokemonList.push({
        img: pokemonJson.sprites.front_default,
        name: pokemon.name,
        types: types,
        abilities: getAbilities(pokemonJson.abilities)
    });

    function getAbilities(abilitiesArray) {
        let abilities = "";

        for(let i = 0; i < abilitiesArray.length; i++) {
            abilities += abilitiesArray[i].ability.name;

            if(i < abilitiesArray.length -1) {
                abilities += ", ";
            }
        }
        return abilities;
    }

    //dynamische Klasse
    let typeClass = pokemonJson.types[0].type.name;

    content.innerHTML += `<div class="pokemon-card ${typeClass} "
    onclick="openOverlay('${pokemonJson.sprites.front_default}', '${pokemon.name}', '${types}', ${i})">
     
     <img src="${pokemonJson.sprites.front_default}" alt="${pokemon.name}">
    <h2 >${pokemon.name.toUpperCase()}</h2>
    <h3>${types}</h3>
     </div>`
 }
}


//Das Overlay wird verwendet
function openOverlay(imgSrc, name, type, index) {
    currentIndex = index; 
    document.getElementById('overlay-img').src = imgSrc;
    document.getElementById('overlay-name').innerHTML=name.toUpperCase();
    document.getElementById('overlay-type').innerHTML=type;
    document.getElementById('overlay-abilities').innerHTML = pokemonList[index].abilities
    document.getElementById('overlay').classList.remove('hide');
    document.body.style.overflow='hidden'

}


//Das Overlay wird geschlossen
function closeOverlay() {
   let overlayRef = document.getElementById('overlay');

   if(event.target== overlay) {
    overlayRef.classList.add('hide');

    //verhindert das Skrollen, wenn das Overlay verwendet wird
    document.body.style.overflow="";
   }
    overlayRef.removeEventListener('click', closeOverlay);
}


function prevPokemon() {
    if(currentIndex > 0) {
        currentIndex--;
        updateOverlay();
    }
}


function nextPokemon() {
    if (currentIndex < pokemonList.length -1) {
        currentIndex++;
        updateOverlay();
    }
}


function updateOverlay() {
    let pokemon = pokemonList[currentIndex];
    document.getElementById('overlay-img').src = pokemon.img;
    document.getElementById('overlay-name').innerHTML = pokemon.name.toUpperCase();
    document.getElementById('overlay-type').innerHTML = pokemon.types;
    document.getElementById('overlay-abilities').innerHTML = pokemon.abilities;
}


//mehr laden
document.getElementById('loadMoreBtn').onclick = function() {
    getData()
}


//Suchfunktion
document.getElementById('searchBox').addEventListener('input', function(){

    //groß oder klein geschrieben spielt keine Rolle
let searchTerm = this.value.toLowerCase();
let contentDiv = document.getElementById('content');
let pokemonCards = contentDiv.getElementsByClassName('pokemon-card');
let noResults = document.getElementById('no-results');

let found = 0;

if(searchTerm.length == 0) {
    for(let i = 0; i < pokemonCards.length; i++) {
        pokemonCards[i].style.display = "block"
    }
     noResults.classList.add('hide')
    return;
}

if(searchTerm.length < 3) {
   noResults.classList.add('hide')
    return;
}


for (let i=0;  i < pokemonCards.length; i++) {
    let pokemonName = pokemonCards[i].querySelector('h2').innerText.toLowerCase();
    if (pokemonName.includes(searchTerm)) {
        pokemonCards[i].style.display="block";
        found++;
    } else {
        pokemonCards[i].style.display="none";
    }
}


//fügt den Text kein Pokemon gefunden ein
if(found ===0) {
    noResults.classList.remove('hide')
} else {
    noResults.classList.add('hide')
}

//mehr laden wird deaktiviert wenn kein Ergebniss gefunden wird
document.getElementById('loadMoreBtn').disabled = (found ==0);
document.getElementById('loadMoreBtn').style.opacity = found ==0 ? "0.5": "1";
});

