# Your first Python greeting

Create a reusable function and make a message with an f-string.

## Line 1: Leave a note for the reader

In Python, a hash sign starts a comment. Python ignores the rest of this line when it runs the program. This note describes the purpose of the function below.

### Good to know

Use comments to explain the intent behind your code.

## Line 2: Define a reusable function

def creates a function named greet. The parameter name holds the value supplied by the caller. The colon introduces the function body, which must be indented on the following lines.

### Good to know

Python uses indentation to group statements into a block.

## Line 3: Build a personal message

The f before the opening quote makes this an f-string. Python evaluates name inside the braces and inserts its value into the text. The equals sign assigns the resulting string to message.

### Good to know

With name set to "Alex", this produces "Hello, Alex!".

## Line 4: Send the result back

return gives message back to the caller and ends this function call. The four spaces at the start place this statement inside greet. Returning the string allows the caller to use it later.

### Good to know

A return value can be saved in a variable or passed to another function.

## Line 5: Separate definition from use

This empty line separates the function from the code that calls it. It does not end the function by itself: the next statement is outside the function because it is no longer indented.

### Good to know

Indentation determines block structure; blank lines improve readability.

## Line 6: Call the function

This runs greet with "Alex" as its argument. Inside the function, name becomes "Alex" and the function returns "Hello, Alex!". That returned string is assigned to greeting.

### Good to know

A parameter is the placeholder; an argument is the value you pass in.

## Line 7: Display the greeting

The built-in print function writes the value of greeting to standard output, usually your terminal, followed by a newline. This program displays Hello, Alex!.

### Good to know

Returning a value and printing a value are separate operations.
