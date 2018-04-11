var hintService = function() {
    this.test = test;
    var currentString = '';
    var charArray = [];
    this.getHints = getHints;


    function test() {
        // console.log('hello world');
        return 'success';
    }


    function getHints(string) {
        charArray = [];
        currentString = string;
        // console.log('current string', currentString);
        var hints = [];
        // TODO: support more than 1 word god damnit..

        // first hint:  **************
        hints.push(Array(currentString.length + 1).join('*'));

        // console.log('1', hints);

        // second hint: *****a**a**b**
        hints.push(getRandomizedHint(hints[0], 3));

        // console.log('2', hints);

        // third hint:  *aa**a**a**b**
        hints.push(getRandomizedHint(hints[1], 1.5));

        // console.log('3', hints);

        return hints;

    }

    function getRandomizedHint(str, div) {
        // console.log('getting RandomizedHint', str, div);
        let charNum = Math.floor(str.length / div);
        if(charNum === 0 && div === 3) {
            charNum = 1;
        } else if(charNum === 0 && div === 2) {
            charNum = 2;
        }
        return generateString(str, charNum);
    }

    function generateString(str, charNum) {
        // console.log('replaceing ', charNum, ' many asteriks');
        let length = str.length;
        let charNumTotal = charArray.length + charNum;
        let result = str;
        while(charArray.length < charNum){
            var randomNumber = Math.floor(Math.random()*length);
            if(charArray.indexOf(randomNumber) > -1) continue;
            charArray[charArray.length] = randomNumber;
            result = replaceCharacter(result, randomNumber, currentString[randomNumber]);
        }
        // console.log('returning string', result);
        return result;
    }

    function replaceCharacter(string, index, char) {
        let offset = index < string.length ? 1 : 0;
        return string.substr(0, index) + char + string.substr(index + offset);
    }
}

module.exports = new hintService;