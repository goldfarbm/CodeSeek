# A friendlier hello

Get to know functions, parameters, and the value of a warm welcome.

## Line 1: A note for the reader

Comments explain the intent behind your code. JavaScript ignores everything after these two slashes on this line, so this note helps people understand the example without changing how it runs.

### Good to know

Use comments to explain why a piece of code exists.

## Line 2: Meet your first function

This declares a function named greet. A function groups instructions you can reuse. The parameter name is a placeholder: each time you call greet, the value you pass in becomes name inside the function. The opening brace starts its body.

### Good to know

A parameter gives a reusable function a different input each time.

## Line 3: Make it personal

const creates a variable called message. The backticks form a template literal, and ${name} inserts the current value of name into the text. When name is "Alex", the result is "Hello, Alex!".

### Good to know

Template literals let you put values directly inside a string.

## Line 4: Send a value back

return sends message back to the code that called greet, then ends this function call. Returning a value lets other code store it, display it, or use it in another operation.

### Good to know

Returning a value and printing a value are separate operations.

## Line 5: Wrap up the function

This closing brace marks the end of the function body. The declaration is now complete. Its instructions will run only when the function is called.

### Good to know

Braces group the instructions that belong to a function.

## Line 6: A little breathing room

This blank line visually separates the function definition from the code that uses it. It makes the example easier to scan and does not change what the program does.

### Good to know

Whitespace can make code easier to understand.

## Line 7: From definition to action

This comment introduces the next step: calling the function. Defining a function makes it available; calling it actually runs the instructions inside it.

### Good to know

Define the behavior once, then call it whenever you need it.

## Line 8: Say hello to Alex

This calls greet with the argument "Alex". Inside the function, name becomes "Alex" and message becomes "Hello, Alex!". The returned string is then stored in a new variable called greeting.

### Good to know

An argument is the actual value supplied to a function call.

## Line 9: See the result

console.log prints greeting to the developer console. This example displays "Hello, Alex!". The value already exists; logging simply makes it visible while you develop and debug.

### Good to know

Expected output: Hello, Alex!
