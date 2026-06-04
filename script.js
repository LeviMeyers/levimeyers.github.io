let chapters = [1, 2, 3, 4];
let unlistedTracks = false;

let mode = "name"; // name; motif; location
let isTextEntry = false;
let difficulty = 1; // 0 = easy; 1 = medium; 2 = hard
let rounds = 10;

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

    const textEntryInput = document.getElementById("entryMode")
        .getElementsByTagName("input").item(1)
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

    // // if this is the last checked item in the list
    if (checkedItems < 1) {
        currentCheckbox.checked = true;
    }
}