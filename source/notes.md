
##### [Back to top](#)
-----

### Compiler Design

Our current parser is simplistic. It was great for what we were doing, but we need more flexibility in our image description files. Things that would be nice to have:
* A way to define ambient light.
* A way to define point light sources.
* A way to create a set of reflection constants such that we can reuse them when we add objects without having to type out 9 values each time.
* A way to define a coordinate system totally independent of the current stack and use that when placing some objects (to give more control over our images).
* A looping structure to help with animation.

The last 3 things on the list above are really the sorts of things you would see in a programming language. The last one being a loop and the other 2 being essentially variables. So we are going to move from a simple parser to a more robust compiler-style design. In order to do so, we have to know more about how compilers work.

__The Compiler Pathway__

Until now, you've probably thought about a compiler in the following way:
1. Source code
2. ? <a href="{{"/assets/img/underpants_gnomes.png" | relative_url }}" style="color: lightsteelblue"> this sounds familiar...</a>
3. Executable code

Turns out, a lot happens in step 2. Compilers are made of the following parts:
* Lexer
* Parser
* Semantic Analyzer
* Optimizer
* Code Generator

As your code goes through these parts, it gets transformed into various structures that are less human-friendly but more computer-friendly, until we end up with a binary executable program.

__Lexer__
* A lexer performs _lexical analysis_, which means that its job is to identify the tokens in a programming file. (A _lexicon_ is the total collection of words in a language).
* The lexer will take in a computer program and output a list of program tokens. Takes this example c code:
  ```
  int main() {
      int x;
      x = 5 * 18;
      printf("%d", x);
      return 0;
  }
  ```
* After going through a lexer, the code would look something like this:
  ```
  INT
  IDENTIFIER main
  (
  )
  {
  int
  IDENTIFIER x
  ;
  x
  ASSIGNMENT
  VALUE 5
  MULTIPLY
  VALUE 18
  ...
  ```
* As you can see, a lot of the things programmers use to make their code readable, like whitespace and comments, immediately get stripped out.
* The only errors that a lexer will catch will be invalid tokens (like bad variable names, invalid symbols...). The lexer doesn't know anything about the structure of the programming language.
* Natural language example: _greedily cat computer overstates_ contains valid English tokens, and would thus pass the lexer stage.
* In order for a lexer to work, it must be programmed with all possible tokens in the programming language. For things like keywords and symbols, you can list them out. But for more interesting structures, like strings, identifiers and number values, you have to use [regular expressions](https://regexcrossword.com/challenges/tutorial/puzzles/1){:target="_blank"}

__Parser__
* The parser performs _syntactic analysis_.
* This means that the parser checks the _token list_ against the grammatical rules of the language.
* The parser will output a _syntax tree_ and a corresponding _token list_.
* The syntax tree for the code above might look something like this:
  * ![syntax tree]({{"/assets/img/n09-syntax_tree.png" | relative_url }})
* Notice that the grouping symbols (i.e. `() {} ;`) have been stripped away and are now built into the syntax tree.
* The _symbol table_ is going to be a list of symbols, mostly the identifiers, found in the syntax tree.
  * Syntax tree nodes will link to the symbol table when appropriate.
* The parser will only be able to find structural errors.
  * Natural language example: _cat the hungry ate mouse_ would not pass the parser stage, while _the tree computed blue integrals_ would, despite not making any sense.
* In order for a parser to work, it must be programmed with the syntax of the language. This is commonly done using a __context free grammar__.

__Semantic Analyzer__
* The semantic analyzer takes the syntax tree and create a list of operations in the order that they need to be performed in order for the program to work.
* The semantic analyzer might make an operations list like the following:
  ```
  MULTIPLY 5, 8
  ASSIGN x PREVIOUS
  printf "%d", x
  ```
  * The `ASSIGN` line would have some reference to the previous line.
  * Things like `x` and `printf` would refer to the symbol table.
* The operations list can be designed such that it can then be directly translated into processor operations, ready to be translated into binary code.

__Optimizer__
* Once we have a list operations to be performed, the optimizer can look it over and potential provide size & time improvements.
* Some possible examples are removing unused variables from the symbol table, removing conditional statements that are always true/false...
* Depending on the compiler and optimization level, the post-optimized operation list could result in code that is different enough from the source that debugging could be difficult.
* [Here](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html) is a list of possible optimizations for `gcc`.

__Code Generator__
* This is the part of the compiler that generates the executable code.
* At this point, the operations list can be traversed and translated into executable binary code.
* Some compilers will provide an option to create an _assembly code_ file instead of an executable binary. You can do this in `gcc` with the `-S` flag.

##### [Back to top](#)
-----

### Using Flex and Bison to Create MDL

Building a compiler from scratch is difficult, and many of the processes are the same for any language, the only differences being in the list of possible tokens and the grammar. There are a number of tools out there to help with compiler design, provided that you can define the tokens (using _regular expressions_) and the structure (using a _context free grammar_). In C, there are well known tools:
* lex: Generates a lexer based on a token list (usually defined in a `.l` file).
* yacc (Yet Another C Compiler): Generate a parser & semantic analyzer based on a context free grammar (usually defined in a `.y.` file).
* Both of these utilities are not open-source, and are part of a standard Unix system. So we will be using the follow open source (and newer) replacements:
  * lex -> _flex_ (faster lex)
  * yacc -> _bison_ (kind of like a [yak](https://en.wikipedia.org/wiki/Domestic_yak){:target="_blank"})

For python, we will be using a fairly direct port of lex & yacc (provided in the source code. direct link [here](https://www.dabeaz.com/ply/){:target="_blank"})

For you java fans, you will have to investigate javacc ([java compiler compiler](https://javacc.github.io/javacc/){:target="_blank"})

__MDL__
* MDL is the language we will create for our graphics programs (stands for Motion Description Language).
* All of our image script files will now use MDL syntax.
* For us, our MDL source code will go through our custom compiler and output an image (instead of an executable binary).
  * Later on, when we get to animation, we will output many files.
* The lexicon & grammar for MDL for all the base MDL commands is provided for you (you may wish to add commands for a final project).
* Your job will be to parse the operation list output by the semantic analyzer (created using bison), to perform the graphics operations and output an image file.
* This is analogous to the _code generator_ of a compiler.

##### [Back to top](#)
-----

### Animation
An animated imaage is simply a whole lot of similar images strung together. We will procedurally generate animated images by taking a transformation and applying it over a series of individual frames.
* For example, if we want a ball to roll across the screen, we could frame that as a `move` command that is applied increasingly. We can think about this as if we're adding an extra argument to move, representing the amount of the transformation to apply.
  * `move 400 0 0 0`
  * `move 400 0 0 0.25`
  * `move 400 0 0 0.5`
  * `move 400 0 0 0.75`
  * `move 400 0 0 1`
* Here we have the move command applied first at 0%, then in 25% increments until we get to 100%. The entire animation would take place over 5 frames.

In MDL, we will create this effect using a new type of variable called a _knob_.
* A _knob_ is an optional parameter to any transformation command.
* If a knob name is present at the end of the transformation, it means that transformation is designed to be applied incrementally over some number of frames.
* We define the behavior of the knob in a new MDL command: `vary`
  - `vary knob start_frame end_frame start_value end_value`
    * This command defines the knob behavior. To get the move command to work the way it's described above, we would use the following code:
      * `move 400 0 0 knobby`
      * `vary knobby 0 5 0 1`
    * Some important things to keep in mind about `vary`
    * You could have multiple vary commands for the same knob, as long as they don't overlap in frames.
    * `start_frame` should always be less than `end_frame`.
    * `end_frame` should always be less than or equal to the total number of frames.
    * The value can increase or decrease over time.
    * The value range can be bounded by any floating point values.
    * The frame and value ranges are inclusive.

__Implementing Animation in MDL__
* In addition to knobs and the `vary` command, we'll have 2 other new commands:
  * `frames x`: Set the total number of frames for the animation.
  * `basename s`: Set the base file name for each frame file.
* In order to produce an animation, we will go through the operations list three times:
* Pass 0:
  * Look for the animation related commands: `frames` `basename` `vary`.
  * Set `frames` and `basename` somewhere in your code, if they are present.
  * If `vary` is present, but `frames` is not, this should be considered an MDL compiler error, handle it accordingly.
  * If `frames` is preset, but `basename` is not, print a warning, and set the basename to some default value.
* Pass 1:
  - This is the bulk of the new work for animation. In this pass, we will compute all the knob values for every frame and store them in a data structure to be used when we actually draw each frame.
  - Create an array/list, where each index represents a frame.
    - Each index will contain a list of the knobs and their values for that frame.
  - When you see the `vary` command, compute how it changes, and add entries in the knob table for each frame covered in the `vary` command.
    - Use a simple linear interpolation for the change (i.e. total_change/frames ).
* Pass 2:
  * This is the normal drawing loop with 3 _potential_ changes (depending on if the frames is greater than 1).
  * Ignore `frames`, `basename` and `vary` commands, as they would have been taken care of in passes 0 and 1.
  * If frames is 1, do nothing differently from before.
  * If there are more than 1 frame:
    * Before evaluating any commands, go through the knob values computed from pass 1. Update the symbol table accordingly.
    * Go through all the commands, when a knob is present, use the value stored in the symbol table.
    * Ignore the `display` and `save` commands, no one wants to have these things run all the time.
    * After drawing _each_ frame, save it. Use the basename followed by a number (leading 0s are very useful, see the assignment for tips on adding them).
    * After drawing all the frames, stitch them together into an animated gif, more on that below.

__Dealing with frames and animated gifs__
* You will be generating _a lot_ of images. You should create a directory to store all the frames so they don't overrun your code directory.
  * Pro tip: Git does not track empty directories, so put some placeholder text file in your frame directory so that it shows up on GitHub (remember __DO NOT__ upload all your image files).
* There are 2 relevant imagemagick commands for us.
  * `$ animate`
    * Will display an animation based on the files given as parameters.
    * You can individual list files like this: `$ animate frame0.png frame1.png frame2.png` or, the better option, use the `*` character. This will only work if your files all have the same start to their names. It will stitch them together in the same order that they appear when running `$ ls`, which is why I suggest using at least 1 leading 0 when naming the frames.
    * This command should also be used when displaying an animated gif. Using the `display` command is not advised.
  * `$ convert`
    * We already use convert to change image file types, but it can also be used to make animated gifs.
    * If you give convert multiple files and specify the output format as a gif, it will automatically create an animated gif.
    * It works similar to `animate` in terms of the ordering of files.
    * There is an extra argument which you may want to use called `-delay` it helps specify the framerate.
      * Normally, we think of framerate in Frames Per Second (fps).
      * So 24 fps would mean 24 frames every second, this is the standard for film-based movies. 30 fps is the standard for TV shows (at least in the US, 25 for the rest of the world). 60 fps is a common HD framerate.
      * gifs measure frames a little differently, counting delays between frames in 1/100 second units. So we tend to think of gifs not in fps but in delay between frames, which is actually seconds per frame. To turn that into fps, just invert the value.
      * `-delay t` will put a `t`/100 second delay between each frame. So if `t` = 20, there will be 1/5 second delay between frames _or_ 5 fps. A delay of 1.7 is close to 60fps, 4.1 is close to 24fps, 3.3 is close to 30fps.
    * An example of using `convert` on a bunch of images that begin with the name `rolling`:
      * `$ convert rolling* -delay 1.7 rolling.gif`

##### [Back to top](#)
