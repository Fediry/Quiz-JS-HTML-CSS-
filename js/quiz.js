const questionDIV = document.getElementById("question");    // reference to questionDIV
const answerDIV = document.getElementById("answer");        // reference to answerDIV
const gradeDIV = document.getElementById("grade");          // reference to gradeDIV
const welcomeDIV = document.getElementById("welcome");      // reference to welcomeDIV
let Questions = [];         //  hold this quiz sessions questions
let userAnswers = [];       //  hold user's answers
let numberCorrect = 0;      //  track correct answered questions
let currentQuestion = 0;    //  track current unanswered question

// Fetch the quiz data (currently from ./data/data.json)
async function fetchQuizData() {
    try {
        let response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error("Unable to fetch the data!");
        }
        let data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
        questionDIV.innerHTML = `<h5 style='color: red'>${error}</h5>`;
    }
}

// Prepare five random questions and answers from the quiz data
async function getQuestions() {
    const rawQuestions = await fetchQuizData();
    const randomNum = [];       // array to store random numbers for duplication checking

    while (randomNum.length < 5) {  //  loop until there are 5 unique random questions
        // get a random number between 0 and the length of the data array
        let rand = Math.floor(Math.random()*rawQuestions.length); 
        if (randomNum.includes(rand)) { // check for duplicate numbers
            continue            // skip duplicate
        }
        randomNum.push(rand);   // remember number

        // store each question and answer
        Questions.push(rawQuestions[rand]);
    }
}

// Prepare the questions
getQuestions();

// Get the user's name from the input field
function getName() {
    const nameText = document.getElementById("userName");
    let userName = "";

    // Check if name exists
    if (nameText.validity.valueMissing) {
        nameText.reportValidity();
        nameText.focus();
        return false;
    }
    else {
        userName = nameText.value
    }

    return userName;
}

// Load a question
function loadQuestion() {
    let nextQuestion = Questions[currentQuestion].question;
    questionDIV.innerHTML = `<p><strong>Question ${currentQuestion+1}: </strong>${nextQuestion}</p>`;
    const inputBox = document.getElementById("inputBox");
    inputBox.focus();
}

// Increment counter and load the next question
function loadNextQuestion() {
    if (currentQuestion < Questions.length -1) {
        currentQuestion++;                  // increment question counter
        const inputBox = document.getElementById("inputBox");
        inputBox.value = "";    // clear the input box
        inputBox.focus();       // focus the input box
        loadQuestion();                     // load the next question
    }
    else {  // all questions answered, grade quiz
        questionDIV.remove();               // remove the question div
        answerDIV.remove();                 // remove the answer div
        showGrade();
    }
}

// Grade the user's answers
function showGrade() {
    // Rebuild the welcomeDIV
    welcomeDIV.innerHTML = "";

    // Reveal the gradeDIV
    gradeDIV.classList.toggle("hidden");

    // Build the grade table
    const table = document.createElement("table");  // reference to grade table
    const thead = document.createElement("thead");  // reference to table header
    const tbody = document.createElement("tbody");  // reference to table body
    const tHeadData = ["", "Question", "", "Your Answer"];    //  data for the table header
    
    // Loop through the data to fill the header
    let trHead = document.createElement("tr");  // reference to the row element of the table head
    tHeadData.forEach((data) => {
        let th = document.createElement("th");  // reference to each head cell
        th.appendChild(document.createTextNode(data));
        trHead.appendChild(th)  // add each header cell to the row
    })
    thead.appendChild(trHead);  // add the header row to the table header

    // Loop through the arrays to fill the table
    for (a = 0; a < userAnswers.length; a++) {
        let trBody = document.createElement("tr");  // reference to the row elements of the table body
        // collect data for cells
        let uAnswer = userAnswers[a].answer;
        let correct = userAnswers[a].correct;
        let question = Questions[a].question;
        let qAnswer = Questions[a].answer;
        // Create references to the right and wrong image elements
        const greenCheck = document.createElement("img");
        greenCheck.src = "img/greenCheck.png";
        const redX = document.createElement("img");
        redX.src = "img/redX.png";

        let col1 = document.createElement("th");        // reference to column 1 cell in each row
        col1.appendChild(document.createTextNode(a+1));           // Question Number

        let col2 = document.createElement("td");        // reference to column 2 cell in each row
        const qP = document.createElement("p");
        const qS = document.createElement("strong");
        qP.appendChild(document.createTextNode(`${question} `));    // question text
        qS.appendChild(document.createTextNode(`(${qAnswer})`));    // answer text
        qP.appendChild(qS);   // add answer (strong) to end of question (para)
        col2.appendChild(qP);   // add question (para)

        let col3 = document.createElement("td");       // reference to column 3 cell in each row
        if (!correct) {
            col3.appendChild(redX);     // Wrong answer
        }
        else {
            col3.appendChild(greenCheck);      // Right answer
        }

        let col4 = document.createElement("td");        // reference to column 4 cell in each row
        col4.appendChild(document.createTextNode(uAnswer));     // User's answer
        
        trBody.appendChild(col1);   // add each column to the row
        trBody.appendChild(col2);
        trBody.appendChild(col3);
        trBody.appendChild(col4);
        tbody.appendChild(trBody);  // add the row to the table body
    }

    const gradeHeader = document.createElement("h2");   // reference to gradeHeader
    gradeHeader.appendChild(document.createTextNode("Quiz Complete"));
    const gradeMessage = document.createElement("h3");   // reference to gradeMessage
    gradeMessage.appendChild(document.createTextNode(`You got ${numberCorrect}/${Questions.length} questions correct`));

    table.appendChild(thead);       // add the table header to the table
    table.appendChild(tbody);       // add the table body to the table
    welcomeDIV.appendChild(gradeHeader);  // add the gradeHeader to the gradeDIV
    welcomeDIV.appendChild(gradeMessage); // add the gradeMessage to the gradeDIV
    gradeDIV.appendChild(table);    // add the table to the gradeDIV
}

// Setup initial elements for quiz display
function prepareQuiz() {
    userName = sessionStorage.getItem("name");
    // Rebuild the welcome div
    welcomeDIV.innerHTML = "";                              // clear the welcome div
    const userLine = document.createElement("h3");          // create the welcome header
    userLine.appendChild(document.createTextNode(`Student: ${userName}`));
    const instructions = document.createElement("p");       // create the instructions paragraph
    const inst1 = document.createTextNode("Answer each question and click ");
    const code = document.createElement("code");
    code.appendChild(document.createTextNode("[Submit]"));
    const inst2 = document.createTextNode(" :");
    instructions.appendChild(inst1);
    instructions.appendChild(code);
    instructions.appendChild(inst2);
    // Append the user's name and instructions
    welcomeDIV.appendChild(userLine);
    welcomeDIV.appendChild(instructions);

    // Build the answer div
    const answerLabel = document.createElement("h3");       // reference to answerLabel
    answerLabel.appendChild(document.createTextNode("Answer: "));

    const inputBox = document.createElement("input");       // referencte to inputBox
    inputBox.type = "text";
    inputBox.id = "inputBox";
    inputBox.onkeyup = `if (event.keyCode == 13) {
                        document.getElementById('submitButton').click()`;

    const submitButton = document.createElement("button");  // reference to submitButton
    submitButton.id = "submitButton";
    submitButton.setAttribute("onclick", "return checkAnswer()");
    submitButton.appendChild(document.createTextNode("SUBMIT"));

    const answerForm = document.createElement("form");      // reference to answerForm
    answerForm.id = "answerForm";
    answerForm.appendChild(answerLabel);    // add answerLabel to answerForm
    answerForm.appendChild(inputBox);       // add inputBox to answerForm
    answerForm.appendChild(submitButton);   // add submitButton to answerForm

    answerDIV.appendChild(answerForm);      // add answerForm to answerDIV
    answerDIV.classList.toggle("hidden");   // un-hide the answerDIV
    questionDIV.classList.toggle("hidden"); // un-hide the questionDIV
}

// [Bootstrap function] - Start the quiz after validating the user's name
function startQuiz() {
    // Get the users name
    let userName = getName();
    sessionStorage.setItem("name", userName);

    // Do not start the quiz until a user's name is given
    if (!userName) {
        return false;
    }

    prepareQuiz();  // prepare the quiz display layout

    // Wait a few seconds to make sure questions are fetched then load first question
    questionDIV.innerHTML = "<h5>Please Wait, Loading Questions...</h5>"
    setTimeout(() => {
        loadQuestion();
        if (Questions.length === 0) {
            questionDIV.innerHTML = "<h5 style='color: red'>Unable to fetch quiz data!</h5>";
        }
    }, 1500)

    return false;
}

// [Driver function] - Check the user's answers against the quiz data and continue the quiz
function checkAnswer() {
    const inputBox = document.getElementById("inputBox");  // reference to the answer field
    const enteredAnswer = inputBox.value;

    if (enteredAnswer.toLowerCase() === Questions[currentQuestion].answer.toLowerCase()) {  // answer is correct
        numberCorrect++;    // increment the number of correct answers
        let saveState = { "answer": enteredAnswer, "correct": true};    // save user's answer and if it was correct
        userAnswers.push(saveState);

        loadNextQuestion();     // give the next question
    }
    else {  // answer is incorrect
        let saveState = { "answer": enteredAnswer, "correct": false};    // save user's answer and if it was correct
        userAnswers.push(saveState);
        loadNextQuestion();     // give the next question
    }

    return false;
}