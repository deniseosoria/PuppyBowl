// Use the API_URL variable to make fetch requests to the API.
// Replace the placeholder with your cohort name (ex: 2109-UNF-HY-WEB-PT)
const cohortName = "2409-GHP-ET-WEB-PT";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players`;

//State
const state = {
  players: [],
};

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
async function fetchAllPlayers() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();

    if (json.success && Array.isArray(json.data.players)) {
      state.players = json.data.players; // Correctly assign the players array
      console.log("Fetched players:", state.players); // Debugging log
    } else {
      console.error("Invalid data format:", json);
      state.players = []; // Reset to empty array if data format is invalid
    }
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
    state.players = []; // Reset state in case of an error
  }
}

/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    console.log("Fetching player with ID:", playerId);
    const response = await fetch(`${API_URL}/${playerId}`);
    console.log("API Response:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log("Parsed JSON:", json);

    return json.data; // Return the player data
  } catch (err) {
    console.error(`Error fetching player #${playerId}:`, err);
    return null; // Return null if an error occurs
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} player - The player object to add
 * @returns {Object|null} - The newly created player or null if an error occurred
 */
const addNewPlayer = async (player) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(player),
    });
    const json = await response.json();

    if (json?.data?.player) {
      return json.data.player; // Return the newly added player
    } else {
      console.error("Error adding player:", json);
      return null;
    }
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
    return null;
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (player) => {
  try {
    const response = await fetch(API_URL + "/" + player.id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        "Unable to delete player due to Http error: " + response.status
      );
    }

    // Filter out the removed player from state
    state.players = state.players.filter((p) => p.id !== player.id); //Update state

    renderAllPlayers(); // Re-render the updated list
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${player.id} from the roster!`,
      err
    );
  }
};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = () => {
  const ul = document.getElementById("players");
  ul.innerHTML = ""; // Clear existing content

  if (!state.players.length) {
    ul.innerHTML = "<li>No players.</li>";
    return;
  }

  state.players.forEach((player) => {
    console.log("Processing player:", player); // Debugging log

    const card = document.createElement("li");

    const nameEl = document.createElement("h3");
    nameEl.textContent = player.name;

    const idEl = document.createElement("h3");
    idEl.textContent = `ID: ${player.id}`;

    const imageEl = document.createElement("img");
    imageEl.src = player.imageUrl;
    imageEl.alt = player.name;

    // Create "More details" button
    const detailButton = document.createElement("button");
    detailButton.textContent = "More details";
    detailButton.style.display = "block";
    detailButton.addEventListener("click", () => {
      renderSinglePlayer(player);
    });
    console.log("Detail button created:", detailButton); // Debugging log

    // Create "Delete" button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.display = "block";
    deleteButton.addEventListener("click", async () => {
      await removePlayer(player);
    });
    console.log("Delete button created:", deleteButton); // Debugging log

    // Append all elements to the card
    card.appendChild(nameEl);
    card.appendChild(idEl);
    card.appendChild(imageEl);
    card.appendChild(detailButton);
    card.appendChild(deleteButton);

    // Append card to the UL
    ul.appendChild(card);
  });

  console.log("Updated UL Element:", ul.innerHTML); // Debug rendered HTML
};

/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = async (player) => {
  const ul = document.getElementById("players");
  ul.innerHTML = ""; // Clear existing list

  const fetchedPlayer = await fetchSinglePlayer(player.id);
  console.log("Fetched player for details:", fetchedPlayer); // Debugging log

  if (!fetchedPlayer || !fetchedPlayer.player) {
    ul.innerHTML = "<li>Player not found.</li>";
    return;
  }

  // Nested destructuring to simplify property access
  const {
    player: { name, id, breed, status, imageUrl },
  } = fetchedPlayer;

  const card = document.createElement("li");

  const nameEl = document.createElement("h3");
  nameEl.textContent = name;

  const idEl = document.createElement("h3");
  idEl.textContent = `ID: ${id}`;

  const breedEl = document.createElement("h4");
  breedEl.textContent = `Breed: ${breed}`;

  const statusEl = document.createElement("h4");
  statusEl.textContent = `Status: ${status}`;

  const imageEl = document.createElement("img");
  imageEl.src = imageUrl || ""; // Use a fallback if imageUrl is missing
  imageEl.alt = name;

  const backButton = document.createElement("button");
  backButton.textContent = "Back to all players";
  backButton.addEventListener("click", init);

  card.append(nameEl, idEl, breedEl, statusEl, imageEl, backButton);
  ul.appendChild(card);
};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  const form = document.querySelector("form");

  // Replace the form to remove any existing event listeners
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const player = {
      name: newForm.elements["name"].value,
      breed: newForm.elements["breed"].value,
      imageUrl: newForm.elements["imageUrl"].value,
      status: newForm.elements["status"].value,
    };

    // // Call the addNewPlayer function to add the player
    // const newPlayer = await addNewPlayer(player);

    // if (newPlayer) {
    //   state.players.push(newPlayer); // Add the new player directly to the state
    //   renderAllPlayers(); // Re-render the player list to include the new player
    // }
    await addNewPlayer(player);
    form.reset(); // Reset form
    init(); // Refresh player list
  });
};


/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  await fetchAllPlayers(); // Fetch all players and update state
  renderAllPlayers(); // Render the player list
  renderNewPlayerForm(); // Set up the form for adding new players
};

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
// if (typeof window === "undefined") {
//   module.exports = {
//     fetchAllPlayers,
//     fetchSinglePlayer,
//     addNewPlayer,
//     removePlayer,
//     renderAllPlayers,
//     renderSinglePlayer,
//     renderNewPlayerForm,
//   };
// } else {
//   init();
// }

init();
