# Choose a message from a score

Compare a score and choose between three helpful responses.

## Line 1: Explain the purpose

This comment describes the decision below: show feedback based on the score from a practice quiz. The comment is for the reader and does not run.

### Good to know

Describe why a decision exists when it helps the reader.

## Line 2: Store the quiz score

This assigns the integer 82 to score. The conditions below compare this value with two thresholds. You can reason through other outcomes by imagining a different score.

### Good to know

A single input can lead the program down different paths.

## Line 3: Separate the input from the decision

This empty line separates the value being checked from the conditional statements that use it. Python ignores the blank line.

### Good to know

Keep the input and the decision visually distinct.

## Line 4: Check the highest threshold first

The >= operator means greater than or equal to. Since 82 is less than 90, this condition is False and Python skips the indented statement immediately below it.

### Good to know

Check the highest threshold first so high scores get the intended message.

## Line 5: Celebrate a high score

This statement runs only when score is at least 90. The four leading spaces place it inside the if block. With the current score of 82, it is skipped.

### Good to know

A score of exactly 90 satisfies score >= 90.

## Line 6: Try the next condition

elif means else if. Python checks this condition only because the preceding if condition was False. Since 82 is at least 70, this branch is selected.

### Good to know

In this chain, this branch handles scores from 70 up to, but not including, 90.

## Line 7: Show the matching feedback

This is the selected branch for a score of 82, so the program prints You passed. Keep practicing!. After this branch, Python skips the remaining else block.

### Good to know

Only one branch in an if / elif / else chain runs.

## Line 8: Handle the remaining scores

else provides a fallback when both preceding conditions are False. Here that means score is less than 70. It has no condition of its own, but still needs a colon.

### Good to know

Use else for the remaining cases after your explicit conditions.

## Line 9: Encourage another attempt

This feedback prints for scores below 70. With score set to 82, the line is skipped. With score set to 60, it would be the only message printed by this program.

### Good to know

At exactly 70, the elif branch runs instead of this fallback.
