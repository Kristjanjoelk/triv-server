const hintService = require('../hintService.js');
const dummyData = require('../fixtures/data.js');
var game = function (io, memberService) {

    var data = [];
    var questionIndex = 0;
    var currentQuestionData = {
        data: null,
        timeLeft: 0,
        answered: false,
        hintlevel: 0
    };
    var intervalID = null;
    var hintTimes = [30, 15];
    var started = false;

    this.startGame = startGame;
    this.checkAnswer = checkAnswer;

    function prepareData() {
        let i = 0;
        for (i; i < dummyData.results.length; i++) {
            dummyData.results[i].hints = hintService.getHints(dummyData.results[i].correct_answer);
        }
        data = dummyData.results;
    }


    function startGame(callback) {
        // if(!memberService.getMemberCount()) {
        //     callback("No members online", null);
        // } else 
        if(started) {
            callback("Game already started", null);
        }
        else {
            callback(null, "Starting game");
            start();
        }
    }

    function start() {
        started = true;
        if(!data.length) {
            prepareData();
        }
        intervalID = setInterval(function() {
            gameLoop();
        }, 2 * 1000);
    }

    function gameLoop() {

        // 1. check if answered and if so get a new question and initialize it
        // 2. check if its time for a new question
        if(currentQuestionData.answered || !currentQuestionData.timeLeft || currentQuestionData.answered) {
            initializeQuestion();
        }

        // 3. check hint level
        let hinter = hintTimes.indexOf(currentQuestionData.timeLeft);
        if(hinter !== -1) {
            console.log('hinter : ', hinter);
            nextHint();
        }
        
        emitQuestionData();
        
        currentQuestionData.timeLeft -= 1;


    }
    
    function initializeQuestion() {
        currentQuestionData.data = data[questionIndex];
        currentQuestionData.timeLeft = 60;
        currentQuestionData.answered = false;
        currentQuestionData.hintlevel = 0;
        currentQuestionData.hint = currentQuestionData.data.hints[0];
        questionIndex += 1;
        console.log('game - initialized question nr: ', questionIndex - 1);
    }

    function nextHint() {
        currentQuestionData.hintlevel++;
        currentQuestionData.hint = currentQuestionData.data.hints[currentQuestionData.hintlevel];
        console.log('game - nextHint -', currentQuestionData.hintlevel);
    }

    function emitQuestionData() {
        console.log('game - emittingQuestionData');
        io.send('questiondata', currentQuestionData);
    }



    function stopGame(callback) {
        if(!intervalID) {
            callback("No game running", null);
        } else {
            clearInterval(intervalID);
            intervalID = null;
            callback(null, "Game stopped");
        }
    }

    function checkAnswer(string, userID) {
        console.log('comparing', string.toLowerCase(), ' with', currentQuestionData.data.correct_answer.toLowerCase());
        if(string.toLowerCase() === currentQuestionData.data.correct_answer.toLowerCase()) {
            console.log('bingo! a match...');
            currentQuestionData.answered = true;
            let userPointer = memberService.getMember(userID);
            if(!userPointer) {
                console.log('ERROR: User not found by name when adding point');
                return;
            }
            userPointer.addPoint(1, currentQuestionData.data.category);
        } else {
            console.log('and it wasnt a match...');
        }
    }

    

};


function g(io, memberService) {
    return new game(io, memberService);
}
module.exports = g;