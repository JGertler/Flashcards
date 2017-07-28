// require fs
var fs = require("fs");

var BasicCard = require('./BasicCard.js');

var inquirer = require('inquirer');


module.exports = ClozeCard;

// constructor for ClozeCard
function ClozeCard(text, cloze) {
    this.text = text;
    this.cloze = cloze;
    this.clozeDeleted = this.text.replace(this.cloze, '_____');
    this.create = function() {
        var data = {
            text: this.text,
            cloze: this.cloze,
            clozeDeleted: this.clozeDeleted,
            type: "cloze"
        };
        // add card to log.txt
        fs.appendFile("log.txt", JSON.stringify(data) + ';', "utf8", function(error) {
            // if there is an error, log the error
            if (error) {
                console.log(error);
            }
        });
    };

};

inquirer.prompt([{
    name: 'command',
    message: 'Add a new flashcard or show all cards (please)',
    type: 'list',
    choices: [{
        name: 'add-flashcard'
    }, {
        name: 'show-all-cards'
    }]
}]).then(function(answer) {
    if (answer.command === 'add-flashcard') {
        addCard();
    } else if (answer.command === 'show-all-cards') {
        showCards();
    }
});

var addCard = function() {
    // get user input
    inquirer.prompt([{
        name: 'cardType',
        message: 'What kind of flashcard would you like to create?',
        type: 'list',
        choices: [{
            name: 'basic-flashcard'
        }, {
            name: 'cloze-flashcard'
        }]
    // once user input is received
    }]).then(function(answer) {
        if (answer.cardType === 'basic-flashcard') {
            inquirer.prompt([{
                name: 'front',
                message: 'What is the question?',
                validate: function(input) {
                    if (input === '') {
                        console.log('You have to add a question!!!!!');
                        return false;
                    } else {
                        return true;
                    }
                }
            }, {
                name: 'back',
                message: 'What is the answer?',
                validate: function(input) {
                    if (input === '') {
                        console.log('You have to provide an answer!!!');
                        return false;
                    } else {
                        return true;
                    }
                }
            }]).then(function(answer) {
                var newBasic = new BasicCard(answer.front, answer.back.toLowerCase());
                newBasic.create();
                whatsNext();
            });
        } else if (answer.cardType === 'cloze-flashcard') {
            inquirer.prompt([{
                name: 'text',
                message: 'What is the full text of the statement?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide the full text of the statement');
                        return false;
                    } else {
                        return true;
                    }
                }
            }, {
                name: 'cloze',
                message: 'What is the cloze portion?',
                validate: function(input) {
                    if (input === '') {
                        console.log('Please provide the cloze portion');
                        return false;
                    } else {
                        return true;
                    }
                }
            }]).then(function(answer) {
                var text = answer.text;
                var cloze = answer.cloze;
                if (text.includes(cloze)) {
                    var newCloze = new ClozeCard(text, cloze);
                    newCloze.create();
                    whatsNext();
                } else {
                    console.log('The cloze portion you provided is not found in the full text. Please try again.');
                    addCard();
                }
            });
        }
    });
};

var whatsNext = function() {
    // get user input
    inquirer.prompt([{
        name: 'nextAction',
        message: 'Now What?',
        type: 'list',
        choices: [{
            name: 'create-new-card'
        }, {
            name: 'show-all-cards'
        }, {
            name: 'nothing, but thank u'
        }]
    // once user input is received
    }]).then(function(answer) {
        if (answer.nextAction === 'create-new-card') {
            addCard();
        } else if (answer.nextAction === 'show-all-cards') {
            showCards();
        } else if (answer.nextAction === 'nothing') {
            return;
        }
    });
};

var showCards = function() {
    // read the log.txt file
    fs.readFile('./log.txt', 'utf8', function(error, data) {
        //if there is an error, log it
        if (error) {
            console.log('Error occurred: ' + error);
        }
        var questions = data.split(';');
        var notBlank = function(value) {
            return value;
        };
        questions = questions.filter(notBlank);
        var count = 0;
        showQuestion(questions, count);
    });
};

var showQuestion = function(array, index) {
    question = array[index];
    var parsedQuestion = JSON.parse(question);
    var questionText;
    var correctResponse;
    if (parsedQuestion.type === 'basic') {
        questionText = parsedQuestion.front;
        correctResponse = parsedQuestion.back;
    } else if (parsedQuestion.type === 'cloze') {
        questionText = parsedQuestion.clozeDeleted;
        correctResponse = parsedQuestion.cloze;
    }
    inquirer.prompt([{
        name: 'response',
        message: questionText
    }]).then(function(answer) {
        if (answer.response.toLowerCase() === correctResponse) {
            console.log('Correct!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        } else {
            console.log('Wrong!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        }
    });
};

