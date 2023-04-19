var ptx_lunr_search_style = "textbook";
var ptx_lunr_docs = [
{
  "id": "colophon-1",
  "level": "1",
  "url": "colophon-1.html",
  "type": "Colophon",
  "number": "",
  "title": "Colophon",
  "body": " copyright  "
},
{
  "id": "chapter-1",
  "level": "1",
  "url": "chapter-1.html",
  "type": "Chapter",
  "number": "1",
  "title": "Colors, Depth, Space (and Time?)",
  "body": " Colors, Depth, Space (and Time?)   Image File Formats   Vector Formats  Vector formats represent images as a series of drawing instructions. Becuase of this, they are infinitely scalable. This is well suited for iamges that can be defined geometrically, but not as well for real-world images. Common file type: SVG (Scalable Vector Graphics).    Raster Formats  Raster formats represent images as a grid of color values (pixels).  Raster images can be uncompressed or compressed.  Uncompressed formats contain color data for each pixel. These files are quite large. Common file types: BMP, TIFF, RAW  Compressed formats use a compression algorithm to minimize file size. Some of these algorithms are lossless, while others are lossy.  Lossless compression algorithms contain enough information to exactly recreate the original image. Common file types: PNG (Portable Network Graphics), GIF (Graphics Interchange Format)  Lossy compression algorithms do not retain all the details of the original image. Common file type: JPEG (Joint Photographic Experts Group).    NetPBM File Formats  A family of uncompressed raster image file formats ( more info ).  In this class we will be using the PPM (Portable PixMap) format specifically. PPM files prespresent pixel data as RGB (Red, Green, Blue) triplets in either ASCII or binary. In ASCII based PPMs, all whitespace is equivalent. Here is a sample ASCII PPM file:  P3 4 3 255 255 0 0 255 0 0 255 0 0 255 0 0 0 255 0 0 255 0 0 255 0 0 255 0 0 0 255 0 0 255 0 0 255 0 0 255  The first three lines make up the file header:  P3 : Type of PPM, 3-btye RGB, in ASCII ( P6 is RGB in binary).  4 3 : Width x Height, in pixels.  255 : Maximum value per color (will scale to 255 if not 255)      "
},
{
  "id": "chapter-2",
  "level": "1",
  "url": "chapter-2.html",
  "type": "Chapter",
  "number": "2",
  "title": "Bresenham's Line Algorithm",
  "body": " Bresenham's Line Algorithm   The Problem  The particular problem of drawing a line on a computer screen, is that the physical pixels, and the data structures we use to represent images in memory, are bound by integer coordinates. We cannot exactly represent a line that in reality has an infinite amount of non-integer points along it. The purpose of a line algorithm is to find the pixels, using integer coordinates, that best approximate what the line should look like.    Testing Potential Points  The basic concept of Bresenham's Line Algorithm is to find potential pixels that we think would be good candidates for the line, test them, and then select the best one. To begin, we will start by restricting our line algorithm to only lines where , this will help narrow doent the possible pixels. Eventually, we can modify it to work for the other octants. We will also assume that our endpoints only have integer coordinates. With those restrictions in place, if we are drawing a line as starting at , we only have 2 candidate pixels, and :  A 9x5 grid with endpoints marked at (0, 0) and (9,3)      Developing the Algorithm   Round I: Testing Both Points  Since we know the slope is less than 1 (and positive), we know that we can create our line by moving forward in x by 1 until we reach . Let's assume there is a function , that we can use to test our candidate points, such that the smaller the value of the function, the closer is to the line. Putting this together, we have all we need for an initial algorithm:  x = x0, y = y0 while x <= x1. plot(x, y) \/\/actually draw the pixel d0 = f(x+1, y) d1 = f(x+1, y+1) if d1 < d0 \/\/meaning d1 is close to the real line y++ \/\/only increment y when necessary x++ \/\/we always increment x    Round II: Testing the Midpoint  Instead of testing both possible points, we could test the midpoint, . The midpoint of the possible pixels is on the border between them, which leaves us with 3 possibilities:  The midpoint is above the line. This means the line is mostly below the midpoint, and we should choose the lower pixel, .  The midpoint to below the line. This means the line is mostly above the midpoint, and we should choose the upper pixel, .  The midpoint is on the line. In this case, either pixel is a good match.      The Testing Function  Let's look at . We will use the standard form of a line: Where , , and (here is the y-intercept). Since we are assuming , and that our input coordinates are positive, then we know that is also positive, and is the only negative value in the function at all (ignoring ). That tells us that if is negative, then is larger than it should be if were on the line, meaning that is above the line. Conversely, if is positive, then is smaller than it should be if were on the line, meaning that is below the line. So now we can say that:  If is negative the midpoint is above the line.  If is positive the midpoint is below the line.  If is the midpoint is on the line  This brings us to the next iteration of the algorithm:  x = x0, y = y0 d = f(x+1, y+1\/2) while x <= x1 plot(x, y) \/\/actually draw the pixel if d > 0 \/\/+d value means the m.p. is below the line y++ \/\/only increment y when necessary x++ \/\/we always increment x d = f(x, y)    Round III: Testing No Points!  The first time we run is on :  is on the line so we know . This results in an initial calculation based on values that are straightforward to get given the endpoints of the line. This is not a huge benefit though, since we're still calculating repeatedly inside our loop. So let's think about what's happening inside the loop. Each time the loop runs, we add 1 to , and sometimes we add 1 to . Look at what happens when we choose . In our code, d represents the previous value of , calculated as , then if we use , the result is d + A + B . In general, every time we add 1 to x , we must add A to d , and every time we add 1 to y , we must add B to d . This means we can remove from our algorithm entirely, giving us (this version starts by multiplying A and B by 2 in order to keep all values as integers):  x = x0, y = y0 A = 2(y1 - y0) B = -2(x1 - x0) d = A + 1\/2B while x <= x1 plot(x, y) if d > 0 y++ d+= B x++ d+= A  Another way to think about this algorithm is to consider d as a variable that accumulates how off from the true line we have become. If we were always exactly on the line (this is the case for slopes 1, 0 and undefined), we'd be adding 0 to d each loop iteration. Given that we are starting with positive slopes less than 1, our loop is designed to always increase x , and occasionally, when d has accumulated too much error, we need to increase y . A is based off the change in y , which is always positive, B is the negation in the change in x , which is always negative. When d becomes negative overall, it means we've gone too far from the line, and need to make it positive by adding A and also increasing in y .  Now we need to revisit our initial restriction, that . In graphics, we often take the coordinate plan and break it up into 8 sections, called octants :  The coordinate plane divide in 8 equal parts    In order to have a fully functioning line algorithm, we need to handle any slope. Thankfully, we can ignore octants III - V, because those slopes correspond to lines in octants I, II, VII and VIII. To translate our octant 1 algorithm to another octant, we need to look at what has changed, and how that impacts the calculations. In octant II, , or, the line goes up more often than it goes across. This means:  Our loop should be based on y values: while y <= y1 .  Our loop should always run y++ and d+=B , and only run x++ and d+=A inside a conditional statment.  The first midpoint is based off of : d = 1\/2A + B .  A is positive, and since we are always adding A to d , the trigger for increasing x should be d < 0 , so that the neagative value, B can correct the overly positive error.      "
},
{
  "id": "chapter-3",
  "level": "1",
  "url": "chapter-3.html",
  "type": "Chapter",
  "number": "3",
  "title": "Edge Lists &amp; Matricies",
  "body": " Edge Lists & Matricies   Using Edge Lists  Until we start to render 3D shapes, all of our images will be generated by calling draw_line between pairs of points. To help organize, and later modify, our images better, we will store these points in an edge list , and only call (and thus modify our screen object) when we are ready to render the entire image. This sets up our initial graphics pipeline:  All shapes will be added as a series of edges to the main edge list.  Any transformations (more on that later) will be applied to the main edge list.  When we are ready to see\/save an image, we will iterate over the edge list calling draw_line .    There are a few options for maintaining edge lists. Consider the following image:  A triangle and square  The triangle portion could be represented by any of the following edge lists: Here, we would generate the image by iterating through the edge list 1 point at a time, connecting each point with the next one, and include a final line back to the initial point. This works well if the entire image was a single closed object, but less so for open ended or disjoint objects. This is very similar to the first, execpt there's no implicit connection from the last point to the first. This means we could have open ended shapes, but disjoint shapes, like the diamond, would not be as simple, since in this option, by adding we wouild get a line , which we don't want. In this version, we would generate the image by iterating over the list by pairs of points, drawing the lines between them. The advantage to this approach is that the list need not \"know\" anything about the image and what it contains. Every edge is explicitly defined. The downside is that there is a lot of duplication of points, but hey, memory's cheap.  We will focus on the last implementation, the other two are viable, but require extra work to be able to draw any arbitrary image (such as a separate list containing # of edges per shape, or a \"delimeter\" point). It is important to remember that points are triples, so our edge lists would more accurately look like the following: The extra row of 1s at the bottom is necessary for certain transformations that we will cover later.    Matrix Math for Graphics  Now that we are arranging our image information as edge matrices, we should look into how we can leverage matrix math for graphics purposes. To start, we need only talk about two concepts, matrix multiplication and the multiplicative identiy matrix .   Matrix Multiplication  In order to mulply two matrices, , the number of columns in must equal the number of rows in . So if is a matrix, then must be .  Matrix multiplication is _not_ commutative, so . This will be useful to us later on. To perform , you match up each row of with the coresponding column in , multiply each coresponding element, and add those products together to find each element in the product matrix. For a simple example, consider the following: For a more complex example:     Multiplicative Identity  The multiplicative identiy matrix must:  Be a square matrix.  Have a diagonal of 1s, from upper-left to lower-right corners.  Have all other values be 0.  A identity matrix:     "
},
{
  "id": "chapter-4",
  "level": "1",
  "url": "chapter-4.html",
  "type": "Chapter",
  "number": "4",
  "title": "Transformations",
  "body": " Transformations   Transformation Matrices  In order to perform transformations, we will construct a transformation matrix  , which can then be applied to our edge matrix by matrix multiplication. By asserting that the order of multiplication is always , we can constrain to always be a matrix. For each transformation, it is helpful to think of it with the following framework:  What information is required in order to perform the transformation?  What happens to after the transformation is applied?  While there are many transformations we could create, we will focus on translation , dilation , and rotation for our graphics engine. These will allow us to make interesting manupulations of our images, while also demonstrating how to develop other transformations, if desired.   Translation  Translations can be thought of as sliding an image along any axis. Translations should preserve the number of points, the order of the points, as well as the distances between them.  Necessary information: Translation factors for each component,  Function:  You can generate a translation matrix by starting with the Identity matrix, and then replacing the values in the last column with your translation factors like so: Note that this simple translation matrix is made possible by including the bottom row of 1s in our edge matrix. Without that, we'd have to include operations like: , which would in turn mean that the translation matrix would have to change for every point in the edge matrix, like so:     Dilation  Dilation (or scaling) is enlarging or shrinking an image. Dilations will preserve the number and order of points, but not the distance (unless the dilation factor is 1 for all coordinates). Currently, dilations will be performed with respect ot the origin, meaning that objects not centered at the origin will also move away (when enlarging) or toward (when shrinking) the origin. Eventually, this will be less of a concern, but for now, you can achieve arbitrary dilations by translating to the origin, dilating, and then translating back.  Necessary information: Dilation factors for each component,  Function:  You can generate a dilation matrix by starting with the Identity matrix, and then replacing the 1s with your translation factors like so: Dilations intended to preserve the asptect ratio of the orginal image should use the same value for , , and . Using different values will resulting in stretching\/squishing the image in verious dimentions.    Rotation  Like dilations rotations will also be performed with respect to the origin. We will be performing 2D rotations in 3D space. So for any rotation, one coordinate will remain fixed, and the others will change based on the rotation. We will refer to the fixed coordinate as the axis of rotation .  Figuring out the rotation function is a bit more complicated than the previous transformations. First let's look at a rotation about the z axis:   Since the point does not change along the axis of rotation, we only need to conern ourselves with We need to find a way to represent based on information we know. Using polar coordinates, we can re-write as Similarly, can be written as Using the angle sum formula, and the values for above, we get the following:   This gives us in terms of values we know. Because rotations change depending on the fixed axis, we will have 3 different rotation functions.  Necessary information: Angle of rotation, and axis of rotation.  Function: See below for each axis of rotation     Z-Axis Rotation  Function:      X-Axis Rotation  Function:      Y-Axis Rotation  Function:        Combining Transformations  Let's say we have the following matrices:  : Edge matrix  : Translation  : Dilation  : Rotation  And we perform the following operations to generate new edge matrices:  : , moved  : , moved, then scaled  : , moved, then scaled, then rotated  Substituting back up the chain we get: Or more clearly, . Becuse matrix multiplication is associative , we can write this as Which means that we can generate the same image by multipling transformation matrices with each other then multiplying by an edge matrix as we could by multiplying the edge matrix by each transformation matrix separately . This could save lots of time, since all transformation matrices are , while our edge matrices are .  The order is important. Note that: is not the same as because matrix multiplication is not commutative. The first image would be the reslut of moving, scaling, then rotating. The second would be the result of rotating, scaling, then moving. It is common (since most of us are used to reading left->right), to think about the appilcation of transformations that way. You have been warned .   "
},
{
  "id": "chapter-5",
  "level": "1",
  "url": "chapter-5.html",
  "type": "Chapter",
  "number": "5",
  "title": "Parametric Equations &amp; Curves",
  "body": " Parametric Equations & Curves   Parametric Equations  Parametric equations can be used to caluculate the components of the points along a cuve as a function of an independent variable (commonly referred to as ). For example, let's say we want to draw a line from to . We can define this parametrically as: At , we just get and at , we get . As moves over the range , these equations will generate all the points along the line. We already have a very good way of drawing a line, but we can generalize this process for other shapes, assuming we have functions which returns x values and which returns y values: By using the framework above to generate points that we can add to our edge matrices, we can draw any shape that can be defined in such a manner.   Parametric Circle  If you wanted to use this technique to draw a circle with radius and center :      Splines  Splines are a special set of polynomial curves. They are designed in such a way that you can combine 2 or more splines smoothly in order to generate higher degree curves. You may recall the term spline from your drafting days, using splines to make non-arc based curves. In Computer Graphics, splines are an effective way of generating arbitrary curves effeciently. We will only need to create 3rd degree curves at most, but still be able to generate more complex looking ones by combining splines.  Remember that our purpose is to make a graphics engine, and not a graphing calcuator. So when thinking about drawing arbitrary polynomials, we have to think about what information is useful to us. Think about a circle, in order to draw one, we would like to know the center and radius. Turns out, that information not only describes the shape we're drawing, but also goes directly into the parametric equations for making a circle. It is also easy to provide that information via a GUI (click center, drag for radius, boom). A standard 3rd degree polynomial, doesn't trasnlate as easily into the graphical world. Think about drawing a line, we specify endpoints and generate the equation based on that. We will look at two types of splines, Hermite and Bezier curves, which are similar (in fact, you can translate between the two), but differ in the information required to generate a cruve.   Hermite Curves  To generate Hermite Curves, we will need the following information:  : endpoints  : rates of change at each endpoint.   designate where the curve starts and ends. Specifying rates of change at each endpoint allows us to both generate curves between the endpoints, but also connect multiple curves smoothly. Two Hermite curves that share a common endpoint and rate of change at that endpoint will nicely connect to create a larger, more complex cure.  We will use parametric equations to help get from this information to points along a curve, assuming : This is a standard cubic equation. Substituting for will generate points along our curve. Ultimately, this is the equation we need to make a curve, so we will need to calculate the coeficients based on the given information.  In order to actually make a curve, we will need separate functions for and , such that and . Since the math is identical for both, We will just look at in general.  We will also need the derivative of : After checking with Mr. Kats, I am certain that substituting for , this will generate the rates of change along the curve defined by .  Now, let's plug in some values for and see what we get:  When :  which corresponds to  which corresponds to  When :  which corresponds to  which corresponds to  Now we have 4 unknowns, and 4 equations, you may recall this from math as a system of equations problem. There are many ways to deal with this, but since we're already in graphics, let's use matrices!   So multiplying the special Hermite matrix, by the Coeficient matrix , reuslts in the Given information . Of course, the problem here is that we DONT KNOW THE COEFICIENTS . Never fear, divison (or rather, multiplying by the multiplicative inverse), is here!. , so . We just need the inverse of , which I just happen to have right here:  will give us the coeficients to fill out , so that we can loop to from 0 to 1 to generate the points along our Hermite curve. Et viola!     Bezier Curves  To generate Bezier curves, we need the following information:  : endpoints  : \"control\" points   designate where the curve starts and ends. are points that influence the shape of the curve as we move between endpoints. You can think of these points as \"pulling\" the curve as it is generated. In general, in order to create a Bezier curve of degree , we need points. The best way to understand how Bezier curves work is to start with a line and work our way up to cubic.   Bezier Line   In order to understand higher order Bezier curves, let's start with the simplest, the line. Graphically, a Bezier line can be generated by linerarly moving between the endpoints, as seen in the image to the right. Algebraically, we can write this as:         Bezier Quadratic   A quadratic needs one more point than the line. This creates 2 normal lines, that we move along in the standard fashion. This creates a series of endpooints that we can use to create a new line (pictured in green). As we move along each static line, we also move along the dynamic line, which in turn generates the points on our quadratic curve. Since the quadratic is generated by moving across a line, we could represent it as: But are not points, they're lines. Substituting in the linear equation, we get:         Bezier Cubic   Just as a quadratic is made from 2 linear bezier cuves, a cubic is generated by moving along a line whose endpoints would generate 2 quadratic curves. The blue line generates the cubic, and its endpoints march along the green lines, which in turn march along the staic gray lines connecting all the input points. Since the cubic is generated by moving across a line, we could represent it as: But are not points, they're quadratics! Substituting in the quadratic bezier equations is a bit uglier, though the keen observer may have noticed these equations follow the binomial expansion...         Bezier Implementation  Now we have an equation , that will generate points along a cubic Bezier curve, but is spread throughout the equation. With a little more algebra we can get to: This is a cubic of the form , that we can put into a parametric loop, the same way we generated Hermite curves. In fact, if we wanted to, we could use our existing matrix multiplication framework to generate the coeficients based on the given information (this is not a necessary step)      "
},
{
  "id": "chapter-6",
  "level": "1",
  "url": "chapter-6.html",
  "type": "Chapter",
  "number": "6",
  "title": "3D Shapes",
  "body": " 3D Shapes  We will be working with the following 3D shapes: Box, Sphere, Torus. There are many other 3D shapes that could be easily generated programmatically, these specific three allow us to work with and test many advanced features, especially when it comes to lighting & shading. If you want to add more shapes, keep that idea as a feature to be added to your final project. For each shape, we want to start by considering 2 important questions:  What given information should we require?  What are the points that our engine will need to generate in order to draw the shape?  The goal of our engine will be to create the necessary points from the given information (this is how we created circles & splines as well).   Box  To make a box, we need the folloing:  A vertex: for consistency, we will be using the left-top-front vertex.  Width: Size in the x dimension.  Height: Size in the y dimension.  Depth: Size in the z dimension.  The defining points of a box are its 8 vertices, which can be straightfporwardly calculated from the given information above. Once you have the 8 vertices, you can directly add the 12 edges that make up the box. You don't need to do anything fancy here.    Sphere  To make a sphere, we need the following:  Center point.  Radius.  The defining points are any points along the surface of the sphere. in theory, there are an infinite number of points on the surface, but we can use a subset of all those to help draw something that looks like a sphere.   Sphere Point Generation  The points on the surface of a sphere can be generated by taking a circle and rotating it. Each circle rotation creates a new \"slice\" of the sphere. The circle can be rotated about the x or y axes, but not z. The only difference will be the location of the \"poles\" of the sphere. An x-rotated sphere will have its poles on the left and right ends, while a y-rotated sphere will have its poles on the top and bottom. The matrix multiplication above leaves us with equations that we can use to find the points of a sphere:   Here is used as the angle of rotation and is used as the angle of circle creation. If you only use one angle, then you would generate one point per circle each rotation. The resulting shape would be a sprial going along the sphere (pleasing, but not our goal). You can generate a sphere either by creating a full circle and rotating it π radians, or by creating a semi-circle and rotating it 2π radians. For reasons that will become clear later, it is to our advantage to use the semi-circle method. With these equations we can create a nested-loop parametric function to generate all the points on a circle: for rot: 0 -> 1 for cir: 0 -> 1 x = r * cos(π * cir) + Cx y = r * sin(π * cir) * cos(2π * rot) + Cy z = r * sin(π * cir) * sin(2π * rot) + Cz      Torus  A torus is a doughnut (or bagel, if that's your thing)-like shape, that is simlar in some repsects to a sphere. To generate a torus, we will need:  Center point of the entire torus.  Radius of circular cross-section  Distance from the torus center to center of the cross-section  Like a sphere, the defining points are any points along the surface of the torus.   Torus Point Generation  A torus, can be generated in a similar way to a sphere, except you move the circle away from the torus center before rotating. You have to be careful about how you move the circle and then rotate it. Only specific combinations will work:  Move a circle horizontally (x translation) and y rotation.  Move a circle vertically (y translation) and x rotation.   This leaves us with the following Torus equations:   Here is used as the angle of rotation and is used as the angle of circle creation. Unlike a sphere, both and must go from 0 to 2π in order to generate a full Torus. Limiting one of the angles to π would result in odd variations of half-tori.     Implementing 3D Shapes  The algorithms desribed above generate the points for our 3D shapes, but they don't cover how we should use those points in order to  Currently, the basic drawing unit for our graphics engine is a line . This works quite well for representing   "
},
{
  "id": "chapter-7",
  "level": "1",
  "url": "chapter-7.html",
  "type": "Chapter",
  "number": "7",
  "title": "Polygons",
  "body": " Polygons   Currently, our basic unit of drawing is a line. When we create a shape, we add edges to an edge matrix, and we loop through that matrix drawing lines. A 3D shape rendered using edges only has no real surface to speak of. Instead, it is a wire-frame model . Wire-frame models can be rendered quickly, but because they lack true surface, there are limits to how realistic they can look.  If we change our basic unit of drawing form a line to a polygon, we will have surfaces to work with, generating a polygon mesh . Having a surface gives us more options when rendering 3D objects. Most notably:  Polygons can be filled with colors, creating solid objects.  We can describe polygons as \"facing\" a particular direction, and use that information to determine sides of our 3D shapes that are facing away from the viewer and should therefore not be rendered.  We can also use the direction a polygon is facing to help calculate real-world lighting and shading values.  There are many possible shapes we could use as our basic polygons, we will use triangles, as they are the simplest polygon.    Polygon Lists  Our current shapes are all based on _edge lists_, where every 2 points determine a distinct edge to be drawn. We should keep this framework around in order to draw 2 dimensional shapes when desired. We need to add polygon lists , where every 3 points determine a distinct triangle. Here is a chart comparing the functions in our 2D, edge based, drawing stack and their 3D, polygon based, equivalents.    Edge Framework  Polygon Framework    add_point Add a point to the edge list  add_point Add a point to the polygon list    add_edge Add the endpoints of a line to the edge list.  add_polygon Add the three vertices of a triangle into the polygon list. The vertices must be added in counter-clockwise order.    draw_lines Go through the edge list 2 points at a time, drawing a line between each pair of points.  draw_polygons Go through the polygon list 3 points at a time, connecting the points to draw a triangle. Other polygon features can be added here later.    By adding the points in counter-clockwise order, we will be able to eventually determine what is forwards and backwards with respect to the triangle. This will help us implement more advanced features later.    Polygon Based Shapes   Box  A box has 6 faces, each one made up of 2 triangles. Like before, the easiest thing to do here is add your 12 triangles directly into the polygon list. The order of the triangles does not matter, but the order of the points does . Points should always be added counter-clockwise.    Sphere  We generate spheres by drawing a series of rotated semi-circles. If you followed my advice, you should have a separate generate_sphere function that returns a matrix of points for the sphere. Our job now is to go through that list of points, adding triples of points representing the triangles on the surface of the sphere to our polygon list. The best thing to do is physically draw the first two semicircles generated by your code, and write out what triangles are required.  2 sphere semicircles    When drawing semi-circles, you need to generate the poles, which are created when t=0 and t=1 , respectively. This is different from drawing full circles, you don't need to include t=1 there because the point at t=1 is identical to the point at t=0 .The way my loops are written, this means when I set steps to 10 I actually get 11 points per semi-circle.  It is also important to keep track of the direction your semi-circles are drawn in. If you used the example from class (semi-circles rotated about the x-axis), then each new semi-circle is drawn in front of\/below the previous one. Here are some of the triangles taken from the diagram above: 0: p0, p1, p12 1: p1, p2, p13 2: p1, p13, p12   At the poles, there is only one triangle to add per section, this is triangle 0 above. Otherwise, triangles are added in pairs, as is shown by triangles 1 and 2. If n is the number of points in a semi-circle, then we can define the triangles for the non-poles as: p, p + 1, (p + n) + 1 p, (p + n) + 1, p + n At the poles, we need to make sure not to add both triangles. Following the above formulae, at p=0 , we would have triangles 0, 1, 12 and 0, 12, 11 . But for the second triangle, 0 and 11 are the same point. This would render as a straight line, which might not seem like a big deal, but having these \"degenerate\" triangles at the poles will cause problems down the line, so it's best to exclude them now.    Torus  Torus creation is very similar to the sphere, with a couple of changes.  Tori must be generated with full circles.  No 2 circles of a torus share any common points, which means we don't have poles . This actually makes it easier to code since we don't have those special cases.  The tori from class are generated by rotating about the y-axis. This means that each new circle is drawn behind the previous one.  As with the sphere, it is advised that you draw out the first two slices of torus to map out the appropriate triangles.     Vectors  Backface culling is a crucial hidden surface removal algorithm. But before we get into how it works, we need to take a quick detour to cover some pieces of Vector math. This will also come in handy when we start workign with lighting and shading.  A vector is a unit that has both direction and magnitude (size). Vectors are written like so: Notice that vector components are placed inside to differentiate them from points. A point only describes a single point in space, whereas a vector describes a relationship between 2 points (often, not always, an arbitrary point and the origin)  You can think of a vector as describing how you would get from point to point . For example, consider the following two points: To get from to , you would have to move +2 in x, -5 in y and +23 in z, so we would write the vector as: The vector from to moves in the opposite direction, and would be written as: Generally, you can find the vector between 2 points by subtraction. Notationally, vectors are written with a as seen above.   "
},
{
  "id": "table-1",
  "level": "2",
  "url": "chapter-7.html#table-1",
  "type": "Table",
  "number": "7.1",
  "title": "",
  "body": "   Edge Framework  Polygon Framework    add_point Add a point to the edge list  add_point Add a point to the polygon list    add_edge Add the endpoints of a line to the edge list.  add_polygon Add the three vertices of a triangle into the polygon list. The vertices must be added in counter-clockwise order.    draw_lines Go through the edge list 2 points at a time, drawing a line between each pair of points.  draw_polygons Go through the polygon list 3 points at a time, connecting the points to draw a triangle. Other polygon features can be added here later.    "
},
{
  "id": "colophon-2",
  "level": "1",
  "url": "colophon-2.html",
  "type": "Colophon",
  "number": "",
  "title": "Colophon",
  "body": " This book was authored in PreTeXt .  "
}
]

var ptx_lunr_idx = lunr(function () {
  this.ref('id')
  this.field('title')
  this.field('body')

  ptx_lunr_docs.forEach(function (doc) {
    this.add(doc)
  }, this)
})
