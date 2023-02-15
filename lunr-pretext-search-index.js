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
  "title": "Edge Lists & Matricies",
  "body": " Edge Lists & Matricies   Using Edge Lists  Until we start to render 3D shapes, all of our images will be generated by calling draw_line between pairs of points. To help organize, and later modify, our images better, we will store these points in an edge list , and only call (and thus modify our screen object) when we are ready to render the entire image. This sets up our initial graphics pipeline:  All shapes will be added as a series of edges to the main edge list.  Any transformations (more on that later) will be applied to the main edge list.  When we are ready to see\/save an image, we will iterate over the edge list calling draw_line .     "
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
