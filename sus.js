function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

let deckID = "";
let empty = createArray(4);
let isHuman = [false,false,false,false];
let scores = [0,0,0,0];
let usedCards = createArray();
let burntCards = createArray();
let cardVal = ['A','2','3','4','5','6','7','8','9','0','J','Q','K'];
let suite = ['C','H','S','D'];
let startingPlayer = -1;
let selectedCard = "";
let playerIndex = -1;
let cardsref = createArray(4,13);

document.addEventListener('DOMContentLoaded',() =>{

    let startBtn = document.getElementById('start');

    startBtn.addEventListener('click',(evt) =>{
        console.info('game started');
        document.getElementById('results').innerHTML = "<option>Loading...</option>" + document.getElementById('results').innerHTML;
        let numPpl = document.getElementById('players').value;

        let current = document.getElementById('buttons').innerHTML;
        current += '<button id = "burn" style = "float: left">Burn</button><button id = "place" style = "float: right">Place</button>';
        document.getElementById('buttons').innerHTML = current;

        let burnBtn = document.getElementById('burn');

        burnBtn.addEventListener('click',(evt) =>{
            document.getElementById(selectedCard).setAttribute("class","");
                let sus = -1;
                for(let i = 0; i < 4; i++){
                    if(cardsref[i].indexOf(selectedCard)>-1){
                        sus = i;
                    }
                }
                for(let j = 0; j < 13; j++){
                    if(usedCards.indexOf(cardsref[sus][j]) == -1 && burntCards.indexOf(cardsref[sus][j])==-1){
                        document.getElementById(cardsref[sus][j]).setAttribute("src","https://opengameart.org/sites/default/files/card%20back%20blue.png")
                    }
                }
                burntCards.push(document.getElementById(selectedCard).alt);
            burnCard(deckID, document.getElementById(selectedCard).id);
        });

        let PlaceBtn = document.getElementById('place');

        PlaceBtn.addEventListener('click',(evt) =>{
            if((usedCards.indexOf(cardVal[cardVal.indexOf(selectedCard.substring(0,1))+1] + selectedCard.substring(1))>-1) || (usedCards.indexOf(cardVal[cardVal.indexOf(selectedCard.substring(0,1))-1] + selectedCard.substring(1))>-1) || selectedCard.substring(0,1) === "7"){
                document.getElementById(selectedCard).setAttribute("class","");
                let sus = -1;
                for(let i = 0; i < 4; i++){
                    if(cardsref[i].indexOf(selectedCard)>-1){
                        sus = i;
                    }
                }
                for(let j = 0; j < 13; j++){
                    if(usedCards.indexOf(cardsref[sus][j]) == -1 && burntCards.indexOf(cardsref[sus][j])==-1){
                        document.getElementById(cardsref[sus][j]).setAttribute("src","https://opengameart.org/sites/default/files/card%20back%20blue.png")
                    }
                }
                usedCards.push(document.getElementById(selectedCard).alt);
                removeCard(deckID, document.getElementById(selectedCard).id);
            }
        });              

        //puts initial cards onto board
        for(let i = 0; i < 4; i++){
            for(let j = 0; j < 13; j++){//shows all the actual cards
                if(i%2==0){//horizontal cards
                    let x = document.createElement("img");
                    x.setAttribute("id", i + "-" + j);
                    x.setAttribute("src", "https://opengameart.org/sites/default/files/card%20back%20blue.png");
                    x.setAttribute("alt", "CardBack");
                    x.setAttribute("width", "50px");
                    x.setAttribute("height", "70px");
                    x.style.position = "absolute";
                    x.style.top = "5px";
                    x.style.left = 50*j +"px";
                    x.addEventListener('click', (evt) => {
                        console.info(x.alt);
                            if(!(x.className === "selected")){
                                x.setAttribute("class", "selected");
                                selectedCard = x.alt;
                                console.info(selectedCard + " selected");
                            }else {
                                selectedCard = "";
                                x.setAttribute("class", "");
                                console.info(x.alt + " deselected");
                            }
                    });
                    let cardDiv = document.getElementById(i);
                    cardDiv.appendChild(x);
                }else{//vertical cards
                    let x = document.createElement("img");
                    x.setAttribute("id", i + "-" + j);
                    x.setAttribute("src", "https://opengameart.org/sites/default/files/card%20back%20blue.png");
                    x.setAttribute("alt", "CardBack");
                    x.setAttribute("width", "50px");
                    x.setAttribute("height", "70px");
                    x.style.position = "absolute";
                    x.style.top = 30*j +"px";
                    x.addEventListener('click', (evt) => {
                        console.info(x.alt);
                            if(!(x.className === "selected")){
                                x.setAttribute("class", "selected");
                                if(!(selectedCard === "")){
                                    document.getElementById(selectedCard).setAttribute("class","");
                                }
                                selectedCard = x.alt;
                                console.info(selectedCard + " selected");
                            }else {
                                selectedCard = "";
                                x.setAttribute("class", "");
                                console.info(x.alt + " deselected");
                            }
                    });
                    let cardDiv = document.getElementById(i);
                    cardDiv.appendChild(x);
                }
                
            }
            
        }
        //once all cards are drawn we can begin playing
        //start by fetching a deck of cards
        fetchDeck(numPpl);//sets up board
        //can start playing
        
    });

    
}
);

async function fetchDeck(numPpl){//sets up board
    //CREATE DECK
    let response = await fetch('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    let data = await response.json();
    deckID = data["deck_id"];
    //distribute cards
    for(let i = 0; i < 4; i++){
        //GIVE HAND TO A PLAYER
        response = await fetch('https://www.deckofcardsapi.com/api/deck/' + deckID + '/draw/?count=' + 13);
        let hand = await response.json();
        //console.info(hand);
        for(let j = 0; j < hand["cards"].length; j++){//add individual card to a player/pile, find the 7 of spades and play it, setting the starting player
            await fetch('https://www.deckofcardsapi.com/api/deck/'+ deckID + '/pile/'+ i + '/add/?cards=' + hand["cards"][j]["code"]);
            document.getElementById(i + "-" + j).setAttribute("id",hand["cards"][j]["code"]);
            cardsref[i][j] = hand["cards"][j]["code"];
            if(hand["cards"][j]["code"] == "7S"){
                startingPlayer = i;
                playerIndex = (i + 1)%4;
            }
        }
        if(i < numPpl){//sets human players to human
            isHuman[i] = true;
        }
    }
    /*
    for(let i = 0; i < 4; i++){
        console.info(document.getElementById(i).innerHTML);
    }
    */
    //turn 0: 
    console.info("staring palye: " + startingPlayer);//draw the first card
    response = await fetch("https://www.deckofcardsapi.com/api/deck/"+ deckID + "/pile/"+ startingPlayer + "/draw/?cards=7S");
    let sspade = await response.json();
    usedCards.push("7S");
    //place card down
    let imgSrc = sspade['cards'][0]['image'];
    document.getElementById('7S').remove();
    drawBoard("7S", imgSrc);//draws initial board with the 7 of spades on it
    
    //loop for turns
    playerTurn();
    
}

async function playerTurn(){
    console.info(empty);
    if(!empty[0]||!empty[1]||!empty[2]||!empty[3]){
        //let current = document.getElementById(i%4).innerHTML;
        if(empty[playerIndex]){playerIndex = (playerIndex + 1)%4; console.info("skip player " + playerIndex);}
        if(isHuman[playerIndex]){
            console.info("isHuman");
            manual();
        }else{//go through cards + pick first available one 
            auto();
        }
    }else{win();}
}


async function burnCard(deckID, burnt){
    let rep = await fetch("https://www.deckofcardsapi.com/api/deck/"+ deckID + "/pile/"+ playerIndex + "/draw/?cards=" + burnt);
    let carrd = await rep.json();
    console.info(carrd);
    let num = carrd["piles"][playerIndex]["remaining"];
    console.info("num: " + num);
    if(num + "" === "0"){
        empty[playerIndex] = true;
    }
    scores[playerIndex] += cardVal.indexOf(burnt.substring(0,1)) + 1;
    //burntCards.push(burnt);
    console.info(burnt + " was burned by player " + playerIndex);
    document.getElementById('results').innerHTML = "<option>A card was burned by player " + playerIndex + "</option>" + document.getElementById('results').innerHTML;
    document.getElementById(burnt).remove();
    playerIndex = (playerIndex+1)%4;
    selectedCard = "";
    playerTurn();
}

async function removeCard(deckID, card){
    let rep = await fetch("https://www.deckofcardsapi.com/api/deck/"+ deckID + "/pile/"+ playerIndex + "/draw/?cards=" + card);
    let cardd = await rep.json();
    console.info(cardd);
    let num = cardd["piles"][playerIndex]["remaining"];
    console.info("num: " + num);
    if(num + "" === "0"){
        empty[playerIndex] = true;
    }
    console.info(card + " was placed by player " + playerIndex);
    document.getElementById('results').innerHTML = '<option>' + card + " was placed by player " + playerIndex + "</option>" + document.getElementById('results').innerHTML;
    document.getElementById(card).remove();
    playerIndex = (playerIndex+1)%4;
    selectedCard = "";
    
    drawBoard(card, cardd['cards'][0]['image']);
    playerTurn();
}

function drawBoard(card, imgSrc){
    let x = document.createElement("img");
    //x.setAttribute("id", card);
    x.setAttribute("src", imgSrc);
    x.setAttribute("alt", card);
    x.setAttribute("width", "50px");
    x.setAttribute("height", "70px");
    x.style.position = "absolute";
    x.style.top = 70*(suite.indexOf(card.substring(1))) + 60 + "px";
    x.style.left = 50*(cardVal.indexOf(card.substring(0,1))) + 340 +"px";
    x.style.zIndex = cardVal.indexOf(card.substring(0,1));
    let cardDiv = document.getElementById("center");
    cardDiv.appendChild(x);
}

async function manual(){
    response = await fetch("https://www.deckofcardsapi.com/api/deck/"+ deckID + "/pile/"+ playerIndex + "/list/");
    let cards = await response.json();
    console.info(cards);
    for(let j = 0; j < cards['piles'][playerIndex]['cards'].length; j++){
        let x = document.getElementById(cards['piles'][playerIndex]['cards'][j]['code']);
            let imgSrc = cards['piles'][playerIndex]['cards'][j]['image'];
            x.setAttribute("src",imgSrc);
            x.setAttribute("alt",cards['piles'][playerIndex]['cards'][j]['code']);
    }
}

async function auto(){
    response = await fetch("https://www.deckofcardsapi.com/api/deck/"+ deckID + "/pile/"+ playerIndex + "/list/");
    let cards = await response.json();
    console.info(cards);
    let len = cards["piles"][playerIndex]["cards"].length;
    for(let j = 0; j < len; j++){//want to check if you can put down any cards
        //check compatibility and if yes then put it down
        let card = cards["piles"][playerIndex]["cards"][j]["code"];
        let ind = cardVal.indexOf(card.substring(0,1));//the number part of the card NOT suite
        //console.info(cardVal[(ind+13)%13] + cards["piles"][playerIndex]["cards"][j]["code"].substring(1) + " " + ind);
        //if card can be drawn vv
        if((usedCards.indexOf(cardVal[ind+1] + card.substring(1))>-1) || (usedCards.indexOf(cardVal[ind-1] + card.substring(1))>-1)){
            //console.info(cardVal[(ind)%13] + card.substring(1));
            usedCards.push(cardVal[(ind)%13] + card.substring(1));
            //then draw the FL*PPING CARDDD
            console.info(card);
            removeCard(deckID,card);
            break;
        }else if(j == cards["piles"][playerIndex]["cards"].length-1){//if reached end
            //loop through to find 7's
            len = (cards["piles"][playerIndex]["cards"].length);
            for(let k = 0; k < len; k++){
                card = cards["piles"][playerIndex]["cards"][k]["code"];
                if(card.substring(0,1) === "7"){
                    usedCards.push(card);
                    if(cards["piles"][playerIndex]["cards"].length == 1){
                        empty[playerIndex] = true;
                    }
                    removeCard(deckID,card);
                    break;
                }else if(k == cards["piles"][playerIndex]["cards"].length-1){//no 7's found
                    //burn lowest value card
                    let minCard = cards["piles"][playerIndex]["cards"][0]["code"];
                    let mindex = 0;
                    len = (cards["piles"][playerIndex]["cards"].length);
                    for(let m = 1; m < len; m++){
                        if(cardVal.indexOf(cards["piles"][playerIndex]["cards"][m]["code"].substring(0,1))<cardVal.indexOf(minCard.substring(0,1))){
                            minCard = cards["piles"][playerIndex]["cards"][m]["code"];
                            mindex = m;
                        }
                    }
                    console.info(minCard);
                    burnCard(deckID, minCard);
                }
            }
        }
    }
}

async function win(){
    console.info("all empty!!");
        let min = 1000;
        let mindex = createArray();
        for(let i = 0; i < 4; i++){
            if(scores[i] < min){
                min = scores[i];
            }
        }
        for(let i = 0; i < 4; i++){
            if(scores[i] == min){
                mindex.push(i);
            }
        }
        if(mindex.length == 1){
            console.info(scores + " player " + mindex[0] + " won with " + min + " points");
            document.getElementById('results').innerHTML = "<option>scores: " + scores + " Player " + mindex[0] + " won with " + min + " points</option>" + document.getElementById('results').innerHTML;
        }else{
            console.info(scores + " players " + mindex + " won with " + min + " points");
            document.getElementById('results').innerHTML = "<option>scores: " + scores + " Players " + mindex + " tied with " + min + " points</option>" + document.getElementById('results').innerHTML;
        }
}