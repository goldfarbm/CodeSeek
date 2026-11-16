# Add up a shopping list

Visit each price in a list and build a running total.

## Line 1: Describe the values

This comment tells the reader that each number represents a price in whole dollars. Stating the unit helps explain what the numbers mean.

### Good to know

Clear units make numerical code easier to understand.

## Line 2: Create an ordered list

Square brackets create a list containing three integers. Commas separate the items, and the equals sign assigns the list to prices. Lists keep their items in order and can be changed after creation.

### Good to know

List indexes start at zero: prices[0] is 4.

## Line 3: Start with an empty total

This creates total and assigns it the integer 0. The loop will add each price to this running total. Starting at zero means the result includes exactly the prices in the list.

### Good to know

Initialize an accumulator before the loop that updates it.

## Line 4: Make the stages clear

The blank line separates the initial data and starting total from the repeated work below. Python ignores this empty line.

### Good to know

Use spacing to make the steps of an example easy to scan.

## Line 5: Visit every price

The for loop takes each value from prices in order and assigns it to price. The indented body runs once with 4, once with 7, and once with 3. The colon starts the loop body.

### Good to know

Python for loops visit values directly, without requiring an index.

## Line 6: Keep a running total

The += operator adds price to the current total and assigns the result back to total. The successive totals are 4, 11, and 14. The indentation makes this statement repeat for every price.

### Good to know

For these integers, total += price has the same effect as total = total + price.

## Line 7: Prepare to show the result

This blank line separates the repeated addition from the final output. The following print statement is unindented, so it runs after the loop has finished.

### Good to know

Dedenting a statement places it outside the loop body.

## Line 8: Print the final total

This f-string inserts total into the message. The dollar sign is ordinary text; the braces mark the value to insert. Since print is outside the loop, the program displays Total: $14 just once.

### Good to know

An empty prices list would leave total at 0.
