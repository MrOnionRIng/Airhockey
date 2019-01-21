var scores; //Array mit allen erspielten Scores

//Sortiert alle Scores nach Toren
function sortLocalStorage() {
    if (localStorage.length > 0) {
        var localStorageArray = new Array();
        for (i = 0; i < localStorage.length; i++) {
            localStorageArray[i] = localStorage.key(i);
        }
    }
    localStorageArray.sort();

    scores = localStorageArray;
}

sortLocalStorage();

if (scores.length != 0) {
    document.getElementById('platz1').innerHTML = scores[scores.length - 1];
}
if (scores.length >= 2) {
    document.getElementById('platz2').innerHTML = scores[scores.length - 2];
}
if (scores.length >= 3) {
    document.getElementById('platz3').innerHTML = scores[scores.length - 3];
}
if (scores.length >= 3) {
    document.getElementById('platz3').innerHTML = scores[scores.length - 4];
}
if (scores.length >= 3) {
    document.getElementById('platz3').innerHTML = scores[scores.length - 5];
}

