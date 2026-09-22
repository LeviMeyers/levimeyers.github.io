// PAGE-SPECIFIC (deltarune.js) //

let chapters = [1, 2, 3, 4];
let unlistedTracks = false;
let mode = "trackName"; // trackName; location; motif (partially game-dependent)
let isTextEntry = false;
let difficulty = 1; // 0 = easy; 1 = medium; 2 = hard
let rounds = 20;

function collectSettings() {
    chapters = [];
    const chapSelectInputs = document.getElementById("sectionList")
        .getElementsByTagName("input");
    for (const input of chapSelectInputs) {
        if (input.checked) {
            chapters.push(Number(input.parentElement.textContent));
        }
    }

    const ulTracks = document.getElementById("ulTracksToggle");
    unlistedTracks = ulTracks.checked;

    const textEntry = document.querySelector("input[value=textEntry]");
    isTextEntry = textEntry.checked;

    const modeInput = document.querySelector("input[name=quizMode]:checked");
    mode = modeInput.value;

    if (mode !== "motif") {
        const diff = document.querySelector("input[name=difficulty]:checked");
        switch(diff.value) {
            case "easy":
                difficulty = 0;
                break;
            case "medium":
                difficulty = 1;
                break;
            case "hard":
                difficulty = 2;
                break;
        }
    }

    const allTracks = document.getElementById("fullTrackToggle");
    const custRounds = document.getElementById("rounds");

    rounds = allTracks.checked ? null : custRounds.textContent;
    // if full track list enabled, set rounds to null to be set after tracklist is loaded
}

async function runQuiz() {
    collectSettings();

    await transitionStart();
    document.querySelector(".settings").style.display = "none";
    document.querySelector(".game").style.display = "flex";

    if (chapters.includes(1)) {
        await queueTSV("data/deltarune/chapter1.tsv");
        if (!unlistedTracks) {
            trackList.splice(-2, 2); // removes last two tracks
        }
    }

    prepareQuiz(mode, isTextEntry, difficulty, rounds);
    let gameRunning = true;
    while (gameRunning) {
        gameRunning = await quizRound("deltarune"); // transitionStart() called by final round
    }

    document.querySelector(".game").style.display = "none";
    document.querySelector(".results").style.display = "flex";
    await transitionEnd();

    await displayResults();
    displayRank("TOBY FOX");
}

// CORE //
let localPlayer;

// runs on page load (mostly eventListener assignments)
function onLoad() {
    localPlayer = document.querySelector("audio");
    const nextButton = document.querySelector(".game button.next");

    const modeInputs = document.getElementsByTagName("form").item(1)
        .getElementsByTagName("input");
    for (const input of modeInputs) {
        input.addEventListener("click", checkModesCompatible);
    }

    const textAreas = document.getElementsByTagName("textarea");
    for (const input of textAreas) {
        input.addEventListener("input", function() {
            this.style.height = "1em";
            this.style.height = this.scrollHeight - 20 + "px";
        })
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();

                if (input.parentElement.id === "gameTextEntry") {
                    input.nextElementSibling.click();
                    input.nextElementSibling.focus();
                }
            }
        })
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Enter" && !(nextButton.hidden)) {
            event.preventDefault();
            nextButton.click();
        }
    });
}
document.addEventListener("DOMContentLoaded", onLoad);

let youtubeEmbed;
function onYouTubeIframeAPIReady() {
    youtubeEmbed = new YT.Player("player", {
        height: "10",
        width: "10",
        videoId: "P3CNlbAbKbE",
        playerVars: {
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: "https://levimeyers.github.io"
        },
        events: {
            "onStateChange": onYoutubeEmbedStateChange
        }
    });
}

function onYoutubeEmbedStateChange(event) {
    const currentEmbedControl = document.querySelector(".infoDiv div span");

    // https://developers.google.com/youtube/iframe_api_reference#Events
    if (event.data === 0) {
        playerIconToggle(currentEmbedControl);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function maintainChecklist(checklistId, currentCheckbox) {
    const checklist = document.getElementById(checklistId)
        .getElementsByTagName("input");

    let checkedItems = 0;

    for (const input of checklist) {
        if (input.checked) {
            checkedItems++;
        }
    }

    if (checkedItems < 1) { // if this is the last checked item in the list
        currentCheckbox.checked = true; // keep it checked
    }
}

function checkModesCompatible() {
    const textEntry = document.querySelector("input[value=textEntry]")
    const location = document.querySelector("input[value=location]")
    const motif = document.querySelector("input[value=motif]")
    const trackName = document.querySelector("input[value=trackName]")
    const difficultyDiv = document.getElementById("diffWrapper");
    const allTracks = document.getElementById("fullTrackToggle");
    const roundSelector = document.getElementById("custRounds");

    if (textEntry.checked) {
        location.disabled = true;

        if (location.checked) {
            trackName.checked = true;
        }
    } else {
        location.disabled = false;
    }

    if (motif.checked || textEntry.checked) {
        difficultyDiv.hidden = true;
    } else {
        difficultyDiv.hidden = false;
    }

    roundSelector.hidden = allTracks.checked;
}

// button: this
// increment: bool = true if increasing number, false if decreasing
// step: number = how much to increment/decrement by
// floor: number = minimum value
// ceiling: number = maximum value
function numController(button, increment, step, floor, ceiling) {
    if (increment) {
        const numberElement = button.previousElementSibling;
        const number = Number(numberElement.textContent);

        if ((number + step) <= ceiling) {
            modifyNum(numberElement, (number + step));
        }
    } else {
        const numberElement = button.nextElementSibling;
        const number = Number(numberElement.textContent);

        if ((number - step) >= floor) {
            modifyNum(numberElement, (number - step));
        }
    }
}

function modifyNum(numElement, newValue) {
    numElement.classList.remove("nudgeAnim");
    void numElement.offsetWidth;

    numElement.textContent = String(newValue);

    numElement.classList.add("nudgeAnim");
}

async function toggleNameReveal() {
    const trackHeader = document.querySelector(".infoDiv h1");
    const prompt = document.querySelector(".infoDiv p");

    prompt.hidden = !prompt.hidden;
    await sleep(150);
    trackHeader.hidden = !trackHeader.hidden;
}

function playerIconToggle(customPlayer) {
    const icon = customPlayer.firstElementChild;
    if (icon.classList.contains("fa-play")) {
        icon.classList.replace("fa-play", "fa-pause");
    } else {
        icon.classList.replace("fa-pause", "fa-play");
    }
}

let prevEmbed;

// source: string = "youtube", "bandcamp", "local". any other string will just delete previous embed
// id: string/number = youtube video ID, bandcamp track ID, or ogg name
// game: string = only applicable if calling as ogg. should match a directory under music/
function setEmbedPlayer(source, id, game) {
    const playerDiv = document.querySelector(".infoDiv div");

    prevEmbed = document.querySelector(".infoDiv div *");  // stop + remove previous embed
    if (!(prevEmbed == null)) {
        prevEmbed.remove();
    }
    youtubeEmbed.stopVideo();
    localPlayer.pause();

    const playControl = document.createElement("span"); // construct custom player
    playControl.className = "customPlayer";
    playControl.addEventListener("click", () => playerIconToggle(playControl));
    const controlIcon = document.createElement("i");
    controlIcon.classList.add("fa-solid");
    controlIcon.classList.add("fa-play");
    playControl.appendChild(controlIcon);

    switch(source) {
        case "bandcamp":
            const embed = document.createElement("iframe");
            embed.className = "embedPlayer";
            embed.src = "https://bandcamp.com/EmbeddedPlayer/size=small/bgcol=333333/linkcol=4ec5ec/artwork=none/track=" +
                id + "/transparent=true/";

            playerDiv.appendChild(embed);
            break;

        case "youtube":
            youtubeEmbed.cueVideoById(id);

            playControl.addEventListener("click", () => {
                // https://developers.google.com/youtube/iframe_api_reference#Playback_status
                if (youtubeEmbed.getPlayerState() === 1) {
                    youtubeEmbed.pauseVideo();
                } else {
                    youtubeEmbed.playVideo();
                }
            });

            playerDiv.appendChild(playControl);
            break;

        case "local":
            if (id.includes("ogg") || id.includes("mp3") || id.includes("wav")) {
                localPlayer.src = "music/" + game + "/" + id;
            } else {
                localPlayer.src = "music/" + game + "/" + id + ".ogg";
            }

            playControl.addEventListener("click", () => {
                if (localPlayer.paused) {
                    localPlayer.play();
                } else {
                    localPlayer.pause();
                }
            });

            playerDiv.appendChild(playControl);
            break;
    }
}

// QUIZ //

// trackList must be accessible by other modules
let trackList = [];
let trackListCopy = [];
let chosenTrackIndex;
let chosenTrack; // the track in question to the player
let chosenAttribute;
let correctButton;
// should be module-side variables for isTextEntry, mode, difficulty, and rounds
// use prepareQuiz parameters to set these

let transitionStarted = false;

let initTime

let questionCorrect = false;
let points = 0;
let correctAnswers = 0;
let accuracy;

let totalRounds;
let currentRound = 1;

let targetedTrack; // the track currently being operated on; only used by certain functions
let targetedAttribute;

function prepareQuiz(mode, textEntry, difficulty, customRounds) {
    const progressElement = document.getElementById("progress");
    const promptElement = document.getElementById("prompt");
    points = 0;
    correctAnswers = 0;

    trackList = removeZeroAttributeTracks(trackList, mode);

    trackListCopy = trackList.slice();

    if (customRounds === null || customRounds > trackList.length) {
        totalRounds = trackList.length;
    } else {
        totalRounds = customRounds;
    }
    progressElement.innerHTML = progressElement.innerHTML.replace("XX", totalRounds)

    switch (mode) {
        case "trackName":
            promptElement.textContent = "What is the name of this track?";
            break;
        case "location":
            promptElement.textContent = "Where does this track play?";
            break;
        case "motif":
            promptElement.textContent = "Which motif does this track contain?";
            break;
    }

    if (!(isTextEntry) && difficulty === 2) { // if hard multiple choice, add extra button to list
        const extraButton = document.createElement("button");
        extraButton.classList.add("choice");
        document.getElementById("answers").appendChild(extraButton);
    }
}


// filePath: string = must be a tsv file
async function queueTSV(filePath) {
    const data = await d3.tsv(filePath, (row => { // https://d3js.org/d3-fetch#dsv
        return {
            trackNumber: +row.trackNumber,
            trackName: row.trackName,
            location: row.location.split("/").filter(function(l) {
                return l !== "";  // remove empty string array elements
            }),
            motif: row.motifs.split("/").filter(function(m) {
                return m !== "";
            }),
            bandcampID: +row.bandcampID,
            youtubeURL: row.youtubeURL,
        }
    }))
    data.forEach((row) => {
        trackList.push(row);
    })
    console.log("successfully queued tracks");
}

// game: string
async function quizRound(game) {
    updateProgress();

    chosenTrackIndex = Math.floor(Math.random() * trackList.length);
    chosenTrack = trackList[chosenTrackIndex];

    console.log(chosenTrack);

    questionCorrect = false;
    populateMultipleChoice();

    if (chosenTrack.bandcampID !== 0) {
        setEmbedPlayer("bandcamp", chosenTrack.bandcampID);
    } else if (chosenTrack.youtubeURL !== "") {
        setEmbedPlayer("youtube", chosenTrack.youtubeURL);
    } else {
        setEmbedPlayer("local", normalizeUnlisted(chosenTrack.trackName), game);
    }

    if (transitionStarted) {
        await transitionEnd();
    }
    initTime = Date.now();

    await resolveMultChoiceRound();
    tallyPoints(questionCorrect);
    await resetRound();

    currentRound++;
    return currentRound <= totalRounds;
}

function populateMultipleChoice() {
    const buttons = Array.from(document.querySelectorAll("#answers button.choice"));
    addKeyInputToList(buttons);

    let trackListPull = structuredClone(trackList); // deep copy tracklist to avoid permanent mutati
    let chosenTrackIndexPull = chosenTrackIndex;

    // if track list is small enough to cause trivial track comparisons, switch references to an untouched copy
    if (trackList.length < Math.floor(trackListCopy.length * 0.20)) {
        trackListPull = structuredClone(trackListCopy);
        chosenTrackIndexPull = trackListPull.indexOf(chosenTrack);
    }

    if (mode !== "trackName") {
        chosenAttribute =
            (mode === "location") ? // ternary operator for location/motif
                chosenTrack.location[Math.floor(Math.random() * chosenTrack.location.length)] :
                chosenTrack.motif[Math.floor(Math.random() * chosenTrack.motif.length)];

        // to avoid matchups containing any of the current track's attributes
        targetedTrack = chosenTrack;
        rmTargetTrackAttributesFromElse(trackListPull);
        trackListPull = removeZeroAttributeTracks(trackListPull, mode);
    }

    // give a random button the correct answer and remove it from the available buttons list
    correctButton = buttons[Math.floor(Math.random() * buttons.length)];
    if (mode === "trackName") {
        correctButton.textContent = chosenTrack.trackName;
    } else {
        correctButton.textContent = chosenAttribute;
    }
    buttons.splice(buttons.indexOf(correctButton), 1);

    let wrongChoices = generateWrongChoices(trackListPull, chosenTrackIndexPull);

    while (buttons.length > 0) {
        // choose a random wrong track and delete it from the list
        const randWrong = wrongChoices.splice(Math.floor(Math.random() * wrongChoices.length), 1)[0];
        if (mode !== "trackName") {
            trackListPull.splice(trackListPull.indexOf(randWrong), 1);
            // incorrect choice must also be deleted from trackListPull since attribute modes use it for
            // advanced searching

            targetedTrack = randWrong;
            rmTargetTrackAttributesFromElse(trackListPull);
            trackListPull = removeZeroAttributeTracks(trackListPull, mode);

            // regenerate wrongChoices to account for deleted empty tracks
            wrongChoices = generateWrongChoices(trackListPull, chosenTrackIndexPull);
        }

        // give a random button the answer belonging to the wrong track and delete it from the buttons list
        if (mode === "trackName") {
            buttons.splice(Math.floor(Math.random() * buttons.length), 1)[0].textContent =
                randWrong.trackName;
        } else {
            buttons.splice(Math.floor(Math.random() * buttons.length), 1)[0].textContent =
                (mode === "location") ? // ternary operator for location/motif
                    randWrong.location[Math.floor(Math.random() * randWrong.location.length)] :
                    randWrong.motif[Math.floor(Math.random() * randWrong.motif.length)];
        }
    }
    console.log(trackListPull);

    trackList.splice(chosenTrackIndex, 1);
}

function generateWrongChoices(trackArray, correctIndex) {
    if (difficulty === 0) { // choose completely random tracks
        const wrongArray = [];

        while (wrongArray.length < 2) {
            const randSong = trackArray[Math.floor(Math.random() * trackArray.length)];
            if (!wrongArray.includes(randSong) && chosenTrack !== randSong) {
                wrongArray.push(randSong);
            }
        }

        return wrongArray;
    } else { // choose random tracks in a 2-track radius around the correct one
        return findAdjacents(trackArray, correctIndex, 2);
    }
}

function rmTargetTrackAttributesFromElse(trackArray) {
    switch (mode) {
        case "location":
            for (let location of targetedTrack.location) {
                targetedAttribute = location;
                trackArray.forEach(removeTargetedAttribute);
            }
            break;
        case "motif":
            for (let motif of targetedTrack.motif) {
                targetedAttribute = motif;
                trackArray.forEach(removeTargetedAttribute);
            }
            break;
        default:
            break;
    }
}

function removeTargetedAttribute(track) {
    switch (mode) {
        case "location":
            if (track.location.includes(targetedAttribute)) {
                track.location.splice(track.location.indexOf(targetedAttribute), 1);
            }
            break;
        case "motif":
            if (track.motif.includes(targetedAttribute)) {
                track.motif.splice(track.motif.indexOf(targetedAttribute), 1);
            }
            break;
        default:
            break;
    }
}

// trackArray: array = the array to be operated on, filled with objects containing attributes identical to the parameter
// attribute: string = the object attribute type to be cleaned for repeats (location/motif)
function removeZeroAttributeTracks(trackArray, attributeType) {
    switch (attributeType) {
        case "location":
            return trackArray.filter(function(track) {
                return track.location.length > 0;
            })
        case "motif":
            return trackArray.filter(function(track) {
                return track.motif.length > 0;
            })
        default:
            return trackArray;
    }
}

// if embed player click event detection ever implemented, remember to remove focus from the element (blur()?)

function resolveMultChoiceRound() {
    const buttons = Array.from(document.querySelectorAll("#answers button.choice"));

    return new Promise((resolve) => {
        async function clickDetector() { // what to do once button is clicked
            buttons.forEach((but) => {
                but.removeEventListener("click", clickDetector); // remove event listeners to avoid inception
                but.disabled = true;
            })

            if (this !== correctButton) {
                this.style.color = "var(--soft-red)";
            } else {
                questionCorrect = true;
            }

            correctButton.style.border = "solid 3px var(--accent-green-dark)";
            correctButton.style.color = "var(--accent-green-dark)";

            document.querySelector(".infoDiv h1").textContent = chosenTrack.trackName;
            await toggleNameReveal();

            resolve();
        }

        buttons.forEach((button) => {
            button.addEventListener("click", clickDetector);
        })
    })
}

async function resetRound() {
    const nextButton = document.querySelector(".game button.next");
    const buttons = Array.from(document.querySelectorAll("#answers button.choice"));

    await sleep(1000);
    nextButton.hidden = false;

    return new Promise((resolve) => {
        async function clickDetector() {
            nextButton.removeEventListener("click", clickDetector);
            nextButton.hidden = true;

            if (currentRound < totalRounds) {
                await toggleNameReveal();
            } else {
                await transitionStart();
                setEmbedPlayer();
            }

            document.querySelector(".infoDiv h1").textContent = "";
            document.querySelector("#gameTextEntry textarea").textContent = "";
            document.querySelector("#gameTextEntry textarea").attributeStyleMap.clear();
            buttons.forEach((button) => {
                button.disabled = false;
                button.attributeStyleMap.clear();
            })

            resolve();
        }

        nextButton.addEventListener("click", clickDetector);
    })
}

async function displayResults() {
    const pointsElement = document.getElementById("points");
    const accuracyElement = document.getElementById("accuracy");

    accuracy = Math.round(100 * (correctAnswers / totalRounds));

    await accumNumber(pointsElement, points);
    await accumNumber(accuracyElement, accuracy);
}

// maps difficulties (0/1/2) to default points awarded on correct answer
const difficultyToPoints = new Map([
    [0, 75],
    [1, 100],
    [2, 125]
])

// correct: boolean = questionCorrect
function tallyPoints(correct) {
    const ms = Date.now() - initTime;
    let perfectMs;
    let pts = 0;

    switch (mode) {
        case "trackName":
            perfectMs = 3000;
            break;
        case "location":
            perfectMs = 7000;
            break;
        case "motif":
            perfectMs = 8000;
            difficulty = 2; // test if this works
            break;
        case "textEntry":
            // assign based on length of normalizedAnswer (should be a global variable)
            break;
    }

    if (correct) {
        correctAnswers++;

        if (mode === "textEntry") {
            pts = 250;
        } else {
            pts = difficultyToPoints.get(difficulty);
        }

        if (ms <= 0 ) {
            pts = 0;
        }
        else if (ms <= perfectMs) {
            pts += 100;
        } else if (ms < (perfectMs + 10000)) {
            pts += Math.round((100 - ((ms - perfectMs) / 100)));
        }
    }

    points += pts;
    if (pts > 0) {
        addPopupValue("pointDisplay", "+" + pts + " POINTS");
    }
}

function displayRank(impossibleRank) {
    const rankElement = document.getElementById("rank");
    let rankTitle;

    const maxPointsPossible = isTextEntry ? 350 * totalRounds :
        (difficultyToPoints.get(difficulty) + 100) * totalRounds;
    const perfectPercentage = 100 * (points / maxPointsPossible);
    console.log(perfectPercentage);

    if (perfectPercentage > 98) {
        rankTitle = impossibleRank ?? "IMPOSSIBLE";
    } else if (perfectPercentage >= 93 && accuracy >= 100) {
        rankTitle = "P";
    } else if (perfectPercentage >= 93) {
        rankTitle = "S";
    } else if (perfectPercentage >= 85 || (accuracy >= 100 && totalRounds >= 20)) {
        rankTitle = "A";
    } else if (perfectPercentage >= 75) {
        rankTitle = "B";
    } else if (perfectPercentage >= 65) {
        rankTitle = "C";
    } else if (perfectPercentage > 40) {
        rankTitle = "Z";
    } else {
        rankTitle = "LARPER";
    }

    rankElement.previousElementSibling.textContent = rankTitle;
    rankElement.textContent = rankTitle;
    rankElement.classList.add(rankTitle.replace(" ", "") + "-rank");
    rankElement.hidden = false;
}

function updateProgress() {
    const progressElement = document.getElementById("progress");
    const currRoundElement = progressElement.firstElementChild

    currRoundElement.textContent = String(currentRound);
}

// divID: string
// value: string
function addPopupValue(divID, value) {
    const div = document.getElementById(divID);
    const popup = div.appendChild(document.createElement("p"));
    popup.textContent = value;

    setTimeout(async function() {
        popup.hidden = true;
        await sleep(500);
        popup.remove();
    }, 5000);
}

// elements: array/list/whatever of HTML elements
function addKeyInputToList(elements) {
    for (let i = 1; i <= elements.length; i++) {
        const item = elements[i - 1];

        document.addEventListener("keydown", event => {
            if (event.key === "" + i) {
                item.click();
            }
        })
    }
}

// array: array
// index: number = index of item to search around
// radius: number = radius to be searched
function findAdjacents(array, index, radius) {
    let adjacents;
    const itemAtIndex = array[index];

    if (index < radius) { // if item is too close to start of array
        adjacents = array.slice(0, radius * 2 + 1);
    } else if (index > array.length - (radius + 1)) { // if item is too close to end of array
        adjacents = array.slice(array.length - (radius * 2 + 1), array.length);
    } else {
        adjacents = array.slice(index - radius, index + radius + 1);
    }

    adjacents.splice(adjacents.indexOf(itemAtIndex), 1); // remove original item at index
    return adjacents;
}
// returns an array of size radius * 2

// trackName: string
function normalizeUnlisted(trackName) {
    if (trackName.includes(".ogg")
    || trackName.includes(".mp3")
    || trackName.includes(".wav")) {
        return trackName.substring(0, trackName.length - 4);
    } else {
        return trackName;
    }
}

async function transitionStart() {
    const transitionElement = document.getElementById("transition");

    transitionElement.style.display = null;
    await sleep(1);
    transitionElement.style.minWidth = "200vw";
    transitionStarted = true;
    await sleep(1400);
}

async function transitionEnd() {
    const transitionElement = document.getElementById("transition");

    transitionElement.style.transform = "translate(200vw)";
    transitionStarted = false;
    await sleep(1000);

    transitionElement.style.display = "none";
    transitionElement.style.transform = null;
    transitionElement.style.minWidth = null;
}

async function accumNumber(numElement, target) {
    const fastIncrement = 38;
    const slowdownPoint = 350;
    const slopeIntersection = 54; // raise to have smoother easing

    let currentVal = Number(numElement.textContent);
    let distFromTarget = target - currentVal;

    let i = 0;
    while (currentVal < target) {
        if (currentVal < (target - slowdownPoint)) {
            numElement.textContent = currentVal + fastIncrement;
            await sleep(1);

            distFromTarget = target - Number(numElement.textContent);
        } else {
            numElement.textContent = currentVal + 1;
            await sleep(1.1 ** (i -(distFromTarget - slopeIntersection)) + 1);

            i++;
        }

        currentVal = Number(numElement.textContent);
    }
}