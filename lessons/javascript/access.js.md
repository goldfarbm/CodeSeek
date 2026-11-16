# Give your code a choice

Use a condition to decide which message your program shows.

## Line 1: Explain the decision

This comment describes the purpose of the example: choose a message based on whether a learner has completed the prerequisite lesson.

### Good to know

A short comment can capture the purpose of a decision.

## Line 2: Remember the learner’s progress

This declares completedBasics with the boolean value true. Booleans have two possible values, true and false, which makes them useful for representing a yes-or-no state.

### Good to know

true and false are boolean values, not strings.

## Line 3: Separate state from behavior

The blank line separates the learner’s stored progress from the instructions that use it. JavaScript ignores the empty line.

### Good to know

Keep related ideas together and separate distinct steps.

## Line 4: Ask a yes-or-no question

if evaluates the expression inside its parentheses. Because completedBasics is true, JavaScript runs the first block. If it were false, JavaScript would skip that block and run the else block instead.

### Good to know

A condition controls which branch of code runs.

## Line 5: Take the unlocked path

This message is printed only when completedBasics is true. With the current value, the program prints "Your next lesson is ready!".

### Good to know

Only the matching branch runs.

## Line 6: Provide another path

This closes the first block and introduces the fallback branch. The else block runs when the if condition is false; it does not need a separate condition.

### Good to know

else handles the alternative when the condition does not pass.

## Line 7: Offer a helpful next step

This message would print if completedBasics were false. Since it is currently true, JavaScript skips this line. Changing the value on line 2 would change which message appears.

### Good to know

Try reasoning through the example with completedBasics set to false.

## Line 8: Bring the paths back together

The final brace closes the else block and completes the conditional. Any following statements would run after whichever branch was selected.

### Good to know

Conditionals let one program respond to different situations.
