# A little list, a lot of possibilities

Store a collection and visit each item with a simple loop.

## Line 1: Introduce the collection

This comment describes the list below. Comments provide context for people reading the code and are skipped by JavaScript.

### Good to know

A good comment makes your intent easier to follow.

## Line 2: Keep things together

An array stores multiple values in order. This array contains three strings, separated by commas. const keeps topics pointing to this array, although the contents of the array can still be changed.

### Good to know

Array positions start at zero: topics[0] is "HTML".

## Line 3: Separate the steps

This blank line separates creating the array from processing its items. It helps readers see the two stages of the example.

### Good to know

Organize code around small, clear steps.

## Line 4: One item at a time

A for…of loop visits the values in topics in order. On each iteration, topic holds the current string: first "HTML", then "CSS", then "JavaScript". The braces enclose the instructions to repeat.

### Good to know

for…of gives you each value in a collection.

## Line 5: Build the next message

For each topic, this template literal creates a new message. On the first iteration it becomes "Let’s learn HTML!". The variable is scoped to the loop body and is created again for each iteration.

### Good to know

The same instruction can produce a different result for each input.

## Line 6: Show each result

This prints the current message. Because it is inside the loop, it runs three times: once for HTML, once for CSS, and once for JavaScript.

### Good to know

Instructions inside the loop run once for every item.

## Line 7: Move to the next item

At this closing brace, the loop returns to its next value. After all three items have been visited, execution continues with the code after the loop.

### Good to know

A for…of loop ends when there are no values left to visit.

## Line 8: Leave some space

This blank line separates the repeated work above from the final statement below. Blank lines do not affect the output.

### Good to know

Spacing helps readers spot where one idea ends and another begins.

## Line 9: Finish with a single message

This statement sits outside the loop, so it runs once after all three topic messages. It prints "Ready to build something!" to the console.

### Good to know

Placement determines whether an instruction repeats or runs once.
