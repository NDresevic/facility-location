// Creating canvas and getting values from input fields form HTML
function createCanvas() {
    n = Number(document.getElementById("numberOfPoints").value);
    r = Number(document.getElementById("radius").value);
    animationSpeed = Number(document.getElementById("animationSpeed").value);

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    disablePreviousNextFinish(true);
    disablePointsButton(false);
    setStartStopContinue("START");
}

// Calculate the output center and start animation
function start() {
    animationStarted = true;
    solutionLabel(true);
    createPointsAndCircles();
    firstDrawPointsAndCircles();
    circleIntersections();
    findCenter();
    startAnimation();
}

function stop() {
    clearInterval(animationInterval);
}

function continueButton() {
    startAnimation();
}

function previousStep() {
    if (animationIndex > 1) {
        animationIndex--;
        clearContext();
        for (let i = 0; i < animationIndex; i++) {
            let animationObject = animationList[i];
            for (let j = 0; j < animationObject["function"].length; j++) {
                window[animationObject["function"][j]].apply(undefined, animationObject["parameters"][j]);
            }
        }
    }
}

function nextStep() {
    let animationObject = animationList[animationIndex];
    for (let i = 0; i < animationObject["function"].length; i++) {
        window[animationObject["function"][i]].apply(undefined, animationObject["parameters"][i]);
    }
    animationIndex++;

    if (animationIndex >= maxAnimationSteps) {
        finish();
    }
}

// Gets called when requested to move to the end of animation
function finishButton() {
    clearInterval(animationInterval);
    clearContext();
    drawCircle(new Circle(resultCenter.x, resultCenter.y, r), YELLOW);
    drawPoint(resultCenter, RED);
    drawPoints();
    finish();
}

// Gets called when animation is finished
function finish() {
    animationStarted = false;
    clearInterval(animationInterval);
    solutionLabel(false);
    setStartStopContinue("START");  
    disablePreviousNextFinish(true);
    // clear input files
    document.getElementById("file").value = "";
}

function clearContext() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Function that resets everything for new input values
function reset() {
    clearContext();
    points = [];
    circles = [];
    animationIndex = 0;
    animationStarted = false;
    inputFile = false;
    animationList = [];
    intervals = [];
    solution = [];
    clearInterval(animationInterval);
    createCanvas();
    solutionLabel(true);
    // clear input files
    document.getElementById("file").value = "";
}

function addPointsButton() {
    var pointButton = document.getElementById("pointButton");
    if (pointButton.innerHTML == "Add points") {
        addingPointsMode = true;
        pointButton.innerHTML = "Finish adding";
    } else {
        addingPointsMode = false;
        pointButton.innerHTML = "Add points";
    }
    disableAnimation();
}

// Helper function to handle buttons ->  START / STOP / CONTINUE
function handleSSCButton() {
    var button = document.getElementById('startStopContinueButton');
    if (button.innerHTML == "START") {
        reset();
        start();
        disablePreviousNextFinish(true);
        disablePointsButton(true);
        setStartStopContinue("STOP");
    } else if (button.innerHTML == "STOP") {
        stop();
        if (animationStarted) {
            disablePreviousNextFinish(false);
            setStartStopContinue("CONTINUE");
        } else {
            disablePreviousNextFinish(true);
            setStartStopContinue("START");
        }
    } else {
        continueButton();
        disablePreviousNextFinish(true);
        setStartStopContinue("STOP");
    }
}

// Helper funciton to set button to -> START / STOP / CONTINUE
function setStartStopContinue(choice) {
    var button = document.getElementById('startStopContinueButton');
    if (choice == "START") {
        button.innerHTML = "START";
        button.style="background-color: green; color: white; height: 50px; width: 120px; text-align: center"; 
    } else if (choice == "STOP"){
        button.innerHTML = "STOP";
        button.style="background-color: red; color: white; height: 50px; width: 120px; text-align: center";
    } else {
        button.innerHTML = "CONTINUE";
        button.style="background-color: orange; color: white; height: 50px; width: 120px; text-align: center";
    }
}

// Helper funciton to set PREVIOUS, NEXT STEP and FINISH buttons to be disabled or not
function disablePreviousNextFinish(toDisable) {
    var previousButton = document.getElementById("previousButton");
    var nextButton = document.getElementById("nextButton");
    var finishButton = document.getElementById("finishButton");
    if (toDisable) {
        previousButton.disabled = true;
        nextButton.disabled = true;
        finishButton.disabled = true;
    } else {
        previousButton.disabled = false;
        nextButton.disabled = false;
        finishButton.disabled = false;
    }
}

// Helper funciton to set button for adding points to be disabled or not
function disablePointsButton(toDisable) {
    var pointButton = document.getElementById("pointButton");
    if (toDisable) {
        pointButton.disabled = true;
    } else {
        pointButton.disabled = false;
    }
}

// Helper function to disable start of animation if user is painting points
function disableAnimation() {
    var start = document.getElementById('startStopContinueButton');
    var resetButton = document.getElementById('resetButton');
    if (addingPointsMode) {
        start.disabled = true;
        resetButton.disabled = true;
    } else {
        start.disabled = false;
        resetButton.disabled = false;
    }
}

// Helper function that shows / hides solution label
function solutionLabel(hide) {
    let label = document.getElementById("solutionLabel");
    if (hide) {
        label.style.display = 'none';
    } else if (resultCenter){
        label.style.display = 'block';
        label.innerHTML = "Solution: " + resultCenter.toString();
    }
}

// Returns x and y coordinates of mouse clicked event
function currentMousePosition(event) {
    let border = canvas.getBoundingClientRect();
    return {"x" : (event.clientX - border.left), "y" : (event.clientY - border.top)};
}
document.getElementById("canvas").addEventListener("click", draw);