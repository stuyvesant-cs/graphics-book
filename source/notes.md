### Relative Coordinate Systems

* Currently, all of our shapes are drawn in the same coordinate system. This was initially brought up back when we started transformations, noting that they were all done with respect to the origin. If our shapes were note centered at the origin, then scaling or rotating would move the shape in addition to performing the desired transformation.
* In a global coordinate system, it is also difficult to create complex objects made of multiple shapes. Take this "robot" for example:
    ![robot]({{"/assets/img/n03-robot.png" | relative_url}})
  * Some things to note about this image:
    * There are 8 distinct parts.
    * Each part is positioned relative to the main "torso" box.
    * The entire robot is rotated about the y-axis.
    * Both arms are rotated about the x-axis.
    * The left lower arm is rotated along with the upper arm, and then rotated independently of it.
* In order to achieve this level of shape dependence and independence, we need to change the way we think about transformations.
* Currently:
  * We create shapes without considering the world they will be drawn in, and separately build up transformations in a single transformation matrix.
  * We manually apply the transformations to the points that make up our shapes.
  * We only draw shapes to the screen when it is time to display/save.
* To implement relative coordinate systems:
  * We modify the coordinate systems first with transformations, before generating shapes.
  * When we add a shape, we generate the necessary polygons/lines and immediately place them in the current coordinate system (apply the current transformations).
  * _We no longer draw a sphere and then rotate it, now we rotate the world and draw the sphere in the changed world._
* This gives us shape independence, in order to create shape dependence, we need to keep track of changes we make to the world as we do them.
  * We can achieve this by maintaining a _stack_ of coordinate systems.
  * Each coordinate system on the stack will represent the "world" at a specific time.
  * When we push onto the stack, the new top will be based off of the previous top.
  * Popping off the stack will act like rewinding to an earlier version of the coordinate system.
* __Main changes to our graphics engine__
  * Replace the single master transformation matrix with a stack of matrices.
  * Transformation commands modify the current top of the stack.
    * __The order is important__, is should be __top * transformation__. You will need to account for this in your
  * Adding shapes follows the following pipeline:
    1. Generate the necessary polygons/lines (no changes needed in the drawing commands)
    2. Multiply the generated polygons/lines by the current top of the coordinate systems stack (placing the shape in the modified world).
    3. Draw the transformed polygons/lines to the screen.
    4. Clear out the polygons/lines.

##### [Back to top](#)
-----



### Scanline Conversion
Now that we have moved to a polygon based drawing engine (for 3D objects at least), we can realistically talk about filling in the polygons to make our shapes appear solid, instead of meshes.

Filling in each polygon means that our engine needs to plot every single pixel on the surface of each object being drawn (this is were backface culling starts to pay off, since we are already ignoring any non-visible faces). Because this is so exhaustive, we're going to need to make sure we're doing our best to minimalize the amount of work our engine does to fill in the polygons. This is where scanline conversion comes in.

Scanline conversion is the process of filling in a polygon by drawing a series of horizontal (or vertical) lines covering the entire surface of the polygon. This has a number of advantages over other possible approaches.
* The y value for each line is just 1 plus the previous y value.
* Horizontal lines have the same y value for each pixel, negating the need for y calculations inside the line algorithm.
* We can cover the entire surface while only visiting each pixel exactly _once_.

In order to scanline convert a triangle, the first thing we have to do is find the top, bottom and middle vertices.
* As long as each triangle in our triangle matrix has 3 distinct vertices, there will always _at least_ be a distinct top and bottom (this is why it was important not to add the degenerate triangles at the poles of a sphere). We can define the middle as the vertex that isn't either the top or bottom (more on this later).
* After ordering our vertices vertically, we have something like this:

  ![scanline]({{"/assets/img/n04-scanline_convert.png" | relative_url}})

Each scanline will go from one edge of the triangle to the other. In order to draw each line, we have to determine the endpoints.
* $$y$$ values are very simple. They start at the bottom ($$y_b$$), go up by 1 each time, and end at the top ($$y_t$$).
* The $$x$$ values are more complicated. They must move along the edges of the triangle. In the diagram above, I've designated that $$x_0$$ for each scanline to be the endpoint somewhere along the line $$BT$$, and $$x_1$$ will be the other endpoint, which will either be along $$BT$$ or $$MT$$, depending on how far up we've made it.
  * It doesn't matter if the middle vertex is to the left of right of the $$BT$$ edge, since our `draw_line algorithm` will swap endpoints if they're not listed left to right. This will make it easier to develop the scanline algorithm.
* Calculating $$x_0$$
  * $$x_0$$ starts at $$x_b$$ and ends at $$x_t$$
  * The question is, how much does $$x_0$$ change with each scanline ($$\Delta x_0$$)?
  * The total change in $$x_0$$ is $$x_t - x_b$$.
  * This change occurs over the course of drawing each scanline. So the number of scanlines determines the number of times we change $$x_0$$. In turn, the number of scanlines is just the difference in $$y$$ over the course of the triangle.
  * $$\Delta x_0$$ = (total change in x) / (# of scanlines)
  * $$\Delta x_0 = (x_t - x_b) / (y_t - y_b + 1)$$ (we need to add 1 to the y difference to account for the bottom-most line)
* Calculating $$x_1$$
  * $$x_1$$ also starts at $$x_b$$, but it ends at $$x_m$$ and then changes direction to go to $$x_t$$.
  * We need to calculate $$\Delta x_1$$ like with $$x_0$$, but we will have 2 different values, depending on whether we've moved past the middle vertex or not.
  * $$\Delta x_1 = (x_m - x_b) / (y_m - y_b + 1)$$ _or_
  * $$\Delta x_1 = (x_t - x_m) / (y_t - y_m + 1)$$.
  * We flip from the first to the second calculation once our $$y$$ has reached $$y_m$$.

Putting this all together, we can come up with this pseudocode outline:

  ```
  //initial setup, find b, t, m
  x0 = xb, x1 = xb, y0 = yb
  dx0 = (xt - xb) / (yt - yb)
  dx1 = (xm - xb) / (ym - yb)
  dx1_1 = (xt - xm) / (yt - ym)
  while y <= yt
      draw_line(x0, y, x1, y)
      //move the endpoints
      x0+= dx0
      x1+= dx1
      y+= 1
      //swap dx1 if neeced
      if y >= ym
          dx1 = dx1_1
          x1 = xm
  ```

- It is a good idea to think of the loop here as having 3 distinct parts:
  * drawing the line
  * updating the endpoints
  * swapping $$\Delta x_1$$
- The order in which you do these may not match the outline above, depending on how you handle "special" cases and other potential issues as they arise.

"Special" Triangles
* Scanline conversion works very well when there are distinct top, bottom and middle vertices.
* Sometimes, there is no distinct middle (once again, there will always be a top and bottom).
* These are cases when two vertices have the same $$y$$ value (either the top or bottom is a flat horizontal line).
* The $$x$$ values will be different, which is important.
* You can handle these cases either explicitly or implicitly, but you do need to consider them.

##### [Back to top](#)
-----

### Z-buffering
Z-buffering is another form of _hidden surface removal_.
* We are already doing backface culling, which removes all the polygons not facing the viewer.

Z-buffering specifically deals with the case when there are 2 objects in an image and we have to determine which one is in front of the other, and thus is visible.

Unlike backface culling, this needs to be done on a __per pixel__ basis, instead of per polygon. Imagine a sphere in front of a box, just because the sphere is in front doesn't mean we shouldn't draw the entire front of the box, instead we just want to make sure that the sphere "covers" specific parts of the front of the box, and the other parts are still drawn.

A Z-buffer is a 2D array of __floating point__ z values that maps directly to the 2D array of colors/pixels that contains our image. For example, the Z-buffer value at $$(4, 10)$$ is the z coordinate for the pixel drawn at point $$(4, 10)$$.

Currently when we plot a pixel we provide the $$(x, y)$$ coordinates and color.
* Now we will provide $$(x, y, z)$$ and a color.
* $$(x, y)$$ will determine the position in the image and z-buffer
* We will check the $$z$$ value against the value currently in the z-buffer.
  * If the new $$z$$ is larger (remember, +z is closer to the viewer), then we will update the image and z-buffer with the new values.
  * Otherwise, we will skip plotting the pixel entirely, as there must already be an object at that position that is more in front.
* In order for this to work, we need a good value to initialize z-buffer entries to.
  * What we want is a value that represents something so far away that any object we add would be on top.
  * This should be the smallest (most negative) value representable in your language of choice.
    * For example, in c this is `LONG_MIN` (defined in limits.h), in python it is `float('-inf')`.

In addition to maintaining a z-buffer, we need to now calculate z values whenever we draw lines. This includes:
* `draw_line`
* `scanline_convert`
* `draw_scanline` *(if you made a separate function to just draw scanlines)*
* `scanline_convert`
  * Here, `z` values can be treated the same as $$x$$ values.
  * $$z_0$$ starts at $$z_b$$ and goes to $$z_t$$
  * $$z_1$$ starts at $$z_b$$, goes to $$z_m$$ and then goes to $$z_t$$
  * You need a $$\Delta z_0$$ and $$\Delta z_1$$. These are calculated the same was as their $$x$$ equivalents:
    * $$(total change in z) / (amount of scanlines)$$ (see above for specifics)
* `draw_line` and `draw_scanline`
  * We actually have to go back to our very first graphics algorithm and modify it to take z values into account. On the plus side, we _need_ z values to be floating point based, so we will not have to try to map them as best we can to integers. This makes the calculation more straightforward.
  * You can think of generating `z` values in a similar way to what weed need to do in `scanline_convert`.
  * If we are drawing a line from `(x0, y0, z0)` to `(x1, y1, z1)`, that means as we draw the line, `z` must go from `z0` to `z1`.
  * Since we draw our lines 1 pixel at a time, we need to figure out how much `z` changes with each pixel. Like above:
    * $$\Delta z = (total change in z) / (amount of pixels)$$
    * Note that the denominator is the _# of pixels_ not the length of the line.
    * If the line is in octants I or VIII, the total # of pixels is based on the `x` values.
    * If the line is in octants II or VII, the total # of pixels is based on the `y` values.
    * Just think about the value that controls the loop that generates the line. Which coordinate is guaranteed to go up by 1 each time?

##### [Back to top](#)
-----

### Light and Reflection Types
In the real world, the color of an object depends on:
* The color and location of any light source.
* The reflective properties of the object.
* Here are a few examples of how this works out:
  1. If an object appears to be white then we know for certain:
    * The object reflects white (that is all colors).
    * White light is hitting the object
  2. If an object appears to be red, then we know for certain:
    * The object reflects red light.
    * Red light is hitting the object.
  3. If an object appears to be magenta (red and blue) then we know for certain:
    * The object reflects red and blue light.
    * Red and blue light is hitting the object.
* Other things may be true in each of these scenarios. It's possible that the light in 3 is white, and the object only reflects red and blue. It is equally possible that the object reflects all colors, but the light itself is only red and blue. Both of these scenarios would result in the same image.

A lighting model must be able to take these things into account.

#### Light Sources

We will work with 2 kinds of light sources, _ambient_ and _point lights_.

Both will have an associated color, either as an RGB triple or a single grayscale value.

__Ambient Light__
* This is the general background lighting of an image.
* Imagine you were outside on a cloudy day, there would be a general amount of brightness to everything, but no one specific location that light was coming from.
* It is common to think about ambient light as if it is coming from all directions with equal intensity.
* This means that it doesn't matter where an object is located.

__Point Light Sources__
* Point light sources come from a specific location.
* Think of these like a flashlight or spot light.
* Here, the position of an object in important, since that will tell us the object's relationship to the light source.
* It is possible for there to be multiple distinct point light sources in an image.

#### Types of Reflections

There are three kinds of reflections we will consider, _ambient_, _diffuse_ and _specular_.

__Ambient Reflection__
* This is simply the amount of ambient light reflected by an object.
* In the real world, this would not be separate from the other types of reflection, but it makes out modeling easier to separate it out.

__Diffuse Reflection__
* This is specifically for reflection of a point light source.
* The reflection of a specific light source evenly in all directions.
  * Note this is different from ambient light in that ambient light comes from all directions. Here, it is only the reflection that goes in all directions.
* Object that display a lot of diffuse reflection often appear dull or _matte_.
* Things like cloth or cardboard boxes tend to exhibit a lot of diffuse reflection.
* Diffuse reflection is dependent on the location of and object with respect to the point light source.

__Specular Reflection__
* This is specifically for reflection of a point light source.
* The reflection of a specific light source in a specific direction.
  * Note the difference here between specular and diffuse reflection.
* Objects that display a lot of specular reflection often appear shinny or _glossy_.
* Things like polished metal and glass tend to exhibit a lot of specular reflection.
* Since the reflection has a specific direction, specular reflection is dependent on the location of the object with respect to the point light source __and__ the viewer. The more the viewer is in line with the reflected light, the strong the reflection will appear.
  * Note this is not needed in diffuse reflection because that is reflected evenly, so any viewing angle would result in the same image.
* Specular reflections tend to be very strong and then die off quickly.

##### [Back to top](#)
-----

### Lighting Model

We will be using the _Phong Reflection Model_ to calculate the color of an object. (This is different from the Phong _shading_ model, which is a separate concept).

The Phong reflection model combines ambient, diffuse and specular reflections.
* ![phong reflection]({{"/assets/img/n05-phong_reflection.png" | relative_url}})

The color of an object will depend on:
* __A__: The color of ambient light (RGB or a single value [0-255])
  * e.g. 255, 255, 255 (white)
* __P__: The color of a point light source (RGB or a single value [0-255])
  * e.g. 255, 0, 255 (magenta)
* $$\overrightarrow{L}$$: The vector from the surface of an object to a point light source ( $$<x, y, z>$$ ).
  * e.g. $$<1, 0.5, 1>$$ (to the right, slightly up and in front)
* $$\overrightarrow{V}$$: The view vector (from the surface of an object to the viewer) ( $$<x, y, z>$$ ).
  * e.g. $$<0, 0, 1>$$ (directly in front)
* $$\overrightarrow{N}$$: The surface normal of a polygon, see notes on [backface culling](#backface-culling) for more on this.
* __Ka__: Constant of ambient reflection; how much ambient light is reflected by the object. ( RGB or a single value [0-1], think of it like a %).
  * e.g. 0.1, 0.1, 0.1
* __Kd__: Constant of diffuse reflection; how much a point light is reflected diffusely by the object. ( RGB or a single value [0-1] ).
  * e.g. 0.5, 0.5, 0.5
* __Ks__: Constant of specular reflection; how much a point light is reflected specularly by the object. ( RGB or a single value [0-1] ).
  * e.g. 0.5, 0.5, 0.5

In general, __I__ (for illumination), or the color of an object based on lighting will be calculated by:
- $$I = I_{ambient} + I_{diffuse} + I_{specular}$$

Ambient Reflection
* This is the ambient component of color. It is the easiest to compute since we don't need to take into account the location of the object or the viewer.
* equation: $$I_{ambient} = AK_a$$
  * If working in RGB instead of grayscale, you'll have to compute this separately for each color.

Diffuse Reflection
* This is the diffuse reflection of a point light source. We will need to model the relationship between the light source and the object.
  * ![diffuse reflection]({{"/assets/img/n06-diffuse_reflection.jpg" | relative_url}})
* Diffuse reflection is strongest when the surface is pointing directly at the light, and gets weaker as the object points away from the light.
* Put another way, the diffuse reflection is inversely proportional to $$\theta$$.
* This can be modeled with $$cos\theta$$.
* Lucky, for us, we already know that $$cos\theta$$ is the dot product of the two vectors. Unlike with backface culling, we _DO_ care about the magnitudes, so it is in our best interest to normalize both$$\overrightarrow{N}$$ and $$\overrightarrow{L}$$
  * The normalized version of a vector is often shown with a ^ like so: $$\hat{N}$$.
  * To normalize a vector, divide each component by the magnitude of the original vector.
  * For Vector $$\overrightarrow{A} =  <x, y, z>$$, $$M = \sqrt{x^2 + y^2 + z^2}$$, $$\hat{A} = <\dfrac{x}{M}, \dfrac{y}{M}, \dfrac{z}{M}>$$
* Once normalized, we can do: $$cos\theta = \hat{N} \cdot \hat{L}$$
* Combined with P and Kd, we get:
  * $$I_{diffuse} = PK_d(\hat{N} \cdot \hat{L})$$

Specular Reflection
* This is the specular reflection of a point light source. We will need to model the relationship between the light source and the _viewer_.
  * ![specular reflection]({{"/assets/img/n07-specular_reflection.jpg" | relative_url}})
* Specular reflection is strongest when the reflected light is pointing directly at the viewer.
* This is inversely proportional to $$\alpha$$, and can be modeled by $$cos\alpha$$.
* Here we need: $$cos\alpha = \hat{R} \cdot \hat{V}$$
* $$\hat{V}$$ is given, but how can we find $$\hat{R}$$?
  * ![reflection]({{"/assets/img/n08-r.jpg" | relative_url}})
  * Usint the above diagram: $$\hat{R} = \overrightarrow{T} + \overrightarrow{S}$$
  * $$\overrightarrow{T}$$ is the projection of $$\hat{L}$$ onto $$\hat{N}$$
    * The result is a vector with the same direction as $$\hat{N}$$, but with a magnitude scaled by $$\hat{L}$$.
    * $$\overrightarrow{T} = \hat{N}(\hat{N} \cdot \hat{L})$$
    * Note that while $$\hat{N}$$ and $$\hat{L}$$ should be normalized, $$\overrightarrow{T}$$ will not be (unless $$\alpha = 0$$)
    * Now we know $$\overrightarrow{T}$$ in terms of information we already have.
  * $$\overrightarrow{S}$$ can be found by doing some similar triangle work.
    * $$\hat{L} + \overrightarrow{S} = \overrightarrow{T}$$
    * $$\overrightarrow{S} = \overrightarrow{T} - \hat{L}$$
    * $$\overrightarrow{S} = \hat{N}(\hat{N} \cdot \hat{L}) - \hat{L}$$
  * Which then gives us:
      - $$\hat{R} = \hat{N}(\hat{N} \cdot \hat{L}) + \hat{N}(\hat{N} \cdot \hat{L}) - \hat{L}$$
      - $$\hat{R} = 2\hat{N}(\hat{N} \cdot \hat{L}) - \hat{L}$$
* Usin this, we get $$\cos\alpha =[2\hat{N}(\hat{N} \cdot \hat{L}) - \hat{L}] \cdot \hat{V}$$
* Combined with P and Ks we get:
  * $$I_{specular} = PK_s([2\hat{N}(\hat{N} \cdot \hat{L}) - \hat{L}] \cdot \hat{V})$$
  * This doesn't take into account the fact that specular reflections are supposed to die off quickly. Note that the specular component from the Phone reflection image above is mostly a group of small, bright circles. The simplest way to get this effect is to raise $$cos\alpha$$ to some exponenet larger than 1. The specific value will depend on what looks right to you.
  * $$I_{specular} = PK_s([2\hat{N}(\hat{N} \cdot \hat{L}) - \hat{L}] \cdot \hat{V})^x$$

__Putting it all together__
* $$I = I_{ambient} + I_{diffuse} + I_{specular}$$
* $$ I = AK_a + PK_d(\hat{N} \cdot \hat{L}) + PK_s([2\hat{N}(\hat{N} \cdot \hat{L}) - \hat{L}] \cdot \hat{V})^x$$
* For now, we should calculate $$I$$ once per polygon. This is known as __flat shading__. Later on we will look at other shading options.

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
