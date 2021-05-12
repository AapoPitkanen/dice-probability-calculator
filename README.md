# Dice probability calculator

A tiny React application for calculating dice probabilities. Bootstrapped with create-react-app.

Allows probability calculation with dice sums (e.g. roll at least 7 with two standard d6 dice) and
face values (e.g. roll at least three 5's with five standard d6 dice). Supports sizes of any kind,
so you can calculate probabilities with irregular dice, such as d7 or d15.

Clone the repository, install dependencies and start the dev server with:

`npm run start`

And you're good to go.

The idea to build this actually came from playing the board game Xia: Legends of a Drift System and
a variant for it, which allowed you to add a d6 roll in addition to a d20 roll to determine if you
succeed in an action or not. You needed to roll at least 11 with the d20 to succeed, so I wanted
a quick and easy way to calculate how much the chance to succeed would increase by adding more dice of
different sizes to the roll (spoiler alert: probability of rolling at least 11 with d20+d6 is 67.50%).

Calculation of sums is done by utilizing generating functions, as you can represent the dice as polynomials.
For example, the standard d6 dice can be represented as:

x^1 + x^2 + x^3 + x^4 + x^5 + x^6

Where the coefficient represents the probability and the exponent the face value. Multiplying
the polynomials together gives you the probability distribution. You can read more here:
https://brilliant.org/discussions/thread/generating-functions-2/

The probabilities of face value calculations are done by generating the unique combinations
how you can roll a specific result and then calculating the binomial distribution of them.
Calculating the actual unique combinations proved to be a bit tricky, and I'm kinda sad I didn't
come up with the solution myself. The more general idea is to think of the dice combinations
as a multiset which allows duplicates. There's a more efficient algorithm implementation for
this specific problem at http://www.martinbroadhurst.com/combinations-of-a-multiset.html which
is not utilised in this application. Discussion of the algorithm that's used here can be found at
https://math.stackexchange.com/questions/1902850/efficient-algorithm-to-find-all-unique-combinations-of-set-given-duplicates.

The application uses web workers to do the actual calculations, as they can get quite heavy with
large number of dice. Using web workers prevents blocking the thread on the UI so it doesn't look
like the app just freezes when calculating probabilities with thousands of dice.
