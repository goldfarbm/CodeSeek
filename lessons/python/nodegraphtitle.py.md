# Build Houdini network editor titles

Define two functions that return text for the left and right sides of a Houdini network editor title. The left title combines playback, performance-profile, and APEX debugger information; the right title identifies the Houdini version, build, and child-node category. The file depends on Houdini and its nodegraphprefs module and does not call either function itself.

## Line 1: Import Houdini's Python API

Import `hou`, the module through which this file accesses Houdini objects, application information, the performance monitor, and APEX nodes. The import runs when the module is loaded; it does not call either title-building function.

### Good to know

This is Houdini-dependent code. The import requires an environment in which Houdini's Python libraries are available, and it is outside the functions' error handlers.

## Line 2: Give the preferences module a short name

Import `nodegraphprefs` and refer to it locally as `prefs`. Later calls use it to decide whether performance information should appear and to obtain the statistic's name. Its implementation is not included here, so the exact preference lookup and returned wording cannot be established from this file alone.

## Line 3: Separate imports from the first function

This blank line visually separates the module dependencies from the first function definition. It has no executable effect.

## Line 4: Define the left title function

Define `networkEditorTitleLeft`, accepting a parameter named `editor`. Its body assembles and returns a string when called with a suitable network editor object. Defining the function does not run the indented statements below it.

## Line 5: Protect the first stage of title construction

Begin a `try` block around the playback and performance-profile checks. If an exception occurs in this block, Python skips its remaining statements and enters the handler on line 20. Indentation identifies the statements belonging to this block.

## Line 6: Start with an empty title

Assign the empty string to the local variable `title`. Later statements append messages to it. This initializes a fresh title for each call rather than reusing text from an earlier call.

## Line 7: Obtain the editor's current network

Call `editor.pwd()` and store its result in `pwd`. In this context, the result is used as the node or network currently represented by the editor: later statements query its parameters and session identifier. This is a method on the supplied editor, not a call to Python's filesystem utilities.

### Good to know

If the call fails before assignment completes, `pwd` remains unassigned. The later debugger check will then also fail when it tries to use `pwd`, but its separate handler suppresses that failure.

## Line 8: Look up the playback parameter

Ask `pwd` for the parameter named `isplayer` and assign the result to `playerparm`. The next line checks whether a parameter was found before evaluating it. This line retrieves a parameter object; it does not change its value or start playback.

## Line 9: Test whether the playback flag is set

First check that `playerparm` is not `None`. Only if that succeeds does Python evaluate `playerparm.evalAsInt()` and compare its integer value with zero. A nonzero value selects the indented playback-message statement.

### Good to know

The `and` operator short-circuits: a missing parameter prevents the method call. This code treats the parameter as a playback-mode indicator; it does not query whether the main timeline is currently advancing.

## Line 10: Append the playback message

Append `Network in Playback Mode` followed by a newline to `title`. The `+=` assignment updates the local string value. This statement runs only when the condition on line 9 is true; it returns no value to the caller by itself.

## Line 11: Check the performance display preference

Call `prefs.showPerfStats(editor)` and use the truthiness of its result to decide whether to enter the performance section. The indentation places this `if` alongside the playback `if`, so the two checks are independent. The helper's name suggests a display preference, but its internal logic is unavailable here.

## Line 12: Obtain the active performance profile

Call `hou.perfMon.activeProfile()` and save the result in `profile`. Houdini can return a performance-monitor profile or `None` when there is no active profile. Retrieving a profile does not itself start a recording or compute a statistic.

### Good to know

An active profile is not necessarily currently recording. This code only asks for the active profile and later reads its title and identifier.

## Line 13: Continue only when a profile exists

Check that `profile` is not `None` before accessing its methods. If no profile is available, Python skips lines 14 through 17, preserving any playback text already accumulated.

## Line 14: Read the profile's title

Call `profile.title()` and assign the returned text to `profiletitle`. This retrieves the profile's human-readable title; it does not rename the profile or modify the existing `title` variable yet.

## Line 15: Detect a missing profile title

Test whether `profiletitle` is falsey. For a string, an empty value satisfies this condition. If the profile already has a nonempty title, Python skips the fallback assignment on the next line.

## Line 16: Build a fallback profile label

Construct a label by concatenating `Profile ` with the profile identifier converted to a string. For example, if `profile.id()` returns `7`, the label becomes `Profile 7`. The identifier's actual value depends on the profile at runtime.

## Line 17: Append the profile label and statistic name

Append the chosen `profiletitle`, a colon and space, and the result of `prefs.perfStatName(editor)` to `title`. This assumes the helper returns a value suitable for string concatenation. No numeric performance measurement is retrieved or formatted directly on this line; the helper's exact output is not available in this file.

### Good to know

If playback text was added, its trailing newline separates it from the profile text. A failure here enters the first exception handler, which clears the entire accumulated title rather than keeping the playback message.

## Line 18: Add visual space after the profile block

This blank line provides spacing after the nested profile-title construction. It does not run code or independently close an `if` or `try` block; Python uses the indentation of subsequent statements to establish block boundaries.

## Line 19: Separate the protected work from its handler

This second blank line adds spacing before the exception handler. It does not change which statements the preceding `try` protects.

## Line 20: Catch failures in the first stage

Begin a bare `except` handler for the `try` on line 5. If anything in the playback or performance section raises, execution moves here and continues with line 21. The code does not record which operation failed.

### Good to know

A bare `except` catches all Python exception types, including interruption and exit exceptions. This keeps the title function quiet but can conceal programming errors and failures unrelated to normal missing data.

## Line 21: Discard the partially assembled title

Reset `title` to the empty string after a failure in the first stage. This removes any playback or profile text already appended before the exception. It does not reset `pwd` if that variable was successfully assigned earlier.

## Line 22: Separate the two stages

This blank line separates the first exception handler from the debugger-related comment and `try` block. The debugger stage can still be attempted whether the first stage succeeded or failed.

## Line 23: Describe the intended APEX check

This comment introduces an attempt to detect whether a debugger is active for an APEX graph. Python ignores the comment. The implementation below tries an APEX lookup rather than first making an explicit type check.

## Line 24: Complete the comment about user feedback

This comment continues the previous line's explanation: the intent is to inform the user when debugging is active. It does not display anything itself; the message is added on lines 30 and 31 and returned later.

## Line 25: Isolate debugger-related failures

Start a second `try` block around the APEX debugger lookup and title update. Its separate exception handler means a failure here can leave an already constructed playback or profile title intact.

## Line 26: Read the current object's session identifier

Call `pwd.sessionId()` and save the result in `sid`. The following line uses that identifier to look for an APEX node in the current Houdini session. A session identifier is not a filesystem path or a name chosen for display.

## Line 27: Look up an APEX node by session ID

Pass `sid` to `hou.apexNodeBySessionId` and assign the result to `apex_node`. Houdini returns the corresponding APEX node when the identifier is valid for one, or `None` otherwise. This lookup does not create a new graph or convert another kind of node into an APEX node.

## Line 28: Obtain the APEX debugger

Call `apex_node.debugger()` and store the returned debugger object in `dbugger`. The variable's unusual spelling is consistent with the next line and is not itself a Python error. If the lookup on line 27 returned `None`, this method call fails and control passes to line 32.

## Line 29: Check whether debugging is enabled

Call `dbugger.isEnabled()` and enter the following block only when it reports that the debugger is enabled. This checks debugger state; it does not enable the debugger or prove that execution is paused at a breakpoint.

## Line 30: Prepare the debugger status text

Assign the string `Debugger Active` to `active_str`. This assignment happens only when the debugger check succeeds and returns a true value. The next line decides how to join this message to any existing title.

## Line 31: Append the message with a conditional separator

Use a conditional expression to choose the text to append. If `title` is nonempty, the f-string adds a newline before `active_str`; otherwise it appends `active_str` alone. The `+=` assignment then stores the combined string back in `title`.

### Good to know

The separator does not inspect the title's last character. If the existing title is only the playback message from line 10, it already ends in a newline, so this line adds another and creates a blank line before `Debugger Active`.

## Line 32: Catch failures in the debugger stage

Begin a bare handler for the `try` on line 25. It catches failed session lookups, unavailable debugger methods, and other exceptions raised in that stage. Unlike the first handler, it does not lead to an assignment that clears the title.

## Line 33: Leave the existing title unchanged

`pass` supplies a valid statement for the otherwise empty exception handler. It intentionally does nothing, suppressing the exception and preserving the title as it stood before the failed debugger operation. It does not retry the lookup or report the failure.

## Line 34: Separate error handling from the return

This line contains only whitespace. It visually separates the debugger handler from the final return and performs no operation. The next line's indentation places the return inside the function and outside both `try` blocks.

## Line 35: Return the completed left-side title

Return the local `title` string to the caller and end this function call. Depending on available state and failures, the string may contain playback text, profile information, a debugger message, a combination of them, or nothing. Returning it does not itself draw text in the editor; the calling code must use it.

## Line 36: Separate the two function definitions

This blank line separates the left-title function from the right-title function. The top-level indentation of the next `def`, rather than the blank line, marks it as a separate function.

## Line 37: Define the right title function

Define `networkEditorTitleRight`, which also accepts an `editor` argument. When called, it constructs a title identifying the Houdini version, build number, and the category of nodes that the current network can contain. This definition does not call the left-title function.

## Line 38: Read the Houdini version string

Call `hou.applicationVersionString()` and store the version text in `version`. It is later inserted into the right-side title. This statement executes before the function enters its `try` block, so the handler on line 46 does not catch an exception raised here.

## Line 39: Extract the build component

Call `hou.applicationVersion()` and select the tuple item at index `2`. Houdini's version tuple contains major, minor, and build components, so zero-based index `2` selects the build number and assigns it to `build`.

### Good to know

This statement is also outside the upcoming `try`. If obtaining the version or indexing the result fails, the exception propagates to the caller rather than producing an empty title through line 47.

## Line 40: Protect network-specific title construction

Start a `try` block around initializing the title, obtaining the current network, and formatting the right-side text. Its handler provides an empty-string fallback if these protected operations fail.

## Line 41: Initialize the right-side title

Assign the empty string to `title` for this function call. This is a local variable in `networkEditorTitleRight`; it is separate from the identically named variable in `networkEditorTitleLeft`.

## Line 42: Obtain this editor's current network

Call `editor.pwd()` and store the returned object in the local variable `pwd`. The next line queries that object's child-node type category to describe the network context.

## Line 43: Format the version and network category

Build an f-string containing `version`, `build`, and the label returned by `pwd.childTypeCategory().label()`, then append it to `title`. The intended form is `Houdini VERSION (Build BUILD) - CATEGORY`, with placeholders replaced by runtime values. The category describes the kinds of child nodes the network supports, not the current node's name or full path.

### Good to know

`str(build)` explicitly converts the build number, although an f-string would also format the integer directly. If the child category is unavailable or any method in that chain fails, the enclosing handler clears the title.

## Line 44: Show a disabled alternative

This comment contains a former or alternative statement that would append only the child category's label. Because it starts with `#`, it does not execute and does not add the label a second time. The active statement on line 43 already includes the category alongside the version information.

## Line 45: Separate formatting from its handler

This blank line adds visual spacing between the protected formatting statements and their exception handler. It has no effect on the title string or error handling.

## Line 46: Catch failures in the right-title block

Begin a bare `except` handler for the `try` on line 40. It catches exceptions from that protected block and suppresses their details. It does not catch errors from the version queries on lines 38 and 39, which run before the block starts.

## Line 47: Provide an empty right-side title on failure

Reset `title` to the empty string when a protected operation fails. This gives the subsequent return a fallback value, but removes any partially constructed text and provides no diagnostic message.

## Line 48: Separate the handler from the final result

This blank line makes the final return visually distinct from the error handler. The indentation of line 49 places the return outside the handler, so it is reached after either successful construction or the handled failure.

## Line 49: Return the right-side title

Return `title` to the caller and end the function. After successful protected operations, it contains the formatted version and category text; after a handled failure, it is empty. The function returns text rather than printing it or directly updating an editor widget.

## Line 50: Leave a blank line at the end of the file

This final blank source line provides trailing spacing and does not execute. There are no function calls at module level after the definitions, so the file itself does not request either title; other Houdini code must call these functions with an editor.
