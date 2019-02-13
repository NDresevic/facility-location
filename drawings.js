const BLACK = "#000000";
const GREEN = "#006400";
const RED = "#8B0000";
const BLUE = "#0000FF";
const YELLOW = "#FFFF00";
const WHITE = "#FFFFFF";
const PURPLE = "#C433FF";
let paintedPoints = [];

function drawPoint(point, color) {
    context.fillStyle = color;
    context.beginPath();
    context.fillRect(point.x, point.y, 2.5, 2.5);
    context.fill();
}

function drawPoints() {
    if (points.length == 0) {
        createPointsAndCircles();
    }
    for (let i = 0; i < points.length; i++) {
        drawPoint(points[i], BLACK);
    }
}

function drawCircle(circle, color) {
    context.strokeStyle = BLACK;
    context.beginPath();
    context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
    context.stroke();
    if (color != null) {
        context.fillStyle = color;
        context.fill();
    }
}

function drawCircles() {
    if (circles.length == 0) {
        createPointsAndCircles();
    }
    for (let i = 0; i < circles.length; i++) {
        drawCircle(circles[i], GREEN);
    }
}

function firstDrawPointsAndCircles() {

    // first draw of given points
    animationList.push({
        "function": ["drawPoints"],
        "parameters": [[null]]
    });

    // first draw of black circle around each point
    for (let i = 0; i < circles.length; i++) {
        animationList.push({
            "function": ["drawCircle"],
            "parameters": [[circles[i], null]]
        });
    }

    // fill circles in green
    animationList.push({
        "function": ["drawCircles"],
        "parameters": [[null]]
    });
}

// Draw point when mouse clicked and if in adding points mode
function draw(event) {
    if (addingPointsMode) {
        let position = currentMousePosition(event);
        context.fillStyle = BLACK;
        context.beginPath();
        paintedPoints.push(new Point(position.x, position.y));
        n++;
        context.fillRect(position.x, position.y, 2.5, 2.5);
        context.fill();
    }
}