# Facility Location
Animation and program written in JavaScript that solves Facility Location problem.

### Problem
Given a set of points in the plane and a number `R`, compute where a disc with radius `R` should be placed in order to maximize the number of input points covered by the disc.

Upper bounds: `O(N^2 * log N)` time and `O(N)` space, where `N` is the number of points.

![Alt text](/problem.PNG)

### Solution

Create a disc with radius `R` around every point from the set and the solution is to place the disk on the spot where the most circles intersect.

#### Algorithm

1. Place a disc with radius `R` around every point from the set.
2. Chose one disc and find if the intersection with all other discs exists. 
If so, create intervals out of intersection points of discs. Find the maximum number of overlaping intervals, sort the intervals
and trace the number of overlaps at any time keeping track of the number of intervals that have started, but not yet ended.
Then for the chosen disc store that number and any point that belongs to the intersection of those intervals which form the maximum number of overlaps.
3. Repeat step 2 for each disc.
4. Find the maximum number of overlaping intervals stored for each disc and the solution is the stored point, this is done in
linear time.

`main.js` contains the implementation of the algorithm.


#### Animation usage

- To run the animation, just open `gui.html` in browser, set the number of input points, disc radius and animation speed. You can also give input set of points or get random set of points.

- Input set of points can be read from file, where the first line contains two space seperated numbers `N` and `R`, where `N` is the number of points and `R` is disc radius. 
The following N lines also contain two space seperated numbers, which represent the `X` and `Y` coordinate of the point. 
The example is `in.txt`.

- Input points can also be added by mouse click on desired position in the animation area. 
> Points must be added before the animation starts
(click on the button 'Add points', add desired points, click 'Finish adding' and animation can start).
