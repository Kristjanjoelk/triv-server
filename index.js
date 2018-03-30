const dummyData = require('./fixtures/data.js');
const hintService = require('./hintService.js');

console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'dev ') {
    console.log('BINGO BINGO BINGO');
}
const dataService = require('./data/dataService.js');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

var app = require('express')();

if(process.env.NODE_ENV === 'dev ') {
    app.use(function (req, res, next) {
        
                // Website you wish to allow to connect
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
        
                // Request methods you wish to allow
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        
                // Request headers you wish to allow
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        
                // Set to true if you need the website to include cookies in the requests sent
                // to the API (e.g. in case you use sessions)
                res.setHeader('Access-Control-Allow-Credentials', true);
        
                // Pass to next layer of middleware
                next();
            })
            .listen(PORT, "127.0.0.1");
} else {
    app.use(function (req, res, next) {
        next();
    }).listen(PORT);
}

app.use(bodyParser.json());
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(3000);

const memberService = require('./memberService.js')(io);


app.get('/', (req, res) => {
   
    res.status(200).send('yay');
})

app.post('/login', (req, res) => {
    console.log(memberService);
    dataService.login(req, memberService);
    res.status(200).send({'ok': 'ok'});
})

var currentQuestion = 0;
var questions;

// function prepareData(callback) {
//     let i = 0;
//     for (i; i < dummyData.results.length; i++) {
//         dummyData.results[i].hints = hintService.getHints(dummyData.results[i].correct_answer);
//     }
//     callback(null, dummyData);
// }

const game = require('./game/game.js')(io, memberService);


io.on('connection', (socket) => {
    setTimeout(function() {
        game.startGame(function(err, res) {
            if(err) {
                console.log('There was an error starting game: ', err);
            } else {
                console.log(res);
            }
        });
    }, 2000);
    console.log('Client connected. ID:', socket.id);
    socket.on('message', (msg) => {
        console.log('Client says', msg);
        game.checkAnswer(msg.message, socket.id);
        io.send('message', msg);
    });
    socket.on('login', (msg) => {
        console.log('Client login', msg);
        memberService.addToQueue(msg.name, socket.id);
        // dataService.login(req, memberService, socket.id);
    });
    // socket.on('getQuestions', (msg) => {
    //     console.log('Client says', msg);
    //     // prepareData(function (err, res) {
    //     //     if (!err) {
    //     //         questions = res.results;
    //     //         io.send('questions', res);
    //     //     }
    //     // });

    // });
    socket.on('disconnect', () => {
        memberService.removeWithId(socket.id);
        console.log('Client disconnected')
    });
});

// function testMembers() {
//     var memb = memberService.addMember({
//         name: 'Johnson1',
//         totalPoints: 1337,
//         'geography': 0,
//         'entertainment': 0,
//         'history': 0,
//         'artsLiterature': 0,
//         'scienceNature': 0,
//         'sportsLeisure': 0 
//     });

//     memb.addPoint(1, 'history');
//     memb.removeMember();


//     memberService.addMember({
//         name: 'Johnson1',
//         totalPoints: 1337,
//         'geography': 0,
//         'entertainment': 0,
//         'history': 0,
//         'artsLiterature': 0,
//         'scienceNature': 0,
//         'sportsLeisure': 0 
//     });

//     var getMemb = memberService.getMember('Johnson1');
//     console.log('member count before remove: ', memberService.getMemberCount());
//     getMemb.removeMember();

//     console.log('member count after remove: ', memberService.getMemberCount());
// }

// testMembers();