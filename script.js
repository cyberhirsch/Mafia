// --- script.js ---

// --- GAME STATE ---
let gameState = {
    players: [], // Will hold two player objects
    currentPlayerIndex: 0,
    currentScreen: 'TITLE',
    gameLog: [],
    settings: {
        numPlayers: 2, // Hardcoded to two players
        playerNames: ["Christoph", "Sebastian"], // Hardcoded names
        startCash: 5000,
        aufbauphaseIncomeThreshold: 20000,
        roundsLimit: 20, // Example: 20 full rounds
        currentRound: 1
    },
    messages: []
};

// --- CONSTANTS & GAME DATA (Mostly same as before) ---
const CONSTANTS = {
    SMALL_THEFTS: {
        '1': { name: "Eine Bank ausrauben", lootMin: 50000, lootMax: 100000, success: 0.10, jailChance: 0.70, jailRounds: 6 },
        '2': { name: "Einen Automaten knacken", lootMin: 2, lootMax: 702, success: 0.90, jailChance: 1.00, jailRounds: 1, targetsOpponentAsset: 'slotMachines' },
        '3': { name: "Eine Bar ueberfallen", lootMin: 3000, lootMax: 7500, success: 0.40, jailChance: 0.40, jailRounds: 4, targetsOpponentAsset: 'bars' },
        '4': { name: "Ein Auto klauen und verkaufen", lootMin: 2000, lootMax: 3000, success: 0.50, jailChance: 0.50, jailRounds: 3 },
        '5': { name: "Einen Passanten ausnehmen", lootMin: 120, lootMax: 1120, success: 0.90, jailChance: 1.00, jailRounds: 2, targetsOpponentCash: true },
        '6': { name: "Eine ehrliche Arbeit annehmen", income: 500, success: 1.0, jailChance: 0, jailRounds: 0 },
        '7': { name: "Keines davon", action: 'BACK_TO_MAIN_MENU' }
    },
    INVESTMENTS: { /* Same as before */
        '1': { name: "Spielautomaten(drei)", cost: 15000, profitMin: 300, profitMax: 3300, count: 3, assetKey: 'slotMachines' },
        '2': { name: "Prostituierte (eine)", cost: 20000, profitMin: 800, profitMax: 2800, count: 1, assetKey: 'prostitutes' },
        '3': { name: "Bar", cost: 80000, profitMin: 10000, profitMax: 20000, count: 1, assetKey: 'bars' },
        '4': { name: "Wettbuero", cost: 160000, profitMin: 10000, profitMax: 35000, count: 1, assetKey: 'bettingOffices' },
        '5': { name: "Spielsalon", cost: 300000, profitMin: 15000, profitMax: 85000, count: 1, assetKey: 'casinos' },
        '6': { name: "Nobelbordell", cost: 1000000, profitMin: 15000, profitMax: 65000, count: 1, assetKey: 'luxuryBrothels' },
        '7': { name: "Grandhotel", cost: 10000000, profitMin: 30000, profitMax: 60000, count: 1, assetKey: 'grandHotels' }
    },
    BRIBES: { /* Same as before */
        '1': { name: "Polizeiwachtmeister", cost: 3000, mitigation: 1.2, key: 'polizeiwachtmeister' },
        '2': { name: "Kommissar", cost: 12000, mitigation: 1.4, key: 'kommissar' },
        '3': { name: "Untersuchungsrichter", cost: 30000, mitigation: 1.6, key: 'untersuchungsrichter' },
        '4': { name: "Staatsanwalt", cost: 70000, mitigation: 1.8, key: 'staatsanwalt' },
        '5': { name: "Buergermeister", cost: 100000, mitigation: 2.0, key: 'buergermeister' },
        '6': { name: "Computer", specialMessage: "Wenn Sie nicht sofort Ihren Loetkolben\nda wegnehmen,rufe ich die Polizei." }
    },
    RECRUITS: { /* Same as before */
        '1': { name: "Revolverheld", costPerMonth: 6000, key: 'gunmen' },
        '2': { name: "Leibwaechter", costPerMonth: 4000, key: 'bodyguards' },
        '3': { name: "Anwalt", costPerMonth: 8000, key: 'lawyers' },
        '4': { name: "Informant", costPerTipMin: 2000, costPerTipMax: 10000, key: 'informants', type: 'tip' },
        '5': { name: "Waechter", costPerMonth: 3000, key: 'guards' }
    },
    ACTIONS: { /* Same as before */
        '1': { name: "Entfuehrung" },
        '2': { name: "Ermordung" },
        '3': { name: "Demolierung (Bars,etc.)" },
        '4': { name: "Keine" }
    }
};

// --- UI ELEMENT REFERENCES (same as before) ---
let UIElements = {
    screenContainer: null, mainText: null, optionsList: null, promptText: null, playerInput: null, messageArea: null, statusLine: null
};

// --- UTILITY FUNCTIONS (mostly same) ---
function getRandomInt(min, max) { /* ... same ... */
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function formatCurrency(amount) { /* ... same ... */
    return amount.toLocaleString('de-DE') + " $";
}
function addGameLog(message, playerSpecific = true) {
    const player = getCurrentPlayer();
    let prefix = playerSpecific ? `${player.name} (R${gameState.settings.currentRound}): ` : `(R${gameState.settings.currentRound}): `;
    gameState.gameLog.push(prefix + message);
    if (gameState.gameLog.length > 30) gameState.gameLog.shift();
}
function showTemporaryMessage(message, duration = 3000) { /* ... same ... */
    gameState.messages.push(message);
    renderMessages();
    setTimeout(() => {
        if (gameState.messages[0] === message) gameState.messages.shift(); // Only remove if it's still the first one
        renderMessages();
    }, duration);
}
function getOtherPlayerIndex() {
    return (gameState.currentPlayerIndex + 1) % gameState.settings.numPlayers;
}
function getOtherPlayer() {
    return gameState.players[getOtherPlayerIndex()];
}

// --- PLAYER MANAGEMENT ---
function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayerIndex];
}

function initializePlayer(name) { /* ... same, but no startCash here ... */
    return {
        name: name,
        cash: gameState.settings.startCash, // Set start cash here
        incomePerRound: 0,
        expensesPerRound: 0,
        assets: { slotMachines: 0, prostitutes: 0, bars: 0, bettingOffices: 0, casinos: 0, luxuryBrothels: 0, grandHotels: 0 },
        personnel: { gunmen: 0, bodyguards: 0, lawyers: 0, informants: 0, guards: 0 },
        bribes: { polizeiwachtmeister: false, kommissar: false, untersuchungsrichter: false, staatsanwalt: false, buergermeister: false },
        jailRounds: 0,
        isBankrupt: false,
        turnsInDebt: 0, // For debt tracking
        lastActivity: "Start"
    };
}

// --- UI RENDERING FUNCTIONS (mostly same) ---
function clearScreen() { /* ... same ... */
    UIElements.mainText.innerHTML = '';
    UIElements.optionsList.innerHTML = '';
    UIElements.promptText.textContent = '';
    UIElements.playerInput.value = '';
}
function renderMessages() { /* ... same ... */
    UIElements.messageArea.innerHTML = gameState.messages.join('<br>');
}
function renderStatusLine() { /* ... same ... */
    const player = getCurrentPlayer();
    if (player) {
        UIElements.statusLine.textContent = `Spieler: ${player.name} | Geld: ${formatCurrency(player.cash)} | Runde: ${gameState.settings.currentRound}/${gameState.settings.roundsLimit || '∞'}`;
        if (player.jailRounds > 0) {
             UIElements.statusLine.textContent += ` | Im Gefaengnis (${player.jailRounds} Runden)`;
        }
    } else {
        UIElements.statusLine.textContent = `Mafia | Runde: ${gameState.settings.currentRound}/${gameState.settings.roundsLimit || '∞'}`;
    }
}
function renderScreen() { /* ... same basic structure, player specific parts are handled by getCurrentPlayer() ... */
    clearScreen();
    renderStatusLine();
    renderMessages();

    const player = getCurrentPlayer();

    if (player && player.isBankrupt) { // Check for bankruptcy screen
        gameState.currentScreen = 'GAME_OVER';
    } else if (player && player.jailRounds > 0) {
        gameState.currentScreen = 'JAIL';
    }


    switch (gameState.currentScreen) {
        case 'TITLE':
            UIElements.screenContainer.className = 'c64-screen yellow-bg';
            UIElements.mainText.innerHTML = `
                <p style="text-align:center; font-weight:bold; text-decoration:underline;">M A F I A</p>
                <p style="text-align:center;">(freigegeben ab 18 Jahren)</p>
                <p style="text-align:center;">Copyright 1986 by Sascha Laffrenzen</p>
                <br>
                <p style="text-align:center;">Beliebige Taste zum Starten...</p>
            `;
            break;

        // PLAYER_NAME_INPUT is removed as names are hardcoded for 2 players

        case 'MAIN_MENU':
            UIElements.screenContainer.className = 'c64-screen brown-bg';
            UIElements.mainText.innerHTML = `<p>${player.name}, Sie haben folgende Moeglichkeiten:</p>`;
            const options = [
                { key: '1', text: "Kleine Diebstaehle" },
                { key: '2', text: "Investitionen" },
                { key: '3', text: "Rekrutierung" },
                { key: '4', text: "Bestechung" },
                { key: '5', text: "Aktionen (n.i.)" }, // Mark actions as not fully implemented for now
                { key: '6', text: "Geldtransfer (n.i.)" },
                { key: '7', text: "Besitzverhaeltnisse" }
            ];
            UIElements.optionsList.innerHTML = ''; // Clear before adding
            options.forEach(opt => {
                const li = document.createElement('li');
                li.textContent = `${opt.key}. ${opt.text}`;
                UIElements.optionsList.appendChild(li);
            });
            UIElements.promptText.textContent = "Was waehlen Sie ?";
            UIElements.playerInput.maxLength = 1;
            break;

        case 'SMALL_THEFTS':
            UIElements.screenContainer.className = 'c64-screen blue-bg';
            UIElements.mainText.innerHTML = `<p>${player.name},</p><p>Sie haben ${formatCurrency(player.cash)}.</p><p>Sie koennen Folgendes tun:</p><hr>`;
            UIElements.optionsList.innerHTML = ''; // Clear before adding
            Object.entries(CONSTANTS.SMALL_THEFTS).forEach(([key, theft]) => {
                const li = document.createElement('li');
                let desc = theft.name;
                if (theft.targetsOpponentAsset && getOtherPlayer().assets[theft.targetsOpponentAsset] > 0) {
                    desc += ` (Gegner?)`;
                } else if (theft.targetsOpponentCash) {
                    desc += ` (Gegner?)`;
                }
                li.textContent = `${key}. ${desc.padEnd(30,'.')} ${key}`;
                UIElements.optionsList.appendChild(li);
            });
            UIElements.promptText.textContent = "Ihre Wahl ?";
            UIElements.playerInput.maxLength = 1;
            break;

        // INVESTMENTS, BRIBERY, RECRUITMENT, ACTIONS, STATUS, JAIL screens mostly the same
        // ... (For brevity, I'll skip re-pasting these, they use getCurrentPlayer() correctly)
        // Ensure all list creations clear the list first: UIElements.optionsList.innerHTML = '';
        case 'INVESTMENTS':
            UIElements.screenContainer.className = 'c64-screen purple-bg';
            UIElements.mainText.innerHTML = `<p>${player.name},</p><p>Sie haben ${formatCurrency(player.cash)}.</p><p>Die Anschaffungspreise sind:</p><hr>`;
            UIElements.optionsList.innerHTML = '';
            Object.entries(CONSTANTS.INVESTMENTS).forEach(([key, inv]) => {
                const li = document.createElement('li');
                let dots = '.'.repeat(Math.max(1, 30 - inv.name.length - String(inv.cost).length));
                li.textContent = `${key}. ${inv.name}${dots}${formatCurrency(inv.cost)}`;
                UIElements.optionsList.appendChild(li);
            });
            UIElements.optionsList.innerHTML += `<p>Wenn Sie keins dieser Dinge haben wollen, geben Sie bitte 'N' ein.</p>`;
            UIElements.promptText.textContent = "Ihre Wahl ?";
            UIElements.playerInput.maxLength = 1;
            break;

        case 'BRIBERY':
            UIElements.screenContainer.className = 'c64-screen pink-bg';
            UIElements.mainText.innerHTML = `<p>Wen wollen Sie bestechen ?</p>`;
            UIElements.optionsList.innerHTML = '';
            Object.entries(CONSTANTS.BRIBES).forEach(([key, bribe]) => {
                const li = document.createElement('li');
                li.textContent = `${key}. ${bribe.name}`;
                UIElements.optionsList.appendChild(li);
            });
            UIElements.optionsList.innerHTML += `<p>Keinen: 'N'</p>`;
            UIElements.promptText.textContent = "? ";
            UIElements.playerInput.maxLength = 1;
            break;

        case 'RECRUITMENT':
             UIElements.screenContainer.className = 'c64-screen green-bg';
            UIElements.mainText.innerHTML = `<p>Sie koennen folgende Leute einstellen:</p>`;
            UIElements.optionsList.innerHTML = '';
            Object.entries(CONSTANTS.RECRUITS).forEach(([key, recruit]) => {
                const li = document.createElement('li');
                let costText = "";
                if(recruit.type === 'tip') {
                    costText = `${formatCurrency(recruit.costPerTipMin)}-${formatCurrency(recruit.costPerTipMax)}/Tip`;
                } else {
                    costText = `${formatCurrency(recruit.costPerMonth)}/Monat`;
                }
                li.textContent = `${key}. ${recruit.name.padEnd(15)} ${costText}`;
                UIElements.optionsList.appendChild(li);
            });
            UIElements.optionsList.innerHTML += `<p>Wenn Sie niemanden brauchen,geben Sie bitte 'N' ein.</p>`;
            UIElements.promptText.textContent = "Ihre Wahl ?";
            UIElements.playerInput.maxLength = 1;
            break;

        case 'ACTIONS':
            UIElements.screenContainer.className = 'c64-screen orange-bg';
            UIElements.mainText.innerHTML = `<p>Sie koennen diese Aktionen befehlen:</p>`;
            UIElements.optionsList.innerHTML = '';
             Object.entries(CONSTANTS.ACTIONS).forEach(([key, action]) => {
                const li = document.createElement('li');
                li.textContent = `${key}. ${action.name}`;
                UIElements.optionsList.appendChild(li);
            });
            UIElements.promptText.textContent = "? ";
            UIElements.playerInput.maxLength = 1;
            break;

        case 'STATUS': // Besitzverhaeltnisse
            UIElements.screenContainer.className = 'c64-screen brown-bg';
            let statusHTML = `<p style="text-decoration:underline">Besitzverhaeltnisse (${player.name})</p><br>`;
            statusHTML += `<p>Bargeld: ${''.padStart(15 - String(player.cash).length)}${formatCurrency(player.cash)}</p>`;
            statusHTML += `<p>Einkommen/R: ${formatCurrency(player.incomePerRound)} | Ausgaben/R: ${formatCurrency(player.expensesPerRound)}</p><br>`;
            Object.entries(player.assets).forEach(([key, value]) => {
                if (value > 0) {
                    const assetName = CONSTANTS.INVESTMENTS[Object.keys(CONSTANTS.INVESTMENTS).find(k => CONSTANTS.INVESTMENTS[k].assetKey === key)]?.name.split('(')[0] || key;
                    statusHTML += `<p>${assetName.padEnd(20, ' ')}: ${String(value).padStart(5)}</p>`;
                }
            });
             Object.entries(player.personnel).forEach(([key, value]) => {
                if (value > 0) {
                    const personnelName = CONSTANTS.RECRUITS[Object.keys(CONSTANTS.RECRUITS).find(k => CONSTANTS.RECRUITS[k].key === key)]?.name || key;
                    statusHTML += `<p>${personnelName.padEnd(20, ' ')}: ${String(value).padStart(5)}</p>`;
                }
            });
            statusHTML += `<p>Bestochen:</p>`;
            Object.entries(player.bribes).forEach(([key, value]) => {
                if (value) {
                     const bribeName = CONSTANTS.BRIBES[Object.keys(CONSTANTS.BRIBES).find(k => CONSTANTS.BRIBES[k].key === key)]?.name || key;
                    statusHTML += `<p>  ${bribeName}</p>`;
                }
            });
            statusHTML += `<br><p>(Druecken Sie bitte eine Taste!)</p>`;
            UIElements.mainText.innerHTML = statusHTML;
            break;

        case 'JAIL':
            UIElements.screenContainer.className = 'c64-screen black-bg yellow-text';
            UIElements.mainText.innerHTML = `
                <p>${player.name},</p>
                <p>Sie sind im Gefaengnis und haben noch</p>
                <p>${player.jailRounds} Runden abzusitzen.</p>
                <br><p>(Beliebige Taste zum Fortfahren)</p>
            `;
            break;

        case 'GAME_OVER':
            UIElements.screenContainer.className = 'c64-screen red-bg white-text'; // Make a distinct game over screen
            let winner = gameState.players.find(p => !p.isBankrupt);
            let gameOverMessage = `<p style="text-align:center; font-size:1.2em;">SPIEL VORBEI!</p><br>`;
            if (winner) {
                gameOverMessage += `<p style="text-align:center;">${winner.name} hat gewonnen!</p>`;
            } else if (gameState.settings.currentRound > gameState.settings.roundsLimit) {
                // Calculate net worth for round limit
                let p1NetWorth = calculateNetWorth(gameState.players[0]);
                let p2NetWorth = calculateNetWorth(gameState.players[1]);
                gameOverMessage += `<p>${gameState.players[0].name} Nettovermoegen: ${formatCurrency(p1NetWorth)}</p>`;
                gameOverMessage += `<p>${gameState.players[1].name} Nettovermoegen: ${formatCurrency(p2NetWorth)}</p><br>`;
                if (p1NetWorth > p2NetWorth) gameOverMessage += `<p style="text-align:center;">${gameState.players[0].name} hat gewonnen!</p>`;
                else if (p2NetWorth > p1NetWorth) gameOverMessage += `<p style="text-align:center;">${gameState.players[1].name} hat gewonnen!</p>`;
                else gameOverMessage += `<p style="text-align:center;">Unentschieden!</p>`;

            } else {
                gameOverMessage += `<p style="text-align:center;">Beide Spieler sind pleite!</p>`;
            }
            gameOverMessage += `<br><p style="text-align:center;">(Beliebige Taste zum Neustart)</p>`;
            UIElements.mainText.innerHTML = gameOverMessage;
            break;

        default:
            UIElements.mainText.textContent = "Fehler: Unbekannter Bildschirm.";
    }
    UIElements.playerInput.focus();
}

// --- GAME LOGIC FUNCTIONS ---
function startGame() {
    gameState.players = [];
    gameState.settings.playerNames.forEach(name => {
        gameState.players.push(initializePlayer(name));
    });
    gameState.currentPlayerIndex = 0;
    gameState.currentScreen = 'MAIN_MENU';
    gameState.settings.currentRound = 1;
    gameState.gameLog = [];
    gameState.messages = [];
    addGameLog(`Neues Spiel gestartet. ${getCurrentPlayer().name} beginnt.`, false);
    renderScreen();
}

function handleTitleScreenInput() {
    startGame();
}
function handleStatusScreenInput() { gameState.currentScreen = 'MAIN_MENU'; renderScreen(); }
function handleJailScreenInput() { endTurn(); }
function handleGameOverScreenInput() { gameState.currentScreen = 'TITLE'; renderScreen(); }

function calculateNetWorth(player) {
    let netWorth = player.cash;
    Object.entries(player.assets).forEach(([assetKey, count]) => {
        const invData = Object.values(CONSTANTS.INVESTMENTS).find(inv => inv.assetKey === assetKey);
        if (invData && count > 0) {
            netWorth += (invData.cost * 0.75) * count; // Assets valued at 75% of cost
        }
    });
    return netWorth;
}

function processPlayerInput(rawInput) {
    const input = rawInput.trim().toUpperCase();
    const player = getCurrentPlayer();
    const otherPlayer = getOtherPlayer();
    let message = "";

    // Aufbauphase check
    player.incomePerRound = 0; // Recalculate fresh
    Object.entries(player.assets).forEach(([assetKey, count]) => {
        const invData = Object.values(CONSTANTS.INVESTMENTS).find(inv => inv.assetKey === assetKey);
        if (invData && count > 0) {
            player.incomePerRound += ((invData.profitMin + invData.profitMax) / 2) * count * (invData.count > 1 ? (1/invData.count) : 1) ;
        }
    });
    const inAufbauphase = player.incomePerRound < gameState.settings.aufbauphaseIncomeThreshold && player.cash < gameState.settings.aufbauphaseIncomeThreshold;

    switch (gameState.currentScreen) {
        case 'MAIN_MENU':
            // ... (Aufbauphase check same as before) ...
            if (inAufbauphase && input !== '1' && input !== '7') {
                 showTemporaryMessage("Sie muessen erst mehr Einkommen generieren (Option 1).");
                 break;
            }
            if (input === '1') gameState.currentScreen = 'SMALL_THEFTS';
            else if (input === '2') gameState.currentScreen = 'INVESTMENTS';
            else if (input === '3') gameState.currentScreen = 'RECRUITMENT';
            else if (input === '4') gameState.currentScreen = 'BRIBERY';
            else if (input === '5') showTemporaryMessage("Aktionen sind noch nicht implementiert."); // gameState.currentScreen = 'ACTIONS';
            else if (input === '7') gameState.currentScreen = 'STATUS';
            else showTemporaryMessage("Ungueltige Wahl.");
            break;

        case 'SMALL_THEFTS':
            const theft = CONSTANTS.SMALL_THEFTS[input];
            if (theft) {
                if (theft.action === 'BACK_TO_MAIN_MENU') {
                    gameState.currentScreen = 'MAIN_MENU';
                } else {
                    let success = Math.random() < theft.success;
                    let loot = 0;

                    if (theft.name === "Eine ehrliche Arbeit annehmen") {
                        player.cash += theft.income;
                        message = `Sie haben ${formatCurrency(theft.income)} durch ehrliche Arbeit verdient.`;
                        player.lastActivity = message; addGameLog(message); showTemporaryMessage(message);
                        endTurn(); return;
                    }

                    if (success) {
                        loot = getRandomInt(theft.lootMin, theft.lootMax);
                        player.cash += loot;
                        message = `Erfolg! Beute: ${formatCurrency(loot)}. (${theft.name})`;
                        if (theft.targetsOpponentAsset && otherPlayer.assets[theft.targetsOpponentAsset] > 0) {
                            otherPlayer.assets[theft.targetsOpponentAsset]--;
                            message += ` ${otherPlayer.name} verliert ${theft.targetsOpponentAsset}!`;
                            addGameLog(`${otherPlayer.name} verliert ${theft.targetsOpponentAsset} durch Diebstahl.`, false);
                        } else if (theft.targetsOpponentCash) {
                            const stolenFromOpponent = Math.min(loot, otherPlayer.cash); // Can't steal more than they have
                            if (stolenFromOpponent > 0) {
                                player.cash -= loot; // remove generic loot first
                                player.cash += stolenFromOpponent; // add specific loot
                                otherPlayer.cash -= stolenFromOpponent;
                                message = `${player.name} stiehlt ${formatCurrency(stolenFromOpponent)} von ${otherPlayer.name}!`;
                            }
                        }
                    } else {
                        message = `Gescheitert! (${theft.name})`;
                        if (Math.random() < theft.jailChance) {
                            player.jailRounds = theft.jailRounds;
                            message += ` Sie wurden erwischt und kommen ${theft.jailRounds} Runden ins Gefaengnis!`;
                            gameState.currentScreen = 'JAIL';
                        } else {
                            message += " Sie konnten entkommen.";
                        }
                    }
                    player.lastActivity = message; addGameLog(message); showTemporaryMessage(message);
                    if (gameState.currentScreen !== 'JAIL') endTurn(); else renderScreen(); // If jailed, just render jail screen, don't end turn yet.
                    return; // Important: end processing for this input here after theft
                }
            } else {
                showTemporaryMessage("Ungueltige Wahl.");
            }
            break;

        // INVESTMENTS, BRIBERY, RECRUITMENT, ACTIONS logic mostly same, but call endTurn() at the end.
        // ... Ensure these cases eventually lead to endTurn() or re-rendering a different screen
        case 'INVESTMENTS':
            if (input === 'N') {
                endTurn(); // Player chose to do nothing this turn for investments
            } else {
                const inv = CONSTANTS.INVESTMENTS[input];
                if (inv) {
                    if (player.cash >= inv.cost) {
                        player.cash -= inv.cost;
                        player.assets[inv.assetKey] = (player.assets[inv.assetKey] || 0) + inv.count;
                        message = `${inv.name} gekauft fuer ${formatCurrency(inv.cost)}.`;
                        player.lastActivity = message; addGameLog(message); showTemporaryMessage(message);
                    } else {
                        message = `Nicht genug Geld fuer ${inv.name}.`;
                        showTemporaryMessage(message);
                    }
                } else {
                    showTemporaryMessage("Ungueltige Wahl.");
                }
                endTurn(); // End turn after investment attempt
            }
            return; // Important

        case 'BRIBERY':
            if (input === 'N') {
                endTurn();
            } else {
                const bribe = CONSTANTS.BRIBES[input];
                if (bribe) {
                    if (bribe.specialMessage) {
                        message = bribe.specialMessage; showTemporaryMessage(message, 5000);
                    } else if (player.bribes[bribe.key]) {
                        message = `${bribe.name} ist bereits bestochen.`; showTemporaryMessage(message);
                    } else if (player.cash >= bribe.cost) {
                        player.cash -= bribe.cost; player.bribes[bribe.key] = true;
                        // Bribes are one-time payments, not added to recurring expenses
                        message = `${bribe.name} bestochen fuer ${formatCurrency(bribe.cost)}.`;
                        player.lastActivity = message; addGameLog(message); showTemporaryMessage(message);
                    } else {
                        message = `Nicht genug Geld um ${bribe.name} zu bestechen.`; showTemporaryMessage(message);
                    }
                } else {
                    showTemporaryMessage("Ungueltige Wahl.");
                }
                endTurn();
            }
            return; // Important

        case 'RECRUITMENT':
             if (input === 'N') {
                endTurn();
            } else {
                const recruit = CONSTANTS.RECRUITS[input];
                if (recruit) {
                    let cost = recruit.type === 'tip' ? getRandomInt(recruit.costPerTipMin, recruit.costPerTipMax) : recruit.costPerMonth;
                    if (player.cash >= cost) {
                        player.cash -= cost;
                        player.personnel[recruit.key]++;
                        if(recruit.type !== 'tip') player.expensesPerRound += recruit.costPerMonth; // Add to recurring
                        message = `${recruit.name} rekrutiert fuer ${formatCurrency(cost)}.`;
                        player.lastActivity = message; addGameLog(message); showTemporaryMessage(message);
                    } else {
                        message = `Nicht genug Geld um ${recruit.name} zu rekrutieren.`; showTemporaryMessage(message);
                    }
                } else {
                    showTemporaryMessage("Ungueltige Wahl.");
                }
                endTurn();
            }
            return; // Important
        
        case 'ACTIONS': // Placeholder
            showTemporaryMessage("Aktionen sind noch nicht vollstaendig implementiert.");
            endTurn();
            return;

        default:
            showTemporaryMessage("Aktion fuer diesen Bildschirm nicht definiert.");
    }
    // Fallback: if not returned, render current screen (e.g., invalid choice on main menu)
    renderScreen();
    UIElements.playerInput.value = '';
}


function applyEndOfTurnEffects() { // Renamed from applyEndOfRoundEffects
    const player = getCurrentPlayer();
    if (player.isBankrupt) return; // Skip if already bankrupt

    // 1. Income from assets
    let totalIncome = 0;
    player.incomePerRound = 0; // Recalculate for status
    Object.entries(player.assets).forEach(([assetKey, count]) => {
        const invData = Object.values(CONSTANTS.INVESTMENTS).find(inv => inv.assetKey === assetKey);
        if (invData && count > 0) {
            let assetIncome = 0;
            for (let i = 0; i < count / (invData.count > 1 ? invData.count : 1); i++) { // each set of assets generates profit
                 assetIncome += getRandomInt(invData.profitMin, invData.profitMax);
            }
            totalIncome += assetIncome;
            player.incomePerRound += assetIncome;
        }
    });
    player.cash += totalIncome;
    if (totalIncome !== 0) addGameLog(`${formatCurrency(totalIncome)} Einkommen erhalten.`);

    // 2. Expenses for personnel
    let totalExpenses = 0;
    Object.entries(player.personnel).forEach(([key, count]) => {
        const recruitData = Object.values(CONSTANTS.RECRUITS).find(r => r.key === key);
        if (recruitData && count > 0 && recruitData.type !== 'tip') {
            totalExpenses += recruitData.costPerMonth * count;
        }
    });
    player.cash -= totalExpenses;
    player.expensesPerRound = totalExpenses; // Update current expense rate
    if (totalExpenses !== 0) addGameLog(`${formatCurrency(totalExpenses)} Ausgaben bezahlt.`);

    // 3. Schicksalsschläge
    if (player.incomePerRound > 50000 && Math.random() < 0.05) { // Reduced chance
        const badLuckEvents = [
            { message: "5 Ihrer Automaten sind veraltert.", effect: () => { if(player.assets.slotMachines > 0) player.assets.slotMachines = Math.max(0, player.assets.slotMachines - (player.assets.slotMachines >= 15 ? 5 : (player.assets.slotMachines >=9 ? 3:1) ) ); }}, //Original screenshot 9 had 3 automats, so maybe lose 3.
            { message: "Eine Ihrer Prostituierten wurde schwanger!", effect: () => { if(player.assets.prostitutes > 0) player.assets.prostitutes--; }},
            { message: "Auf Draengen einer Buergerinitiative mussten eine Ihrer Bars geschlossen werden.", effect: () => { if(player.assets.bars > 0) {player.assets.bars--; player.jailRounds += getRandomInt(1,5); gameState.currentScreen = 'JAIL';}}} // Original: 5 Runden Haft, 5 Bars.
        ];
        const event = badLuckEvents[getRandomInt(0, badLuckEvents.length - 1)];
        event.effect();
        const msg = `Schicksalsschlag: ${event.message}`;
        addGameLog(msg); showTemporaryMessage(msg, 5000);
    }

    // 4. Prostitutes leaving if in jail
    if (player.jailRounds > 0 && player.assets.prostitutes > 0) {
        const chanceToLeave = 0.30 + (player.assets.prostitutes * 0.04);
        if (Math.random() < chanceToLeave) {
            player.assets.prostitutes--;
            const msg = "Eine Ihrer Prostituierten hat sich einen anderen Zuhaelter gesucht!";
            addGameLog(msg); showTemporaryMessage(msg, 4000);
        }
    }

    // 5. Debt and Bankruptcy
    if (player.cash < 0) {
        player.turnsInDebt++;
        addGameLog(`${player.name} ist ${formatCurrency(player.cash*-1)} verschuldet (${player.turnsInDebt}. Runde).`);
        if (player.turnsInDebt >= 6) { // Original: 6 rounds to recover
            player.isBankrupt = true;
            addGameLog(`${player.name} ist BANKROTT!`, false);
            showTemporaryMessage(`${player.name} ist BANKROTT!`, 10000);
            gameState.currentScreen = 'GAME_OVER'; // Will be handled at start of next render
        }
    } else {
        player.turnsInDebt = 0; // Cleared debt
    }
}


function endTurn() {
    const player = getCurrentPlayer();

    // Apply end-of-turn effects unless player just got jailed by an action
    if (gameState.currentScreen !== 'JAIL' || player.jailRounds === 0) { // if already in jail (start of turn) or not jailed this action
       applyEndOfTurnEffects();
    }


    if (player.isBankrupt) {
        gameState.currentScreen = 'GAME_OVER';
        renderScreen();
        return;
    }
    
    // Handle jail decrement
    if (player.jailRounds > 0) {
        player.jailRounds--;
        addGameLog(`Sitzt eine Runde im Gefaengnis ab. Noch ${player.jailRounds} Runden.`);
        if (player.jailRounds === 0) {
            addGameLog(`Wurde aus dem Gefaengnis entlassen.`);
            showTemporaryMessage("Sie wurden aus dem Gefaengnis entlassen!", 3000);
        }
    }


    // Switch player
    gameState.currentPlayerIndex = getOtherPlayerIndex();
    const nextPlayer = getCurrentPlayer();

    addGameLog(`Es ist ${nextPlayer.name}'s Zug.`, false);


    if (gameState.currentPlayerIndex === 0) { // Player 1 (Faddie) just finished, so Player 0 (Boss) is next, meaning a full round passed
        gameState.settings.currentRound++;
        addGameLog(`Runde ${gameState.settings.currentRound} beginnt.`, false);
    }

    // Check for game end by rounds
    if (gameState.settings.roundsLimit > 0 && gameState.settings.currentRound > gameState.settings.roundsLimit) {
        gameState.currentScreen = 'GAME_OVER';
        addGameLog(`Rundenlimit erreicht. Spiel vorbei.`, false);
    } else {
        gameState.currentScreen = nextPlayer.jailRounds > 0 ? 'JAIL' : 'MAIN_MENU';
    }

    renderScreen();
}

// --- SCALING LOGIC ---
function scaleGameInterface() {
    const scalerWrapper = document.getElementById('scaler-wrapper');
    const monitorFrame = document.getElementById('monitor-frame');

    if (!scalerWrapper || !monitorFrame) {
        console.error("Scaling elements not found!");
        return;
    }

    // Get the designed dimensions of the monitor frame (from CSS variables or explicit if not using them there)
    // We need its unscaled width and height.
    // Since we calculated them with CSS variables for #monitor-frame's width/height, we can parse them.
    // This is a bit complex if they are deeply nested calc(). A simpler way is to set them explicitly if known.
    // For this example, let's assume you know the target unscaled width/height of monitorFrame or can retrieve it.

    // Get current style of monitorFrame to find its 'width' and 'height' as computed by CSS variables
    const monitorStyle = window.getComputedStyle(monitorFrame);
    const designedWidth = parseFloat(monitorStyle.width);  // This will be in pixels
    const designedHeight = parseFloat(monitorStyle.height); // This will be in pixels

    if (isNaN(designedWidth) || isNaN(designedHeight) || designedWidth === 0 || designedHeight === 0) {
        // console.warn("Could not determine designed dimensions for scaling. Using fallback or waiting.");
        // It might take a frame for CSS variables to fully compute.
        // If it's consistently NaN, the CSS var calculation for width/height of #monitor-frame needs review.
        // For now, let's try a slight delay if it's an initial load issue.
        // setTimeout(scaleGameInterface, 50); // Try again shortly
        return; // Or use hardcoded fallback values
    }


    const availableWidth = scalerWrapper.offsetWidth;
    const availableHeight = scalerWrapper.offsetHeight;

    const scaleX = availableWidth / designedWidth;
    const scaleY = availableHeight / designedHeight;

    // Use the smaller scale factor to fit an maintain aspect ratio
    const scale = Math.min(scaleX, scaleY);

    // Apply the scale
    // Add a small margin to prevent it from touching edges if scaled down a lot
    const margin = 0.98; // Scale to 98% of the smallest dimension to leave some padding
    const finalScale = scale * margin;

    monitorFrame.style.transform = `scale(${finalScale})`;

    // Adjust font size on the input field if needed after scaling, though often not necessary
    // as the whole thing scales.
    // const inputField = document.getElementById('player-input-field');
    // inputField.style.fontSize = `calc(${getComputedStyle(inputField).fontSize} / ${finalScale})`;
}


// --- INITIALIZATION ---
function initUI() {
    UIElements.screenContainer = document.getElementById('c64-container');
    UIElements.mainText = document.getElementById('main-text-area');
    UIElements.optionsList = document.getElementById('options-list');
    UIElements.promptText = document.getElementById('prompt-text');
    UIElements.playerInput = document.getElementById('player-input-field');
    UIElements.messageArea = document.getElementById('message-area');
    UIElements.statusLine = document.getElementById('status-line');
    UIElements.cursorSimulation = document.getElementById('cursor-simulation'); // Added for cursor handling

    if (!UIElements.playerInput || !UIElements.cursorSimulation) {
        console.error("Crucial UI elements for input not found!");
        return;
    }

    UIElements.playerInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const currentScreen = gameState.currentScreen;
            const inputValue = UIElements.playerInput.value;
            // UIElements.playerInput.value = ''; // Clear input immediately - MOVED to end of processPlayerInput or specific handlers

            // For screens that use the input field for choices
            if (currentScreen === 'MAIN_MENU' ||
                currentScreen === 'SMALL_THEFTS' ||
                currentScreen === 'INVESTMENTS' ||
                currentScreen === 'BRIBERY' ||
                currentScreen === 'RECRUITMENT' ||
                currentScreen === 'ACTIONS') {
                processPlayerInput(inputValue);
            }
            // Specific handlers for screens that might not use typical input processing
            else if (currentScreen === 'TITLE') handleTitleScreenInput();
            else if (currentScreen === 'STATUS') handleStatusScreenInput();
            else if (currentScreen === 'JAIL') handleJailScreenInput();
            else if (currentScreen === 'GAME_OVER') handleGameOverScreenInput();

            UIElements.playerInput.value = ''; // Clear after any Enter press that's handled
        }
    });

    // Hide system cursor when input field is focused, show custom cursor
    UIElements.playerInput.addEventListener('focus', () => {
        if (UIElements.cursorSimulation) UIElements.cursorSimulation.style.display = 'inline-block';
    });

    // Optionally, show system cursor again if input loses focus (though it should always be focused)
    // UIElements.playerInput.addEventListener('blur', () => {
    //     if (UIElements.cursorSimulation) UIElements.cursorSimulation.style.display = 'none';
    // });


    // General keypress for screens that advance on any key (and input is not focused)
    // This is tricky because 'keypress' might not fire for all keys (e.g. Shift, Alt)
    // 'keydown' is more reliable for "any key"
    document.addEventListener('keydown', (event) => {
        // Only act if the input field is NOT the source of the event
        if (document.activeElement !== UIElements.playerInput) {
            const currentScreen = gameState.currentScreen;
            if (currentScreen === 'TITLE') {
                event.preventDefault(); // Prevent default browser action for some keys
                handleTitleScreenInput();
            } else if (currentScreen === 'STATUS') {
                event.preventDefault();
                handleStatusScreenInput();
            } else if (currentScreen === 'JAIL') {
                event.preventDefault();
                handleJailScreenInput();
            } else if (currentScreen === 'GAME_OVER') {
                event.preventDefault();
                handleGameOverScreenInput();
            }
        }
    });

    // Ensure input field stays focused as much as possible for a C64 feel
    // (except when a modal or other element might legitimately take focus)
    document.body.addEventListener('click', (event) => {
        // If the click is not on the input field itself or another interactive element, refocus
        if (event.target !== UIElements.playerInput && !event.target.closest('button, a, input[type="text"]:not(#player-input-field)')) {
            if (UIElements.playerInput && (gameState.currentScreen !== 'TITLE' && gameState.currentScreen !== 'STATUS' && gameState.currentScreen !== 'JAIL' && gameState.currentScreen !== 'GAME_OVER')) {
                // Only focus if it's a screen expecting typed input
                // UIElements.playerInput.focus(); // This can be aggressive, use with caution
            }
        }
    }, true); // Use capture phase
}


// --- START THE GAME ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    renderScreen();
});