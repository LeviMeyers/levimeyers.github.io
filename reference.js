var bgColor // variables declared with var belong to HTML window object
// ex: can be referenced with window.bgColor

const thing = "CONSTANT STRING";

let x = 5.0;
let words = "stuff";
let maybe = true;
let something; // unintialized variable

let names = ["John", "Jacob", "Jingleheimer Schmidt"];
let jacobString = names[1];
names.push("His name is my name too") ;// append
names.pop(); // remove last item
// adding or removing elements in the middle sucks. look up .splice()
// also lots of useful array methods in array reference
// ex: forEach is like pandas execute or whatever

console.log("Print stuff to the console");

if (something === 4) {
    console.log("Just like java!!!");
} else if (something === 3) {
    console.log("Just like java!!!");
}

while (true) {
    if (words === "awesome") {
        break;
    } else {
        // pass doesn't exist. instead just type nothing
    }
}

for (let i = 0; i < 5; i++) {
    // 0, 1, 2, 3, 4
}
for (let name in names) {
    // John, Jacob, Jingleheimer Schmidt
}

function addX(username) {
    x++;
    // no parameter or return typing, just return whatever whenever
}

// objects: crazy variable type instead of class member
// stored in key-value pairs like python dictionaries
let song = {
    title: "Song1",
    length: [2, 15],
    isOnSoundtrack: false
};

let songTitle = song.title