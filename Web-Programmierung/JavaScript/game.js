var pausenzaehler = 0;
var meinScorekomp;
var botScorekomp;
var player1;
var mybackground;
var bot;
var musicTheme;
var puck;
var tor1;
var tor2;
var meinScore = 0;
var botScore = 0;
var testKomponente;
var puckhitsound;
var puckintorsound;


function startgame()
{
    meinScorekomp = new komponente(88, 30, '35px', 'Consolas', 'red', 'text');
    botScorekomp = new komponente(300, 30, '35px', 'Consolas', 'blue', 'text');
    player1 = new komponente(200, 520, 25, 25, 'red', 'circle', 'spieler');
    bot = new komponente(200, 70, 25, 25, 'blue', 'circle', 'bot');
    puck = new komponente(200, 310, 15, 15, 'black', 'circle', 'puck');
    mybackground = new komponente(0, 0, 400, 600, '../Pictures/Spielfeld.jpg', 'image');
    tor1 = new komponente(127, 0, 150, 45, 'transparent');
    tor2 = new komponente(127, 550, 150, 45, 'transparent');
    musicTheme = new sound('../Sounds/Theme.mp3');
    puckhitsound = new sound("../Sounds/Puckhit.mp3");
    puckintorsound = new sound("../Sounds/PuckInTor.mp3");
    testKomponente = new komponente(300, 320, 25, 25, '../Pictures/Schlaeger1.gif', 'circleImage');
    musicTheme.play();
    myGameArea.start();
}

var myGameArea = {
    canvas: document.createElement('canvas'),
    start: function() {
        this.canvas.width = 400; //Canvas soll 640x480 px groß sein egal?
        this.canvas.height = 600;
        this.canvas.style.cursor = 'blue'; //Cursor auf Canvas verstecken
        this.context = this.canvas.getContext('2d'); //2d hat Methoden zum schreiben auf canvas
        document.body.insertBefore(this.canvas, null); //Problem: null sollte eig. document.body.childNodes[0] sein lädt aber dann vor der navbar
        this.interval = setInterval(updateGameArea, 20); //ruft updateGameArea jede 20ste Millisekunde auf (50 mal pro Sekunde)

        window.addEventListener('keydown', function(e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', function(e) {
            myGameArea.keys[e.keyCode] = false;
        });
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
    }

};

function komponente(x, y, width, height, color, type, form) //Funktion zur Erstellung der Komponenten im Spiel
{
    if (type == 'image' ) {
        this.image = new Image();
        this.image.src = color;
    }
    this.type = type;
    this.form = form;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.update = function() {
        var ctx = myGameArea.context;
        if (this.type == 'image') {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        if (this.type == 'text') {
            ctx.font = this.width + ' ' + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        }
        if (this.type == 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.height, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    this.newPos = function() //neue Position des Objekts basierend auf speed
    {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.form == 'puck') {
            if (375 - this.height < this.x) {
                this.speedX = -(this.speedX);
            }
            if (20 + this.height > this.x) {
                this.speedX = -(this.speedX);
            }
            if (30 + this.height > this.y) {
                this.speedY = -(this.speedY);
            }
            if (560 - this.height < this.y) {
                this.speedY = -(this.speedY);
            }

        } else if (this.form == 'spieler') {
            if (375 - this.height < this.x) {
                this.x -= this.speedX;
            }
            if (20 + this.height > this.x) {
                this.x -= this.speedX;
            }
            if (300 + this.height > this.y) {
                this.y -= this.speedY;
            }
            if (560 - this.height < this.y) {
                this.y -= this.speedY;
            }
        }else if (this.form == 'bot') {
            if (375 - this.height < this.x) {
                this.x -= this.speedX;
            }
            if (20 + this.height > this.x) {
                this.x -= this.speedX;
            }
            if (30 + this.height > this.y) {
                this.y -= this.speedY;
            }
            if (320 - this.height < this.y) {
                this.y -= this.speedY;
            }
        }
    };

    this.aufprall = function(anderesobjekt) //überprüft ob ein Aufprall stattfindet (Rechtecke)
    {
        var links = this.x;
        var rechts = this.x + this.width;
        var oben = this.y;
        var unten = this.y + this.height;
        var andereslinks = anderesobjekt.x;
        var anderesrechts = anderesobjekt.x + anderesobjekt.width;
        var anderesoben = anderesobjekt.y;
        var anderesunten = anderesobjekt.y + anderesobjekt.height;
        var crash = true;
        if ((unten < anderesoben) || (oben > anderesunten) || (rechts < andereslinks) || (links > anderesrechts)) {
            crash = false;
        }
        return crash;

    };

    this.aufprallCircle = function(anderesObject) //Überprüft Aufprall mit Kreis
    {
        if (this.getDistance(anderesObject) < this.height + anderesObject.height) {
            return true;
        }
        return false;
    };


    //Bot bewegt sich, nachdem er das erste mal vom Puck getroffen wurde random im Feld. Speed wird neu gewürfelt, nachdem der Bot auf eine Wand getroffen ist
    this.botlaueft = function()
    {
        var array = [-10,-9,-8,-7,-6,-5,-4,-3,-3,4,5,6,7,8,9,10];

        if(this.speedX == 0 && this.speedY == 0 && this.aufprallCircle(puck)){

            this.speedX = array[Math.floor((Math.random() * 15) +1)];
            this.speedY = array[Math.floor((Math.random() * 15) +1)];
        }

        if (360 - this.height < this.x) {
            this.speedX = array[Math.floor((Math.random() * 15) +1)];
        }
        if (30 + this.height > this.x) {
            this.speedX = array[Math.floor((Math.random() * 15) +1)];
        }
        if (40 + this.height > this.y) {
            this.speedY = array[Math.floor((Math.random() * 15) +1)];
        }
        if (310 - this.height < this.y) {
            this.speedY = array[Math.floor((Math.random() * 15) +1)];
        }


    };

    this.getDistance = function(andersObject) {
        let xDistence = this.x - andersObject.x;
        let yDistance = this.y - andersObject.y;

        return Math.sqrt(Math.pow(xDistence, 2) + Math.pow(yDistance, 2));
    };

}

function controls() //Funktion für die Steuerung des Spielerschlägers
{
    player1.speedX = 0;
    player1.speedY = 0;
    if (myGameArea.keys && myGameArea.keys[37]) {player1.speedX = -4; }
    if (myGameArea.keys && myGameArea.keys[39]) {player1.speedX = 4; }
    if (myGameArea.keys && myGameArea.keys[38]) {player1.speedY = -4; }
    if (myGameArea.keys && myGameArea.keys[40]) {player1.speedY = 4; }

}

function spielReset() //Resetet das Spiel
{
    player1.x = 200;
    player1.y = 520;
    bot.x = 200;
    bot.y = 70;
    bot.speedX = 0;
    bot.speedY = 0;
    puck.speedX = 0;
    puck.speedY = 0;
    puck.x = 200;
    puck.y = 310;

}

function torschiessen() //Torschuss Funktion
{
    if (puck.aufprall(tor1)) {
        puckintorsound.play();
        spielReset();
        meinScore += 1;
    }
    if (puck.aufprall(tor2)) {
        puckintorsound.play();
        spielReset();
        botScore += 1;
    }
}

function gewonnenVerloren() //sagt wann man Verloren hat (Win-Situation wurde rausgenommen da sonst der Highscore nicht mehr nötig wäre)
{
    if (botScore == 3) {
        musicTheme.stop();
        alert('YOU LOOSE! YOU COULDN\'T HANDLE THE BEAST! Sehe dein Score im Highscore-Tab!');
        localStorage.setItem(meinScore,meinScore);
        document.location.reload();
        myGameArea.stop();
    }
}

function sound(src) //Funktion zur Einfügung von Sounds
{
    this.sound = document.createElement('audio');
    this.sound.src = src;
    this.sound.setAttribute('preload', 'auto');
    this.sound.setAttribute('controls', 'none');
    this.sound.style.display = 'none';
    document.body.appendChild(this.sound);
    this.play = function() {
        this.sound.play();
    };
    this.stop = function() {
        this.sound.pause();
    };

}

//Methode für das Abprallen des Pucks bei Kontakt mit einem Spieler
function puckbounce(player) {
    if (player.aufprallCircle(puck) && player.speedX === 0 && player.speedY === 0) {
        puck.speedX = (puck.speedX * -1);
        puck.speedY = (puck.speedY * -1);
    }
    if (player.aufprallCircle(puck)) {
        if (player.speedX < 0 && player.speedY == 0) {
            if (puck.speedX < 0) {
                puck.speedX = puck.speedX * -1;
                return;
            }
            puck.x = puck.x - 5; //Sonst bugt sich der puck im Spieler fest
            puck.speedX = player.speedX - 2;
            puck.speedY = player.speedY;
        }
        if (player.speedX > 0 && player.speedY == 0) {
            if (puck.speedX > 0) {
                puck.speedX = puck.speedX * -1;
                return;
            }
            puck.x = puck.x + 5;
            puck.speedX = player.speedX + 2;
            puck.speedY = player.speedY;
        }
        if (player.speedX == 0 && player.speedY < 0) {
            if (puck.speedY < 0) {
                puck.speedY = puck.speedY * -1;
                return;
            }
            puck.y = puck.y - 5;
            puck.speedX = player.speedX;
            puck.speedY = player.speedY - 2;
        }
        if (player.speedX == 0 && player.speedY > 0) {
            if (puck.speedY > 0) {
                puck.speedY = puck.speedY * -1;
                return;
            }
            puck.y = puck.y + 5;
            puck.speedX = player.speedX;
            puck.speedY = player.speedY + 2;
        }
        if (player.speedX > 0 && player.speedY > 0) {
            if (puck.speedX > 0 && puck.speedY > 0) {
                puck.speedX = puck.speedX * -1;
                puck.speedY = puck.speedY * -1;
                return;
            }
            puck.x = puck.x + 5;
            puck.y = puck.y + 5;
            puck.speedX = player.speedX + 2;
            puck.speedY = player.speedY + 2;
        }
        if (player.speedX > 0 && player.speedY < 0) {
            if (puck.speedX > 0 && puck.speedY < 0) {
                puck.speedX = puck.speedX * -1;
                puck.speedY = puck.speedY * -1;
                return;
            }
            puck.x = puck.x + 5;
            puck.y = puck.y - 5;
            puck.speedX = player.speedX + 2;
            puck.speedY = player.speedY - 2;
        }
        if (player.speedX < 0 && player.speedY < 0) {
            if (puck.speedX < 0 && puck.speedY < 0) {
                puck.speedX = puck.speedX * -1;
                puck.speedY = puck.speedY * -1;
                return;
            }
            puck.x = puck.x - 5;
            puck.y = puck.y - 5;
            puck.speedX = player.speedX - 2;
            puck.speedY = player.speedY - 2;
        }
        if (player.speedX < 0 && player.speedY > 0) {
            if (puck.speedX < 0 && puck.speedY > 0) {
                puck.speedX = puck.speedX * -1;
                puck.speedY = puck.speedY * -1;
                return;
            }
            puck.x = puck.x - 5;
            puck.y = puck.y + 5;
            puck.speedX = player.speedX - 2;
            puck.speedY = player.speedY + 2;
        }
    }
}


function updateGameArea() //clear und update gegen Objekt-Trail beim bewegen +
{
    myGameArea.clear();
    myGameArea.frameNo += 1;
    controls();
    puckbounce(player1);
    puckbounce(bot);
    mybackground.newPos();
    mybackground.update();
    testKomponente.newPos();
    testKomponente.update();
    puck.newPos();
    puck.update();
    bot.newPos();
    bot.update();
    player1.newPos();
    player1.update();
    meinScorekomp.text = meinScore;
    meinScorekomp.update();
    botScorekomp.text = botScore;
    botScorekomp.update();
    tor1.newPos();
    tor1.update();
    tor2.newPos();
    tor2.update();
    bot.botlaueft();
    torschiessen();
    gewonnenVerloren();

}

function pause() //Pausiert das Spiel
{
    pausenzaehler++;
    if (pausenzaehler % 2 == 1) {
        musicTheme.stop();
        myGameArea.stop();

    } else {
        musicTheme.play();
        myGameArea.start();
    }
}