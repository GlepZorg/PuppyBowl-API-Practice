const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2310-FSA-ET-WEB-PT-SF'; 
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`; 


/**
 * It fetches all players from the API and returns them.
 * @returns An array of player objects.
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${APIURL}/players`); 
    const result = await response.json();

    if (result.success) {
      return result.data.players;
    } else {
      const errorMessage = result.error ? result.error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  } catch (err) {
    console.error('Uh oh, trouble fetching players!', err);
    throw err;
  }
};


const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${APIURL}/players/${playerId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const playerDetails = await response.json();
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(`${APIURL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerObj),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const newPlayer = await response.json();
  } catch (err) {
    console.error('Oops, something went wrong with adding that player!', err);
  }
};

const removePlayer = async (playerId) => {
  try {
    const deleteUrl = `${APIURL}/players/${playerId}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById(`player-${playerId}`).remove();
    } else {
      console.error('Failed to delete player:', result);
    }
  } catch (err) {
    console.error(`Whoops, trouble removing player #${playerId} from the roster!`, err);
  }
};
/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
async function showPlayerStats(playerId) {
  try {
    const response = await fetch(`https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players/${playerId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Error: ${result.message}`);
    }

    const player = result.data.player;
    const playerDetails = `
      Breed: ${player.breed}
      Status: ${player.status}
      Team ID: ${player.teamId}
    `;

    alert(playerDetails); 
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
}



function renderAllPlayers(playerList) {
  playerContainer.innerHTML = ''; 

  playerList.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player-card');
    playerDiv.id = `player-${player.id}`;
    playerDiv.innerHTML = `
      <h3>${player.name}</h3>
      <img src="${player.imageUrl}" alt="Image of ${player.name}" style="max-width:100%; height:auto; cursor:pointer;">
      <button class="delete-btn" data-player-id="${player.id}">Delete</button>
    `;

    playerContainer.appendChild(playerDiv);

    const deleteBtn = playerDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
      removePlayer(this.getAttribute('data-player-id'));
    });

    const img = playerDiv.querySelector('img');
    img.addEventListener('click', () => {
      showPlayerStats(player.id); 
    });
  });
}



function attachDeleteEventListeners() {
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function() {
      const playerId = this.getAttribute('data-player-id');
      removePlayer(playerId);
    });
  });
}
  /**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
  const renderNewPlayerForm = () => {
    newPlayerFormContainer.innerHTML = `
      <form id="add-player">
        <label for="player-name">Name:</label>
        <input type="text" id="player-name" name="player-name" required />
        <label for="player-breed">Breed:</label>
        <input type="text" id="player-breed" name="player-breed" required />
        <label for="player-stats">Stats:</label>
        <textarea id="player-stats" name="player-stats" required></textarea>
        <button type="submit">Add Player</button>
      </form>
    `;
  
    document.getElementById('add-player').addEventListener('submit', async (event) => {
      event.preventDefault();
      const playerObj = {
        name: document.getElementById('player-name').value,
        breed: document.getElementById('player-breed').value,
        stats: document.getElementById('player-stats').value
      };
      await addNewPlayer(playerObj);
      const players = await fetchAllPlayers();
      if (players) {
        renderAllPlayers(players);
      }
    });
  };
  
  async function init() {
    try {
      const players = await fetchAllPlayers();
      if (Array.isArray(players)) {
        renderAllPlayers(players);
      } else {
        console.error('Received data is not an array:', players);
      }
      renderNewPlayerForm();
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }
  
  init();
  