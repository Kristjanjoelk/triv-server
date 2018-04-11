const hintService = require('../services/hintService.js');
const dummyData = require('../fixtures/data.js');
const http = require('https');
const cEnum = require('./category.constants.js');
var game = function (io, memberService, env) {

    var data = [];
    var questionIndex = 0;
    var currentQuestionData = {
        data: null,
        timeLeft: 0,
        answered: false,
        hintlevel: 0
    };
    var intervalID = null;
    var hintTimes = [5, 3]; // default : [30, 15]
    var started = false;
    var environment = env;

    this.startGame = startGame;
    this.checkAnswer = checkAnswer;
    this.getMoreQuestions = getMoreQuestions;

    function prepareData() {
        getMoreQuestions(function(err, res) {
            if(err) {
                // console.log(err);
            } else {
                //console.log('data recieved:', res);
                let i = 0;
                for (i; i < res.results.length; i++) {
                    res.results[i].hints = hintService.getHints(res.results[i].correct_answer);
                    res.results[i].cat = cEnum[res.results[i].category];
                }
                data = res.results;
                if(!started) {
                    started = true;
                    intervalID = setInterval(function() {
                        gameLoop();
                    }, 1 * 1000);
                }
            }
        });
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
        
        if(!data.length) {
            prepareData();
        } else {
            started = true;
            intervalID = setInterval(function() {
                gameLoop();
            }, 2 * 1000);
        }
    }

    function gameLoop() {

        // 1. check if answered and if so get a new question and initialize it
        // 2. check if its time for a new question
        if(questionIndex >= data.length) {
            questionIndex = 0;
            prepareData();
            initializeQuestion();
        }
        if(currentQuestionData.answered || !currentQuestionData.timeLeft || currentQuestionData.answered) {
            if(currentQuestionData.answered) {
                memberService.save();
            }
            initializeQuestion();
        }

        // 3. check hint level
        let hinter = hintTimes.indexOf(currentQuestionData.timeLeft);
        if(hinter !== -1) {
            // console.log('hinter : ', hinter);
            nextHint();
        }
        
        emitQuestionData();
        
        currentQuestionData.timeLeft -= 1;


    }
    
    function initializeQuestion() {
        if(!memberService.getMemberCount()) {
            stopGame(function(err, res) {
                if(err) {
                    console.log('Error stopping game:', err);
                } else {
                    console.log(res);
                }
            });
        }
        currentQuestionData.data = data[questionIndex];
        currentQuestionData.timeLeft = 10;
        currentQuestionData.answered = false;
        currentQuestionData.hintlevel = 0;
        currentQuestionData.hint = currentQuestionData.data.hints[0];
        questionIndex += 1;
        // console.log('game - initialized question nr: ', questionIndex - 1);
    }

    function nextHint() {
        currentQuestionData.hintlevel++;
        currentQuestionData.hint = currentQuestionData.data.hints[currentQuestionData.hintlevel];
        console.log('game - nextHint -', currentQuestionData.hintlevel);
    }

    function emitQuestionData() {
        // console.log('game - emittingQuestionData');
        io.send('questiondata', currentQuestionData);
    }



    function stopGame(callback) {
        if(!intervalID) {
            callback("No game running", null);
        } else {
            clearInterval(intervalID);
            intervalID = null;
            started = false;
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

    function getMoreQuestions(callback) {
        console.log('environment', environment);
        if(environment === 'test') {
            console.log('running test data');
            callback(null, dummyData);;
        } else {
            http.get('https://opentdb.com/api.php?amount=5&type=multiple', res => {
                res.setEncoding("utf8");
                let body = "";
                res.on("data", data => {
                    body += data;
                });
                res.on("end", () => {
                    body = JSON.parse(body);
                    callback(null, body);
                }),
                res.on("error", error => {
                    callback('Error getting data ' + error, null);
                });
            });
        }
    }
};


function g(io, memberService, env) {
    return new game(io, memberService, env);
}
module.exports = g;