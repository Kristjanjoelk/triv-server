const cEnum = require('../game/category.constants.js');
const dataService = require('../data/dataService.js')
var memberService = function (io) {
    var members = [];
    var queue = [];
    this.addMember = addMember;
    this.getMember = getMember;
    this.getMemberCount = getMemberCount;
    // this.addSocketIdToUser = addSocketIdToUser;
    this.removeWithId = removeWithId;
    this.update = update;
    this.save = save;

    function addMember(_member, id) {
        // console.log('member joined with name', _member.name);
        var newMember = new member(_member);
        newMember.setId(id);
        members.push(newMember);
        queue = [];
        update();
        console.log('members length:', members.length);
        return newMember;
    }

    function getMember(userID) {
        for(let i = 0; i < members.length; i++) {
            if(userID === members[i].id) {
                return members[i];
            }
        }
    }

    function getMemberCount() {
        console.log('MemberService - returning membersCount: ', members.length);
        return members.length;
    }

    // function addSocketIdToUser(_name, _id) {
    //     for(let i = 0; i < members.length; i++) {
    //         if(_name === members[i].name) {
    //             members[i].id = _id;
    //         }
    //     }
    // }

    function removeWithId(id) {
        let len = members.length;
        console.log('before remove of member', members.length);
        for(let i = 0; i < len; i++) {
            if(members[i].id === id) {
                members[i].removeMember();
                return;
            }
        }
        console.log('failed removing member with id:', id);
        console.log('members online:', members.length);
        console.log('members[0]', members[0]);
        update();
    }

    function update() {
        if(!members) {
            console.log('something went terribly wrong', members);
            return;
        }
        io.send('membersupdate', members);
    }

    function save() {
        for(let i = 0; i < members.length; i++) {
            members[i].save();
        }
    }


    var member = function(options) {
        this.id = null;
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
            this.pointDistribution[cEnum[category]] += 1;
            this.totalPoints += point;
            update();  
            // console.log('after adding point', members[this.index]);                           
        }

        this.removeMember = function() {
            // console.log('removeing member with index', this.index);
            // console.log('length before:', members.length);
            members.splice(this.index, 1);
            update();
            // console.log('length after:', members.length);
        }
        this.save = function() {
            let self = this;
            let saveObject = {
                name: self.name,
                totalPoints: self.totalPoints,
                pointDistribution: self.pointDistribution
            }
            dataService.saveUser(saveObject);
        }

        this.setId = function(id) {
            this.id = id;
        }
    } 


    
}
function memberServ(io) {
    return new memberService(io);
}
module.exports = memberServ;
