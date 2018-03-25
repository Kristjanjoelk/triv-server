
var memberService = function (io) {
    var members = [];
    var queue = [];
    this.addMember = addMember;
    this.getMember = getMember;
    this.getMemberCount = getMemberCount;
    this.addToQueue = addToQueue;
    this.removeWithId = removeWithId;
    this.update = update;

    function addMember(_member, id) {
        // console.log('member joined with name', _member.name);
        var newMember = new member(_member);
        members.push(newMember);
        queue = [];
        this.update();
        return newMember;
    }

    function getMember(name) {
        for(let i = 0; i < members.length; i++) {
            if(name === members[i].name) {
                return members[i];
            }
        }
    }

    function getMemberCount() {
        return members.length;
    }

    function addToQueue(_name, _id) {
        queue.push({
            name: _name,
            id: _id
        })
    }
    function removeWithId(id) {
        let len = members.length;
        let index = null;
        for(let i = 0; i < len; i++) {
            if(members[i].id === id) {
                index = i;
            }
        }
        if(index) {
            members.splice(index, 1);
        }
        this.update();
    }

    function update() {
        if(!members) {
            console.log('something went terribly wrong', members);

        }
        setTimeout(function() {
            io.send('membersupdate', members);
        }, 1000);
    }


    var member = function(options) {
        if(queue.length) {
            this.id = queue[0].id;
        }
        this.index = members.length;
        this.name = options.name;
        this.totalPoints = options.totalPoints ? options.totalPoints : 0;
        this.pointDistribution = options.pointDistribution ? options.pointDistribution
                                : { 'geography': 0,
                                    'entertainment': 0,
                                    'history': 0,
                                    'artsLiterature': 0,
                                    'scienceNature': 0,
                                    'sportsLeisure': 0 };

        this.addPoint = function(point, category) {
            this.pointDistribution[category]++;
            this.totalPoints += point;  
            // console.log('after adding point', members[this.index]);                           
        }

        this.removeMember = function() {
            // console.log('removeing member with index', this.index);
            // console.log('length before:', members.length);
            members.splice(this.index, 1);
            // console.log('length after:', members.length);
        }
    } 
}
function memberServ(io) {
    return new memberService(io);
}
module.exports = memberServ;