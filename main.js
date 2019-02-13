/**
 * @author Nevena Dresevic
 * 2.4 Facility location
    Write a program that, given a set of points in the plane and a number r, computes where a disc with
    radius r should be placed in order to maximize the number of input points covered by the disc.
    Upper bounds: O(n^2 * log n) time and O(n) space, where n is the number of points.

    Solution: Create a disc with radius r around every point from the set and where the most circles intersect
    should the disc be placed.
 */

let canvas, context;
// n -> number of points; r -> radius of the circle
let n, r, animationSpeed;
// points -> given n points; circles -> circles around each of n points with radius r
let points = [], circles = [];

let animationIndex = 0;
let animationStarted = false;
let animationInterval, maxAnimationSteps;
let animationList = [];

let addingPointsMode = false;
let filePoints = [];

// intervals -> intersection intervals for each circle (range [0, 2*PI])
let intervals = [];
// solution -> dictionary which has for every circle the maximum number of intervals intersection and that point
let solution = [];
// resultCenter -> the center of the required circle of radius r
let resultCenter;

class Point {

    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    toString() {
        return '(' + this.x + ', ' + this.y + ')';
    }
}

class Circle {

    constructor(x, y, r) {
      this.x = x;
      this.y = y;
      this.r = r;
    }

    intersection(otherCircle) {
        let x1 = this.x, x2 = otherCircle.x;
        let y1 = this.y, y2 = otherCircle.y;
        let r = this.r;
        // distance between centers of circles
        let R = Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
        // circles touch each other or do not intersect
        if (R >= 2*r) {
            return false;
        }

        // find points A and B of intersection
        let sigma = Math.sqrt((2*r - R) * (2*r + R)) / R;
        let ax = 0.5 * (x1 + x2 + (y1 - y2) * sigma);
        let bx = 0.5 * (x1 + x2 - (y1 - y2) * sigma);
        let ay = 0.5 * (y1 + y2 - (x1 - x2) * sigma);
        let by = 0.5 * (y1 + y2 + (x1 - x2) * sigma);
        let A = new Point(ax, ay);
        let B = new Point(bx, by);
        return {"A" : A, "B" : B};
    }

    toString() {
        return "(" + this.x + ", " + this.y + ", " + this.r + ")"
    }
}

class Interval {

    constructor(begin, end) {
        this.begin = begin;
        this.end = end;
    }

    toString() {
        return "[" + this.begin + ", " + this.end + "]"
    }
} 

createCanvas();

// Creates points and circle for every point from the given set from - FILE / RANDOM / MOUSE CLICKED
function createPointsAndCircles() {
    // get points from file
    if (filePoints.length > 0) {
        for (let i = 0; i < filePoints.length; i++) {
            points.push(filePoints[i]);
            circles.push(new Circle(filePoints[i].x, filePoints[i].y, r));
        }

        filePoints = [];
    } else {
        // add points that were painted
        if (paintedPoints.length > 0) {
            for (let i = 0; i < paintedPoints.length; i++) {
                points.push(paintedPoints[i]);
                circles.push(new Circle(paintedPoints[i].x, paintedPoints[i].y, r));
            }
            paintedPoints = [];
        }
        
        // create n random points
        for (let i = 0; i < n; i++) {
            var x = Math.random() * (canvas.width - 60);
            var y = Math.random() * (canvas.height - 60);
            var p = new Point(x, y);
            var c = new Circle(x, y, r);
            points.push(p);
            circles.push(c);
        }
    }

    n = points.length
    document.getElementById("numberOfPoints").value = n;
}

function startAnimation() {
    maxAnimationSteps = animationList.length;

    animationInterval = setInterval(() => {
        let animationObject = animationList[animationIndex];

        for (let i = 0; i < animationObject["function"].length; i++) {
            window[animationObject["function"][i]].apply(undefined, animationObject["parameters"][i]);
        }

        animationIndex++;
        if (animationIndex >= maxAnimationSteps) {
            finish();
        }

    }, animationSpeed);
}

// One by one circle marks as the chosen one and finds intersections with others, makes intervals and finds the
// maximum number and the point where other circles intersect the chosen one
function circleIntersections() {

    // first chosen circle is red
    animationList.push({
        "function": ["drawCircle"],
        "parameters": [[circles[0], RED]]
    });

    // fix one circle that is red
    for (let i = 0; i < circles.length; i++) {

        // paint first for check in yellow
        let firstIndexYellow = 0;
        if (i == 0) {
            firstIndexYellow = 1;
        } 
        animationList.push({
            "function": ["drawCircle"],
            "parameters": [[circles[firstIndexYellow], YELLOW]]
        });

        // check all others if they intersect with chosen
        for (let j = 0; j < circles.length; j++) {
            if (i == j) {
                continue;
            }

            let circleColor = GREEN;
            let pointsOfIntersection = circles[i].intersection(circles[j]);
            if (pointsOfIntersection != false) {
                let A = pointsOfIntersection["A"];
                let B = pointsOfIntersection["B"];
                // add new interval for the chosen circle
                makeIntervalsFromPointsIntersection(A, B, circles[i]);
                // cirlce that intersects the chosen one is painted blue
                circleColor = BLUE;
            }

            // if it is not the end paint next one for check to yellow
            if (j+1 < circles.length && i != j+1) {
                animationList.push({
                    "function": ["drawCircle", "drawCircle", "drawCircle"],
                    "parameters": [[circles[j], circleColor], [circles[j+1], YELLOW], [circles[i], RED]]
                });
            } else {
                animationList.push({
                    "function": ["drawCircle"],
                    "parameters": [[circles[j], circleColor]]
                });
            }
        }

        // for the chosen circle find the number and spot where most circle intersect it
        sweepline(circles[i]);
        // reset intervals for next circle
        intervals = [];

        // paint back every to green and next one to red
        if (i + 1 < circles.length) {
            animationList.push({
                    "function": ["drawCircles", "drawCircle"],
                    "parameters": [[null], [circles[i+1], RED]]
            });
        }
    }
}

// Adds new interval(s) from intersection points to the circle -> O(n*(n + n*logn)) = O(n^2*logn)
function makeIntervalsFromPointsIntersection(A, B, circle) {
    // vector from center of the circle to x = 0 axis
    let vectorCenter = {"x1" : circle.x, "y1" : circle.y, "x2" : circle.x + 1, "y2" : circle.y}
    // vector from center of the circle to point A
    let vectorA = {"x1" : circle.x, "y1" : circle.y, "x2" : A.x, "y2" : A.y}
    let vectorB = {"x1" : circle.x, "y1" : circle.y, "x2" : B.x, "y2" : B.y}

    // calculate angles of vectors and convert from radians to degrees
    let angleA = (Math.atan2(vectorA.y2 - vectorA.y1, vectorA.x2 - vectorA.x1) - Math.atan2(vectorCenter.y2 - vectorCenter.y1, vectorCenter.x2 - vectorCenter.x1)) * 180 / Math.PI;
    let angleB = (Math.atan2(vectorB.y2 - vectorB.y1, vectorB.x2 - vectorB.x1) - Math.atan2(vectorCenter.y2 - vectorCenter.y1, vectorCenter.x2 - vectorCenter.x1)) * 180 / Math.PI; 

    // to convert form range [-PI, PI] to [0, 2*PI]
    angleA = (angleA < 0) ? Math.abs(angleA) : Math.abs(angleA - 360)
    angleB = (angleB < 0) ? Math.abs(angleB) : Math.abs(angleB - 360)

    // find smaller and bigger angle so interval can be created
    let maxAngle = (angleA > angleB) ? angleA : angleB
    let minAngle = (angleA < angleB) ? angleA : angleB
    
    // if difference between the angles is more than 180 degrees then wrong interval is choosen, so switch boundaries
    // -> smaller arc (angle) is always the one of circles intersection because the circles have the same radius
    if (maxAngle - minAngle > 180) {
        let t = minAngle;
        minAngle = maxAngle;
        maxAngle = t;
    }

    // if the interval contains the 0 angle, then split it in two intervals
    // one is [left boundary, 360] and other is [0, right boundary]
    // otherwise create one interval [left boundaty, right boundary]
    if (minAngle > maxAngle) {
        intervals.push(new Interval(minAngle, 360));
        intervals.push(new Interval(0, maxAngle));
    } else {
        intervals.push(new Interval(minAngle, maxAngle));
    }
}

// For the given circle finds point where the most intervals overlap -> O(n*logn)
function sweepline(circle) {

    // sort intervals ascending according to start and then end
    intervals.sort(function (x, y) {
        if (x.begin != y.begin) {
            return x.begin - y.begin;
        }
        return x.end - y.end;
    });

    let count = 0, max = 0, i = 0, j = 0;
    let angle;

    // loop through intervals with two pointers, if the beginning of right interval is 
    // before the end of left one increase the counter and move right one further,
    // otherwise decrease the counter and move left one further
    while (i < intervals.length && j < intervals.length) {
        if (intervals[i].begin <= intervals[j].end) {
            count++;
            if (count > max) {
                max = count;
                angle = intervals[i].begin;
            }
            i++;
        } else {
            count--;
            j++;
        }
    }

    // find coordinates of a point that is by the found angle relative to the center of the circle
    // convert angle from degrees to radians
    angle = angle * Math.PI / 180;
    let x = circle.x + circle.r * Math.cos(angle);
    // minus is because the coordinate beginning of canvas is upper left 
    let y = circle.y - circle.r * Math.sin(angle);
    let point = new Point(x, y);
    //console.log("tacka -> " + point.toString())

    // add the circle, number and point of the most overlaps to the dictionary
    solution.push({
        "circle" : circle,
        "pointsNumber" : max,
        "potentialCenter" : point
    });
}

// Find solution point -> the point on which the most circles intersect
function findCenter() {
    let max = solution[0]["pointsNumber"];
    resultCenter = solution[0]["potentialCenter"];
    for (let i = 1; i < solution.length; i++) {
        if (solution[i]["pointsNumber"] > max) {
            max = solution[i]["pointsNumber"];
            resultCenter = solution[i]["potentialCenter"];
        }
    }

    animationList.push({
        "function": ["clearContext", "drawCircle", "drawPoints", "drawPoint"],
        "parameters": [[null], [new Circle(resultCenter.x, resultCenter.y, r), YELLOW], [null], [resultCenter, RED]]
    });
}

// Upload given set of points from a file where first line contains two space seperate numbers
// n (points numer) and r (disk radius), and each of next n lines represent a point in a plane
// with given coordinates x and y as two space seperated numbers
function fileUpload(files) {
    if (files) {
        var fileReader = new FileReader();

        fileReader.onload = function(e) { 
            var contents = e.target.result;
            let lines = contents.split("\n");

            for (let i = 0; i < lines.length; i++) {
                let coordinates = lines[i].split(" ");
                if (i == 0) {
                    n = Number(coordinates[0]);
                    r = Number(coordinates[1]);
                } else {
                    let newPoint = new Point(Number(coordinates[0]), Number(coordinates[1]));
                    filePoints.push(newPoint);
                }
            }
        }
        fileReader.readAsText(files[0]);
    }
}