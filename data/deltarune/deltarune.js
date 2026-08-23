// PAGE-SPECIFIC (deltarune.js) //

async function game() {
    if (chapters.includes(1)) {
        await queueTSV("data/deltarune/chapter1.tsv");
        if (unlistedTracks) {
            // wip
        }
    }
}

// CORE //

let localPlayer;

let chapters = [1, 2, 3, 4];
let unlistedTracks = false;
let mode = "trackName"; // trackName; locationPlayed; motif (partially game-dependent)
let isTextEntry = false;
let difficulty = 1; // 0 = easy; 1 = medium; 2 = hard
let rounds = 10;

let textInput;

// runs on page load (mostly eventListener assignments)
function onLoad() {
    localPlayer = document.querySelector("audio");

    const modeInputs = document.getElementsByTagName("form").item(1)
        .getElementsByTagName("input");
    for (const input of modeInputs) {
        input.addEventListener("click", checkModesCompatible);
    }

    const textAreas = document.getElementsByTagName("textarea");
    for (const input of textAreas) {
        input.addEventListener("keydown", event => {
            if (event.code === "Enter") {
                event.preventDefault();

                if (input.parentElement.id === "gameTextEntry") {
                    input.nextElementSibling.click();
                    input.nextElementSibling.focus();
                }
            }
        })
        input.addEventListener("input", function() {
            this.style.height = "1em";
            this.style.height = this.scrollHeight - 20 + "px";
        })
    }
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
    const currentEmbedControl = document.querySelector("#infoDiv div span");

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
    const locationPlayed = document.querySelector("input[value=locationPlayed]")
    const trackName = document.querySelector("input[value=trackName]")
    const difficultyDiv = document.getElementById("diffWrapper");
    const spoilerWarning = document.getElementById("spoilerWarning");

    if (textEntry.checked) {
        locationPlayed.disabled = true;

        if (locationPlayed.checked) {
            trackName.checked = true;
        }
    } else {
        locationPlayed.disabled = false;
    }

    if (!trackName.checked || textEntry.checked) {
        difficultyDiv.hidden = true;
    } else {
        difficultyDiv.hidden = false;
    }
    spoilerWarning.hidden = !locationPlayed.checked; // if location played is selected, show spoiler warning
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

// might end up being game-specific based on game setting discrepancies
function collectSettings() {
    chapters = [];
    const chapSelectInputs = document.getElementById("chapterList")
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

    rounds = Number(document.getElementById("rounds").textContent);

    console.log(chapters);
    console.log(unlistedTracks);
    console.log(isTextEntry);
    console.log(mode);
    console.log(difficulty);
    console.log(rounds);
}

// when implemented, call once before using setInterval to avoid 500 ms delay
// nowPlayingLoop; setInterval(nowPlayingLoop, 500);
function nowPlayingLoop() {
    const playingElement = document.getElementById("playingStatus")
    const playingContent = playingElement.textContent;

    switch (playingContent) {
        default:
        case "Now playing...":
            playingElement.textContent = "Now playing.";
            break;
        case "Now playing.":
            playingElement.textContent = "Now playing..";
            break;
        case "Now playing..":
            playingElement.textContent = "Now playing...";
    }
}
// <p id="playingStatus">Get ready!</p>

async function countdownAnim() {
    const countdownDiv = document.getElementById("countdown");
    const numbers = countdownDiv.children;
    const trackName = countdownDiv.previousElementSibling;

    await sleep(1000);

    for (const num of numbers) {
        num.style.color = "white";
        num.style.textShadow = "0px 0px 10px rgba(255,255,255,0.5)";
        await sleep(1000);
    }

    countdownDiv.style.display = "none";
    trackName.style.display = "block";
}
// <div id="countdown"><span>3</span><span>2</span><span>1</span></div>

function collectTextInput() {
    const inputArea = document.querySelector("#gameTextEntry textarea");

    textInput = inputArea.value;
}

async function toggleNameReveal() {
    const trackHeader = document.querySelector("#infoDiv h1");
    const prompt = document.querySelector("#infoDiv p");

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
    const playerDiv = document.querySelector("#infoDiv div");

    prevEmbed = document.querySelector("#infoDiv div *");  // stop + remove previous embed
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

let trackList = [];
let chosenTrackIndex;
let chosenTrack;
let correctButtonIndex;
let correctButton;

// filePath: string = must be a tsv file
async function queueTSV(filePath) {
    const data = await d3.tsv(filePath, (row => { // https://d3js.org/d3-fetch#dsv
        return {
            trackNumber: +row.trackNumber,
            trackName: row.trackName,
            location: row.location.split("/"),
            motifs: row.motifs.split("/").filter(function (m) {
                return m !== ""; // remove empty string array elements from 0-motif tracks
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
// difficulty: number = 0/1/2
async function beginRound(game, difficulty) {
    // await queueTSV("music/deltarune/chapter1.tsv"); use this ONCE after game begins

    chosenTrackIndex = Math.floor(Math.random() * trackList.length);
    chosenTrack = trackList[chosenTrackIndex];
    console.log(chosenTrack);

    populateMultipleChoice(difficulty);

    if (chosenTrack.bandcampID !== 0) {
        setEmbedPlayer("bandcamp", chosenTrack.bandcampID);
    } else if (chosenTrack.youtubeURL !== "") {
        setEmbedPlayer("youtube", chosenTrack.youtubeURL);
    } else {
        setEmbedPlayer("local", normalizeUnlisted(chosenTrack.trackName), game);
    }

    // add eventListeners to multiple choice buttons that progress the round
}

function populateMultipleChoice(difficulty) {
    const buttons = Array.from(document.querySelectorAll("#answers button.choice"));

    correctButtonIndex = Math.floor(Math.random() * buttons.length);
    correctButton = buttons[correctButtonIndex];
    correctButton.textContent = chosenTrack.trackName;
    buttons.splice(correctButtonIndex, 1);

    // !! IMPORTANT !!  because wrong choices are neighbors of the chosen track, this function will need to start
    // pulling from an untouched copy of the original tracklist when the actual tracklist is small enough
    let wrongChoices;
    if (difficulty === 1) {
        if (chosenTrackIndex === 0) {
            wrongChoices = trackList.slice(1, 3);
        } else if (chosenTrackIndex === trackList.length - 1) {
            wrongChoices = trackList.slice(trackList.length - 3, trackList.length - 1);
        } else {
            wrongChoices = trackList.slice(chosenTrackIndex - 1, chosenTrackIndex + 2);
            wrongChoices.splice(Math.floor(wrongChoices.length / 2), 1); // remove middle index (correct choice)
        }
    } else {
        if (chosenTrackIndex === 0) {
            wrongChoices = trackList.slice(1, 5);
        } else if (chosenTrackIndex === trackList.length - 1) {
            wrongChoices = trackList.slice(trackList.length - 5, trackList.length - 1);
        } else {
            wrongChoices = trackList.slice(chosenTrackIndex - 2, chosenTrackIndex + 3);
            wrongChoices.splice(Math.floor(wrongChoices.length / 2), 1); // remove middle index (correct choice)
        }
    }
    // wrongChoices.forEach((track) => {
    //     console.log(track);
    // })

    // delete random wrong choices until the amount of wrong choices matches the amount of buttons to fill
    while (wrongChoices.length > buttons.length) {
        wrongChoices.splice(Math.floor(Math.random() * wrongChoices.length), 1);
    }

    while (buttons.length > 0) {
        const randWrongIndex = Math.floor(Math.random() * wrongChoices.length);
        const randWrong = wrongChoices[randWrongIndex];
        const randIncorrectButtonIndex = Math.floor(Math.random() * buttons.length);

        buttons[randIncorrectButtonIndex].textContent = randWrong.trackName;

        wrongChoices.splice(randWrongIndex, 1);
        buttons.splice(randIncorrectButtonIndex, 1);
    }

    trackList.splice(chosenTrackIndex, 1);
}

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