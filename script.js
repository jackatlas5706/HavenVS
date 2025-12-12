// Game State
const gameState = {
  currentUser: null,
  currentCharacter: null,
  characters: {},
  users: JSON.parse(localStorage.getItem("users")) || {}
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateTime();
  setInterval(updateTime, 1000);
});

function setupEventListeners() {
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("registerBtn").addEventListener("click", register);
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("logoutGameBtn").addEventListener("click", logout);
  document.getElementById("logoutAccBtn").addEventListener("click", logout);
  document
    .getElementById("createCharBtn")
    .addEventListener("click", openCreateChar);
  document
    .getElementById("playerMeritsContainer")
    .addEventListener("click", () => {
      showMeritShop();
    });
}

function toggleAuthForm() {
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");
  document.getElementById("loginError").classList.add("hidden");
  document.getElementById("registerError").classList.add("hidden");
}

function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const errorDiv = document.getElementById("loginError");

  if (!username || !password) {
    showError(errorDiv, "Please fill in all fields");
    return;
  }

  if (
    !gameState.users[username] ||
    gameState.users[username].password !== password
  ) {
    showError(errorDiv, "Invalid username or password");
    return;
  }

  gameState.currentUser = username;
  gameState.characters = gameState.users[username].characters || {};
  showCharacterSelection();
}

function register() {
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;
  const confirm = document.getElementById("registerConfirm").value;
  const errorDiv = document.getElementById("registerError");

  if (!username || !password || !confirm) {
    showError(errorDiv, "Please fill in all fields");
    return;
  }

  if (password !== confirm) {
    showError(errorDiv, "Passwords do not match");
    return;
  }

  if (gameState.users[username]) {
    showError(errorDiv, "Username already exists");
    return;
  }

  gameState.users[username] = { password, characters: {} };
  localStorage.setItem("users", JSON.stringify(gameState.users));
  showNotification("Account created! Please login.");
  toggleAuthForm();
  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
}

function showCharacterSelection() {
  document.getElementById("authContainer").classList.add("hidden");
  document.getElementById("charSelectContainer").classList.remove("hidden");
  refreshCharacterList();
}

function refreshCharacterList() {
  const charGrid = document.getElementById("charGrid");
  charGrid.innerHTML = "";

  if (Object.keys(gameState.characters).length === 0) {
    charGrid.innerHTML =
      '<div class="col-span-2 text-center text-gray-400">No characters yet</div>';
    return;
  }

  for (const charName in gameState.characters) {
    const char = gameState.characters[charName];
    const card = document.createElement("div");
    card.className = "character-card";
    card.onclick = () => selectCharacter(charName);
    card.innerHTML = `
                    <h3>${charName}</h3>
                    <div class="text-xs text-gray-400">${char.race} ${char.class}</div>
                    <div class="text-sm text-yellow-400 mt-2">Level ${char.level}</div>
                `;
    charGrid.appendChild(card);
  }
}

function openCreateChar() {
  const charName = prompt("Enter character name:");
  if (!charName) return;

  if (gameState.characters[charName]) {
    alert("Character already exists");
    return;
  }

  const race = prompt("Choose race (Human/Elf/Dwarf):") || "Human";
  const charClass = prompt("Choose class (Warrior/Mage/Rogue):") || "Warrior";

  gameState.characters[charName] = {
    name: charName,
    race: race,
    class: charClass,
    level: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    glory: 100,
    maxGlory: 100,
    gold: 1000,
    merits: 50,
    jewels: 0,
    stats: { str: 15, def: 12, spd: 10, eva: 8 },
    inventory: [],
    meritPurchases: [],
    createdAt: new Date().toLocaleDateString()
  };

  gameState.users[gameState.currentUser].characters = gameState.characters;
  localStorage.setItem("users", JSON.stringify(gameState.users));
  refreshCharacterList();
  showNotification(`${charName} created!`);
}

function selectCharacter(charName) {
  gameState.currentCharacter = gameState.characters[charName];
  document.getElementById("charSelectContainer").classList.add("hidden");
  document.getElementById("gameContainer").classList.remove("hidden");
  loadCharacterUI();
}

function loadCharacterUI() {
  const char = gameState.currentCharacter;
  document.getElementById(
    "charInfo"
  ).textContent = `${char.name} • ${char.race} ${char.class}`;
  document.getElementById("charName").textContent = char.name;
  document.getElementById("charRace").textContent = char.race;
  document.getElementById("charClass").textContent = char.class;
  document.getElementById("playerLevel").textContent = char.level;
  document.getElementById("playerGold").textContent = char.gold;
  document.getElementById("playerHP").textContent = char.hp;
  document.getElementById("maxHP").textContent = char.maxHp;
  document.getElementById("playerEnergy").textContent = char.energy;
  document.getElementById("maxEnergy").textContent = char.maxEnergy;
  document.getElementById("playerGlory").textContent = char.glory;
  document.getElementById("maxGlory").textContent = char.maxGlory;
  document.getElementById("playerMerits").textContent = char.merits;
  document.getElementById("playerJewels").textContent = char.jewels;
  document.getElementById("meritShopBalanceModal").textContent = char.merits;
  document.getElementById("charExp").textContent = char.exp;
  document.getElementById("expNext").textContent = char.level * 500;
  document.getElementById("statStr").textContent = char.stats.str;
  document.getElementById("statDef").textContent = char.stats.def;
  document.getElementById("statSpd").textContent = char.stats.spd;
  document.getElementById("statEva").textContent = char.stats.eva;
  document.getElementById("memberSince").textContent = char.createdAt;
  updateMeritPurchases();
  updateMeritPurchasesModal();
  updateBars();
}

function updateMeritPurchases() {
  const char = gameState.currentCharacter;
  const container = document.getElementById("purchasedItems");

  if (!char.meritPurchases || char.meritPurchases.length === 0) {
    container.innerHTML =
      '<div class="text-gray-400 text-sm">No items purchased yet</div>';
    return;
  }

  container.innerHTML = char.meritPurchases
    .map(
      (item) => `
                <div class="stat-boost-item">
                    <div class="flex justify-between items-center">
                        <span>${item.name}</span>
                        <span class="text-xs text-green-400">✓ Applied</span>
                    </div>
                </div>
            `
    )
    .join("");
}

function updateMeritPurchasesModal() {
  const char = gameState.currentCharacter;
  const container = document.getElementById("purchasedItemsModal");
  if (!container) return;

  if (!char.meritPurchases || char.meritPurchases.length === 0) {
    container.innerHTML =
      '<div class="text-gray-400 text-sm">No items purchased yet</div>';
    return;
  }

  container.innerHTML = char.meritPurchases
    .map(
      (item) => `
                <div class="stat-boost-item">
                    <div class="flex justify-between items-center">
                        <span>${item.name}</span>
                        <span class="text-xs text-green-400">✓ Applied</span>
                    </div>
                </div>
            `
    )
    .join("");
}

function buyMeritItem(itemName, cost, statType, value) {
  const char = gameState.currentCharacter;

  if (char.merits < cost) {
    showNotification("Not enough merits!");
    return;
  }

  char.merits -= cost;

  // Apply the boost
  if (
    statType === "str" ||
    statType === "def" ||
    statType === "spd" ||
    statType === "eva"
  ) {
    char.stats[statType] += value;
  } else if (statType === "maxHp") {
    char.maxHp += value;
    char.hp = char.maxHp;
  } else if (statType === "maxEnergy") {
    char.maxEnergy += value;
    char.energy = char.maxEnergy;
  } else if (statType === "jewels") {
    char.jewels += value;
  }

  // Track purchase
  if (!char.meritPurchases) {
    char.meritPurchases = [];
  }
  char.meritPurchases.push({ name: itemName, cost: cost });

  // Save to localStorage
  gameState.users[gameState.currentUser].characters = gameState.characters;
  localStorage.setItem("users", JSON.stringify(gameState.users));

  loadCharacterUI();
  showNotification(`✨ ${itemName} purchased for ${cost} merits!`);
}

function updateBars() {
  const char = gameState.currentCharacter;
  document.getElementById("hpBar").style.width =
    (char.hp / char.maxHp) * 100 + "%";
  document.getElementById("energyBar").style.width =
    (char.energy / char.maxEnergy) * 100 + "%";
  document.getElementById("gloryBar").style.width =
    (char.glory / char.maxGlory) * 100 + "%";
  document.getElementById("expBar").style.width =
    (char.exp / (char.level * 500)) * 100 + "%";
}

function switchTab(tabName) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.add("hidden"));
  document
    .querySelectorAll(".tab-button")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(tabName + "Tab").classList.remove("hidden");
  const btn = document.querySelector(`[data-tab="${tabName}"]`);
  if (btn) btn.classList.add("active");
}

function startCombat() {
  const char = gameState.currentCharacter;
  if (char.energy < 15) {
    showNotification("Not enough energy!");
    return;
  }
  char.energy = Math.max(0, char.energy - 15);
  document.getElementById("combatArea").classList.remove("hidden");
  document.getElementById("playerCombatHP").textContent = char.hp;
  document.getElementById("playerCombatMaxHP").textContent = char.maxHp;
  document.getElementById("playerCombatHPBar").style.width = "100%";
  document.getElementById("enemyHP").textContent = 80;
  document.getElementById("enemyMaxHP").textContent = 80;
  document.getElementById("enemyHPBar").style.width = "100%";
  document.getElementById("combatLog").innerHTML =
    '<div class="log-message info">Combat started! Choose your action.</div>';
  updateBars();
}

function playerAttack() {
  const damage = Math.floor(Math.random() * 20) + 10;
  const enemyHP = parseInt(document.getElementById("enemyHP").textContent);
  const newEnemyHP = Math.max(0, enemyHP - damage);
  document.getElementById("enemyHP").textContent = newEnemyHP;
  document.getElementById("enemyHPBar").style.width =
    (newEnemyHP / 80) * 100 + "%";
  addCombatLog(`You attack for ${damage} damage!`, "success");

  if (newEnemyHP <= 0) {
    endCombat(true);
    return;
  }

  setTimeout(() => enemyAttack(), 500);
}

function playerDefend() {
  addCombatLog("You take a defensive stance!", "info");
  setTimeout(() => {
    const damage = Math.floor(Math.random() * 8) + 2;
    const playerHP = parseInt(
      document.getElementById("playerCombatHP").textContent
    );
    const newPlayerHP = Math.max(0, playerHP - damage);
    document.getElementById("playerCombatHP").textContent = newPlayerHP;
    document.getElementById("playerCombatHPBar").style.width =
      (newPlayerHP / gameState.currentCharacter.maxHp) * 100 + "%";
    addCombatLog(`Enemy attacks! You take ${damage} damage.`, "danger");

    if (newPlayerHP <= 0) {
      endCombat(false);
    }
  }, 500);
}

function playerSkill() {
  const damage = Math.floor(Math.random() * 35) + 20;
  const enemyHP = parseInt(document.getElementById("enemyHP").textContent);
  const newEnemyHP = Math.max(0, enemyHP - damage);
  document.getElementById("enemyHP").textContent = newEnemyHP;
  document.getElementById("enemyHPBar").style.width =
    (newEnemyHP / 80) * 100 + "%";
  addCombatLog(`You use special skill for ${damage} damage!`, "success");

  if (newEnemyHP <= 0) {
    endCombat(true);
    return;
  }

  setTimeout(() => enemyAttack(), 500);
}

function enemyAttack() {
  const damage = Math.floor(Math.random() * 15) + 5;
  const playerHP = parseInt(
    document.getElementById("playerCombatHP").textContent
  );
  const newPlayerHP = Math.max(0, playerHP - damage);
  document.getElementById("playerCombatHP").textContent = newPlayerHP;
  document.getElementById("playerCombatHPBar").style.width =
    (newPlayerHP / gameState.currentCharacter.maxHp) * 100 + "%";
  addCombatLog(`Enemy attacks for ${damage} damage!`, "danger");

  if (newPlayerHP <= 0) {
    endCombat(false);
  }
}

function endCombat(won) {
  if (won) {
    const reward = Math.floor(Math.random() * 200) + 100;
    gameState.currentCharacter.gold += reward;
    gameState.currentCharacter.exp += 50;
    addCombatLog(`Victory! You earned ${reward} gold and 50 EXP!`, "success");
    showNotification("Combat won!");
  } else {
    gameState.currentCharacter.hp = gameState.currentCharacter.maxHp;
    addCombatLog("Defeat! You were defeated...", "danger");
    showNotification("Combat lost!");
  }
  document.getElementById("combatArea").classList.add("hidden");
  loadCharacterUI();
}

function addCombatLog(message, type = "info") {
  const log = document.getElementById("combatLog");
  const msgDiv = document.createElement("div");
  msgDiv.className = `log-message ${type}`;
  msgDiv.textContent = message;
  log.appendChild(msgDiv);
  log.scrollTop = log.scrollHeight;
}

function startQuest() {
  showNotification("Quest started!");
}

function challengeOpponent(name, level) {
  showNotification(`You challenged ${name}!`);
}

function enterDungeon(floor) {
  showNotification(`Entered Floor ${floor}!`);
}

function trainStat(stat) {
  const char = gameState.currentCharacter;
  if (char.gold < 50) {
    showNotification("Not enough gold!");
    return;
  }
  char.gold -= 50;
  const statKey = stat.toLowerCase();
  char.stats[statKey] += 2;
  loadCharacterUI();
  showNotification(`${stat} +2!`);
}

function buyItem(itemName, price) {
  const char = gameState.currentCharacter;
  if (char.gold < price) {
    showNotification("Not enough gold!");
    return;
  }
  char.gold -= price;
  char.inventory.push(itemName);
  loadCharacterUI();
  showNotification(`Bought ${itemName}!`);
}

function restNow() {
  const char = gameState.currentCharacter;
  char.hp = char.maxHp;
  char.energy = char.maxEnergy;
  loadCharacterUI();
  showNotification("You rested and recovered!");
}

function deleteCharacter() {
  if (!confirm("Are you sure? This cannot be undone!")) return;
  delete gameState.characters[gameState.currentCharacter.name];
  gameState.users[gameState.currentUser].characters = gameState.characters;
  localStorage.setItem("users", JSON.stringify(gameState.users));
  document.getElementById("gameContainer").classList.add("hidden");
  showCharacterSelection();
}

function logout() {
  gameState.currentUser = null;
  gameState.currentCharacter = null;
  document.getElementById("gameContainer").classList.add("hidden");
  document.getElementById("charSelectContainer").classList.add("hidden");
  document.getElementById("authContainer").classList.remove("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
}

function updateTime() {
  const now = new Date();
  document.getElementById("currentTime").textContent = now.toLocaleTimeString();
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove("hidden");
}

function showNotification(message) {
  const notif = document.createElement("div");
  notif.className = "notification";
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// Merit Shop Modal functions
const meritShopModal = document.getElementById("meritShopModal");
const meritShopBackdrop = document.getElementById("meritShopBackdrop");

function showMeritShop() {
  meritShopModal.classList.add("show");
  meritShopBackdrop.classList.add("show");

  // Update balance inside modal
  if (gameState.currentCharacter) {
    document.getElementById("meritShopBalanceModal").textContent =
      gameState.currentCharacter.merits;
    updateMeritPurchasesModal();
  }
}

function hideMeritShop() {
  meritShopModal.classList.remove("show");
  meritShopBackdrop.classList.remove("show");
}
