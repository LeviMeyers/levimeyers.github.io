let chapters = [1, 2, 3, 4];
let unlistedTracks = false;

let mode = "name"; // name; motif; location
let isTextEntry = false;
let difficulty = 1; // 0 = easy; 1 = medium; 2 = hard
let rounds = 10;

// runs on page load (mostly eventListener assignments)
function onLoad() {
    const inputs = document.querySelectorAll("input");
    for (const input of inputs) {
        // eventListeners for ALL inputs
        input.addEventListener("click", checkModesCompatible)
    }
}
document.addEventListener("DOMContentLoaded", onLoad);


function collectSettings() {
    chapters = [];
    const chapSelectInputs = document.getElementById("chapterList")
        .getElementsByTagName("input");
    for (const input of chapSelectInputs) {
        if (input.checked) {
            chapters.push(Number(input.parentElement.textContent))
        }
    }

    const ulTracksInput = document.getElementById("ulTracksToggle")
    unlistedTracks = ulTracksInput.checked;

    const textEntryInput = document.querySelector("input[value=textEntry]")
    isTextEntry = textEntryInput.checked;

    console.log(chapters);
    console.log(unlistedTracks);
    console.log(isTextEntry);
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

    difficultyDiv.hidden = !trackName.checked; // if track name not selected, hide difficulty selector

    if (textEntry.checked) {
        locationPlayed.disabled = true;

        if (locationPlayed.checked) {
            trackName.checked = true;
        }
    } else {
        locationPlayed.disabled = false;
    }
}