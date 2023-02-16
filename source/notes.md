### Transformations


**Combining Transformations**
- Let's say we have the following matrices:
  - $$E_0$$: Edge matrix
  - $$T$$: Translation
  - $$D$$: Dilation
  - $$R$$ Rotation
- And we perform the following operations to generate new edge matrices:
  - $$E_1 = TE_0$$: $$E_0$$, moved
  - $$E_2 = DE_1$$: $$E_0$$, moved, then scaled
  - $$E_3 = RE_2$$: $$E_0$$, moved, then scaled, then rotated
  - Substituting back up this chain, we get:
    - $$E_3 = RDTE_0$$ Becuse matrix multiplication is _associative_, we can write this as:
    - $$E_3 = (RDT)E_0$$ Which means that we can generate the same image by multipling transformation matrices with each other _then_ multiplying by an edge matrix as we could by multiplying the edge matrix by each transformation matrix _separately_.
    - This could save lots of time, since all transformation matrices are $$4\times4$$, while our edge matrices are $$4\times N$$.
  - The order is important. Note that:
    - $$(RDT)E_0$$ is not the same as
    - $$(TDR)E_0$$ because matrix multiplication is not commutative.
    - The first image would be the reslut of moving, scaling, then rotating. The second would be the result of rotating, scaling, then moving.
    - It is common (since most of us are used to reading left->right), to think about the appilcation of transformations that way. **_You have been warned_**.


##### [Back to top](#)
-----

### Parametric Equations
Parametric equations can be used to caluculate the components of the points along a cuve as a function of an independent variable (commonly referred to as $$t$$). For example, let's say we want to draw a line from $$(x_0, y_0)$$ to $$(x_1, y_1)$$. We can define this parametrically as:

  $$
  \begin{aligned}
  x = x_0 + (x1 - x0)t \\
  y = y_0 + (y1 - y0)t
  \end{aligned}
  $$

At $$t = 0$$, we just get $$(x_0, y_0)$$ and at $$t = 1$$, we get $$(x_1, y_1)$$. As $$t$$ moves over the range $$0\rightarrow1$$, these equations will generate all the points along the line. We already have a very good way of drawing a line, but we _can_ generalize this process for other shapes:

  $$
  \begin{aligned}
  t: 0\rightarrow1 \\
  x = f(t) \\
  y = g(t)
  \end{aligned}
  $$

By using the framework above to generate points that we can add to our edge matrices, we can draw any shape that can be defined in such a manner.
* Parametric circle with radius $$r$$ and center $$(c_x, c_y)$$:

  $$
  \begin{aligned}
  t: 0\rightarrow1 \\
  x = rcos(2\pi t) + c_x \\
  y = rsin(2\pi t) + c_y
  \end{aligned}
  $$

##### [Back to top](#)
-----

### Splines
Splines are a special set of polynomial curves. They are designed in such a way that you can combine 2 or more splines smoothly in order to generate higher degree curves. You may recall the term [spline](https://en.wikipedia.org/wiki/Flat_spline) from your drafting days, using splines to make non-arc based curves. In Computer Graphics, splines are an effective way of generating arbitrary curves effeciently. We will only need to create 3rd degree curves at most, but still be able to generate more complex looking ones by combining splines.

Remember that our purpose is to make a graphics engine, and _not_ a graphing calcuator. So when thinking about drawing arbitrary polynomials, we have to think about what information is useful to us. Think about a circle, in order to draw one, we would like to know the center and radius. Turns out, that information not only describes the shape we're drawing, but also goes directly into the parametric equations for making a circle. It is also easy to provide that information via a GUI (click center, drag for radius, boom). A standard 3rd degree polynomial, $$ax^3 + bx^2 + cx + d$$ doesn't trasnlate as easily into the graphical world. Think about drawing a line, we specify _endpoints_ and generate the equation based on that. We will look at two types of splines, _Hermite_ and _Bezier_ curves, which are similar (in fact, you can translate between the two), but differ in the information required to generate a cruve.

**Hermite Curves**
- Given information:
  - $$P_0, P_1$$: endpoints
  - $$R_0, R_1$$: rates of change at each endpoint.
  - $$P_0, P_1$$ designate where the curve starts and ends. Specifying rates of change at each endpoint allows us to both generate curves between the endpoints, but also connect multiple curves smoothly. Two Hermite curves that share a common endpoint _and_ rate of change at that endpoint will nicely connect to create a larger, more complex cure.
  - We will use parametric equations to help get from this information to points along a curve.
- Parametric framework: $$t: 0 \rightarrow 1$$
  - $$f(t) = at^3 + bt^2 + ct + d$$ Standard cubic equation, substituting for $$t$$ will generate points along our curve.
    - Ultimately, this is the equation we need to make a curve, so we will need to calculate the coeficients based on the given information.
    - N.B. In order to actually make a curve, we will need separate functions for $$x$$ and $$y$$, such that $$f_x(t) = x$$ and $$f_y(t) = y$$. Since the math is identical for both, We will just look at $$f(t)$$ in general.
  - $$f'(t) = 3at^2 + 2bt + c$$ Derivative of $$f$$. After checking with Mr. Cocoros, I am certain that substituting for $$t$$ will generate the rates of change along the curve defined by $$f$$.
  - When $$t = 0$$:
    - $$f(0) = d$$ which corresponds to $$P_0$$
    - $$f'(0) = c$$ which corresponds to $$R_0$$
  - When $$ t = 1 $$:
    - $$f(1) = a + b + c + d$$ which corresponds to $$P_1$$
    - $$f'(1) = 3a + 2b + c$$ which corresponds to $$R_1$$
  - Now we have 4 unknowns, and 4 equations, you may recall this from math as a _systems of equations_ problem. There are many ways to deal with this, but since we're already in graphics, let's use matrices!

    $$
    \begin{array}{c}
    H \\
    \left[
    \begin{matrix} 0 & 0 & 0 & 1
                  \\\ 1 & 1 & 1 & 1
                  \\\ 0 & 0 & 1 & 0
                  \\\ 3 & 2 & 1 & 0
    \end{matrix}
    \right]
    \end{array}

    \begin{array}{c}
    C \\
    \left[
    \begin{matrix} a
                  \\\ b
                  \\\ c
                  \\\ d
    \end{matrix}
    \right]
    \end{array}

    =

    \begin{array}{c}
     \\
    \left[
    \begin{matrix} d
                  \\\ a + b + c + b
                  \\\ c
                  \\\ 3a + 2b + c
    \end{matrix}
    \right]
    \end{array}

    =

    \begin{array}{c}
    G \\
    \left[
    \begin{matrix} P_0
                  \\\ P_1
                  \\\ R_0
                  \\\ R_1
    \end{matrix}
    \right]
    \end{array}
    $$
  * So multiplying the special Hermite matrix, $$H$$ by the Coeficient matrix $$C$$, reuslts in the Given information $$G$$. Of course, the problem here is that we _DONT KNOW THE COEFICIENTS_. Never fear, divison (or rather, multiplying by the multiplicative inverse), is here!.
  * $$HC = G$$, so $$H^{-1}G = C$$. We just need the inverse of $$H$$, which I just happen to have right here:

    $$
    H^{-1} =
    \begin{bmatrix} 2 & -2 & 1 & 1
                  \\\ -3 & 3 & -2 & -1
                  \\\ 0 & 0 & 1 & 0
                  \\\ 1 & 0 & 0 & 0
    \end{bmatrix}
    $$
  * $$H^{-1}G$$ will give us the coeficients to fill out $$f(t) = ax^3 + bx^2 + cx + d$$, so that we can loop to from 0 to 1 to generate the points along our Hermite curve. _Et viola!_
**Bezier Curves**
- Given information:
  - $$P_0, P_3$$: endpoints
  - $$P_1, P_2$$: "control" points
  - $$P_0, P_1$$ designate where the curve starts and ends. $$P_1, P_2$$ are points that influence the shape of the curve as we move between endpoints.
  - We will use parametric equations to help get from this information to points along a curve.
- In general, in order to create a Bezier curve of degree $$n$$, we need $$n+1$$ points.
- **Bezier Line**
  - <span style="display: flex"> In order to understand higher order Bezier curves, let's start with the simplest, the line. Graphically, a Bezier line can be generated by linerarly moving between the endpoints like so: ![1_bez]({{"/assets/img/n04-bez_1.gif" | relative_url}}) </span>
  - Algebraically, we can write this as: $$L = (1-t)P_0 + tP_1$$
- **Bezier Quadratic**
  - <span style="display: flex"> A quadratic needs one more point than the line. This creates 2 normal lines, that we move along in the standard fashion. This creates a series of endpooints that we can use to create a new line (pictured in green). As we move along each static line, we also move along the dynamic line, which in turn generates the points on our quadratic curve. ![2_bez]({{"/assets/img/n04-bez_2.gif" | relative_url}})</span>
  - Since the quadratic is generated by moving across a line, we could represent it as: $$Q = (1-t)L_0 + tL_1$$
  - But $$L_1, L_0$$ are not points, they're lines. Substituting in the linear equation, we get:

    $$
    \begin{aligned}
    Q &= (1-t)[(1-t)P_0+tP_1] + t[(1-t)P_1+tP_2] \\
    Q &= (1-t)^2P_0 + t(1-t)P_1 + t(1-2)P_1 + t^2P_2 \\
    Q &= (1-t)^2P_0 + 2t(1-t)P_1 + t^2P_2
    \end{aligned}
    $$

- **Bezier Cubic**
  - <span style="display: flex"> Just as a quadratic is made from 2 linear bezier cuves, a cubic is generated by moving along a line whose endpoints would generate 2 quadratic curves. The blue line generates the cubic, and its endpoints march along the green lines, which in turn march along the staic gray lines connecting all the input points. ![3_bez]({{"/assets/img/n04-bez_3.gif" | relative_url}})</span>
  - Since the cubic is generated by moving across a line, we could represent it as: $$C = (1-t)Q_0 + tQ_1$$
  - But $$Q_1, Q_0$$ are not points, they're quadratics. Substituting in the quadratic bezier equations is a bit uglier, though the keen observer may have noticed these equations follow the binomial expansion...

    $$
    \begin{aligned}
    C &= (1-t)[(1-t)^2P_0 + 2t(1-t)P_1 + t^2P_2] + t[(1-t)^2P_1 + 2t(1-t)P_2 + t^2P_3] \\
    C &= (1-t)^3P_0 + 3t(1-t)^2P_1 + 3t^2(1-t)P_2 + t^3P_3
    \end{aligned}
    $$

  - Now we have an equation $$C$$, that will generate points along a cubic Bezier curve, but $$t$$ is spread throughout the equation. With a little more algebra we can get to:

    $$
    C = (-P_0 + 3P_1 - 3P_2 + P_3)t^3 + (3P_0 - 6P_1 + 3P_2)t^2 + (-3P_0 + 3P_1)t + P_0
    $$

  - This is a cubic of the form $$at^3 + bt^2 + ct + d$$, that we can put into a parametric loop, the same way we generated Hermite curves. In fact, if we wanted to, we could use our existing matrix multiplication framework to generate the coeficients based on the given information (this is not a necessary step)

  $$
  \begin{array}{c}
  B \\
  \left[
  \begin{matrix} -1 & 3 & -3 & 1
                \\\ 3 & -6 & 3 & 0
                \\\ -3 & 3 & 0 & 0
                \\\ 1 & 0 & 0 & 0
  \end{matrix}
  \right]
  \end{array}

  \begin{array}{c}
  G \\
  \left[
  \begin{matrix} P_0
                \\\ P_1
                \\\ P_2
                \\\ P_3
  \end{matrix}
  \right]
  \end{array}

  =

  \begin{array}{c}
   \\
  \left[
  \begin{matrix} -P_0 + 3P_1 - 3P_2 + P_3
                \\\ 3P_0 - 6P_1 + 3P_2
                \\\ -3P_0 + 3P_1
                \\\ P_0
  \end{matrix}
  \right]
  \end{array}

  =

  \begin{array}{c}
  C \\
  \left[
  \begin{matrix} a
                \\\ b
                \\\ c
                \\\ d
  \end{matrix}
  \right]
  \end{array}
  $$

##### [Back to top](#)
-----

### 3D Shapes

We will be working with the following 3D shapes:
* Box, Sphere, Torus
* There are many other 3D shapes that could be easily generated programmatic, these specific three allow us to work with and test many advanced features, especially when it comes to lighting & shading. If you want to add more shapes, keep that idea as a feature to be added to your final project.
* For each shape, we want to start by considering 2 important questions:
  1. What given information should we require?
  2. What are the points that our engine will need to generate in order to draw the shape?
  * The goal of our engine will be to create the necessary points from the given information (this is how we created circles & splines as well).

__Box__
* Given Information:
  1. A vertex: for consistency, we will be using the __left-top-front__ vertex.
  2. Width: Size in the __x__ dimension
  3. Height: Size in the __y__ dimension
  3. Depth: Size in the __z__ dimension
* Defining Points:
  * The 8 vertices of the box.
* Once you have the 8 vertices, you can directly add the 12 edges that make up the box. You don't need to do anything fancy here.

__Sphere__
* Given Information:
  1. Center
  2. Radius
* Defining Points:
  * Points on the surface of the sphere.
* Point Generation
  * The points on the surface of a sphere can be generated by taking a circle and rotating it. Each circle rotation creates a new "slice" of the sphere.
  * The circle can be rotated about the x or y axes, but not z. The only difference will be the location of the "poles" of the sphere. An x-rotated sphere will have its poles on the left and right ends, while a y-rotated sphere will have its poles on the top and bottom.

    $$
    \begin{array}{c}
    x rotation \\
    \left[
    \begin{matrix} 1 & 0 & 0
                  \\\ 0 & cos(\phi) & -sin(\phi)
                  \\\ 0 & sin(\phi) & cos(phi)
    \end{matrix}
    \right]
    \end{array}

    \begin{array}{c}
    circle \\
    \left[
    \begin{matrix} rcos(\theta)
                  \\\ rsin(\theta)
                  \\\ 0
    \end{matrix}
    \right]
    \end{array}

    =

    \begin{array}{c}
     sphere \\
    \left[
    \begin{matrix} rcos(\theta)
                  \\\ rsin(\theta)cos(\phi)
                  \\\ rsin(\theta)sin(\phi)
    \end{matrix}
    \right]
    \end{array}
    $$

  * The matrix multiplication above leaves us with equations that we can use to find the points of a sphere:

      $$
      \begin{aligned}
      x &= rcos(\theta) + C_x \\
      y &= rsin(\theta)cos(\phi) + C_y \\
      z &= rsin(\theta)sin(\phi) + C_z
      \end{aligned}
      $$

  * Here $$\phi$$ is used as the angle of rotation and $$\theta$$ is used as the angle of circle creation. If you only use one angle, then you would generate one point per circle each rotation. The resulting shape would be a sprial going along the sphere (pleasing, but not our goal).
    * You can generate a sphere either by creating a full circle and rotating it π radians, or by creating a semi-circle and rotating it 2π radians. For reasons that will become clear later, it is to our advantage to use the semi-circle method.
  * With these equations we can create a nested-loop parametric function to generate all the points on a circle:
    ```
    for rot: 0 -> 1
      for cir: 0 -> 1
        x = r * cos(π * cir) + Cx
        y = r * sin(π * cir) * cos(2π * rot) + Cy
        z = r * sin(π * cir) * sin(2π * rot) + Cz
    ```

__Torus__
* Given Information:
  1. Center
  2. Radius of circular cross-section (r)
  3. Distance for torus center to center of the cross-section (R)
* Defining Points:
  * Points on the surface of the torus.
* A torus (donut, bagel), can be generated in a similar way to a sphere, except you move the circle away from the torus center before rotating.
* Here you have to be careful about how you move the circle and then rotate it. Only specific combinations will work:
  * Move a circle horizontally (x translation) and y rotation.
  * Move a circle vertically (y translation) and x rotation.

    $$
    \begin{array}{c}
     y rotation \\
    \left[
    \begin{matrix} cos(\phi) & 0 & sin(\phi)
                  \\\ 0 & 1 & 0
                  \\\ -sin(\phi) & 0 & cos(phi)
    \end{matrix}
    \right]
    \end{array}

    \begin{array}{c}
    circle \\
    \left[
    \begin{matrix} rcos(\theta) + R
                  \\\ rsin(\theta)
                  \\\ 0
    \end{matrix}
    \right]
    \end{array}

    =

    \begin{array}{c}
     sphere \\
    \left[
    \begin{matrix} cos(\phi)(rcos(\theta) + R)
                  \\\ rsin(\theta)
                  \\\ -rsin(\phi)(rcos(\theta) + R)
    \end{matrix}
    \right]
    \end{array}
    $$

      ```
  * The matrix multiplication above leaves us with equations that we can use to find the points of a torus:

    $$
    \begin{aligned}
    x &= cos(p) * (rcos(t) + R) + C_x \\
    y &= rsin(t) + C_y \\
    z &= -sin(p) * (rcos(t) + R) + C_z
    \end{aligned}
    $$

  - Unlike the sphere, you will draw a complete circle for each rotation.

##### [Back to top](#)
-----

### Using Polygons
Wire-frame Models
* Currently, our basic unit of drawing is a line. When we create a shape, we add edges to an edge matrix, and we loop through that matrix drawing lines.
* A 3D shape rendered using edges only has no real surface to speak of. Instead, it is a [wire-frame model](https://en.wikipedia.org/wiki/Wire-frame_model){:target="_blank"}. Wire-frame models can be rendered quickly, but because they lack true surface, there are limits to how realistic they can look.

Polygon Meshes
* If we change our basic unit of drawing form a line to a polygon, we will have surfaces to work with, generating a [polygon mesh](https://en.wikipedia.org/wiki/Polygon_mesh){:target="_blank"}
* Having a surface gives us more options when rendering 3D objects. Most notably:
  * Polygons can be filled with colors, creating solid objects.
  * We can describe polygons as "facing" a particular direction, and use that information to determine sides of our 3D shapes that are facing away from the viewer and should therefore not be rendered.
* There are many possible shapes we could use as our basic polygons, we will use triangles, as they are the simplest polygon.

Polygon Lists
* Our current shapes are all based on _edge lists_, where every 2 points determine a distinct edge to be drawn.
* We should keep this framework around in order to draw 2 dimensional shapes when desired.
* We need to add _polygon lists_, where every 3 points determine a distinct triangle. Here is a chart comparing the functions in our 2D, edge based, drawing stack and their 3D, polygon based, equivalents.

  | Edge Framework | Polygon Framework |
  | -------------- | ----------------- |
  | `add_point`<br>Add a point to the edge list | `add_point`<br>Add a point to the polygon list |
  | `add_edge`<br>Add the endpoints of a line to the edge list. | `add_polygon`<br>Add the three vertices of a triangle into the polygon list.<br>The vertices must be added in __counter-clockwise__ order\*. |
  | `draw_lines`<br>Go through the edge list 2 points at a time, drawing a line between each pair of points. | `draw_polygons`<br>Go through the polygon list 3 points at a time, connecting the points to draw a triangle.<br>Other polygon features can be added here later. |

* By adding the points in counter-clockwise order, we will be able to eventually determine what is _forwards_ and _backwards_ with respect to the triangle. This will help us implement more advanced features later.

### Polygon Based Shapes
__Box__
* A box has 6 faces, each one made up of 2 triangles.
* Like before, the easiest thing to do here is add your 12 triangles directly into the polygon list.
* The order of the triangles does not matter, but __the order of the points does__. Points should always be added __counter-clockwise__.

__Sphere__
* We generate spheres by drawing a series of rotated semi-circles. If you followed my advice, you should have a separate `generate_sphere` function that returns a matrix of points for the sphere.
* Our job now is to go through that list of points, adding triples of points representing the triangles on the surface of the sphere to our polygon list.
* The best thing to do is physically draw the first two semicircles generated by your code, and write out what triangles are required. Like so:
  ![sphere points]({{"/assets/img/n00-sphere_points.png" | relative_url}})
* When drawing semi-circles, you need to generate the poles, which are created when `t=0` and `t=1`, respectively. This is different from drawing full circles, you don't need to include `t=1` there because the point at `t=1` is identical to the point at `t=0`.
* The way my loops are written, this means when I set steps to 10 I actually get 11 points per semi-circle.
* It is also important to keep track of the direction your semi-circles are drawn in. If you used the example from class (semi-circles rotated about the x-axis), then each new semi-circle is drawn in front of/below the previous one (the video may help demonstrate this).
* Here are some of the triangles taken from this diagram:
  ```
  0: p0, p1, p12
  --------------
  1: p1, p2, p13
  2: p1, p13, p12
  ```
* At the poles, there is only one triangle to add per section, this is triangle 0 above.
* Otherwise, triangles are added in pairs, as is shown by triangles 1 and 2.
  * If `n` is the number of points in a semi-circle, then we can define the triangles for the non-poles as:
    ```
    p, p + 1, (p + n) + 1
    p, (p + n) + 1, p + n
    ```
  * At the poles, we need to make sure not to add both triangles. Following the above formulae, at `p=0`, we would have triangles `0, 1, 12` and `0, 12, 11`. But for the second triangle, `0` and `11` are the same point. This would render as a straight line, which might not seem like a big deal, but having these "degenerate" triangles at the poles will cause problems down the line, so it's best to exclude them now.

__Torus__
* Torus creation is very similar to the sphere, with a couple of changes.
  * Tori must be generated with full circles.
  * No 2 circles of a torus share any common points, which means we don't have _poles_. This actually makes it easier to code since we don't have those special cases.
  * The tori from class are generated by rotating about the y-axis. This means that each new circle is drawn __behind__ the previous one.
* As with the sphere, it is advised that you draw out the first two slices of torus to map out the appropriate triangles.

##### [Back to top](#)
-----

### Backface Culling

#### Vectors
A [vector](https://en.wikipedia.org/wiki/Euclidean_vector){:target="_blank"} is a unit that has both direction and magnitude (size).

Vectors are written like so: `<x, y, z>`
* Notice that vector components are placed inside `<>` to differentiate them from points.

A point only describes a single point in space, whereas a vector describes a relationship between 2 points (often, not always, an arbitrary point and the origin)

You can think of a vector as describing how you would get from point A to point B.
* For example, consider the following two points, `p0: (4, 10, 0)` and `p1: (6, 5, 23)`
* To get from `p0` to `p1`, you would have to move +2 in x, -5 in y and +23 in z, so we would write the vector as: `<2, -5, 23>`
* The vector from `p1` to `p0` moves in the opposite direction, and would be written as `<-2, 5, -23>`

Generally, you can find the vector between 2 points by subtraction.

Notationally, vectors are written with a  $$\rightarrow$$; like so: $$\overrightarrow{A}$$;

#### Backface Culling
At any given viewing angle, you can only see at most half of the 3D shapes we are working with. The back side of a shape is entirely blocked by the front.

If we could reasonably determine which polygons were facing backwards, then we could ignore them entirely, reducing the number of polygons we need to render by half.
* Right now that may not seem like much, but eventually this will save a lot of work. Down the line, to get the most realistic looking images, we will have to perform lighting calculations on a _per pixel_ basis.

Backface culling is the process of removing the backwards facing surfaces from our rendering engine.
In order to do this, we need to define 2 vectors:
1. $$\overrightarrow{N}$$: The surface normal
   * This is a vector perpendicular to the plane of the polygon (or surface), pointing outward.
2. $$\overrightarrow{V}$$: The view vector
   * This is a vector pointing out from the plane of the polygon (or surface) into the "eye" of the observer.
  ![backface culling]({{"/assets/img/n01-backface_culling.png" | relative_url}})
     * (The fireball-looking thing in the picture above is meant to be an eye)

We can tell if a surface is front or back facing based on the value of $$\theta$$, the angle between $$\overrightarrow{N}$$ and $$\overrightarrow{V}$$.
- When $$ -90 < \theta < 90$$, then the surface is visible to the observer. Outside of that range, the surface is pointing away from the observer and is thus a backface.

While it is referred to as backface culling, this process could be more accurately described as frontface including. We don't actually remove the backfaces from our polygon lists (if we rotate the shape, then those faces may no longer be back facing!), rather, we check and only draw the polygons facing forward.

Overview of backface culling
1. Calculate $$\overrightarrow{N}$$;
2. Calculate $$\theta$$;
3. IF $$-90 < \theta < 90 $$, draw the triangle.

__Calculate $$\overrightarrow{N}$$__
* We can find the surface normal by taking the cross product of two vectors along the edges of the polygon provided that they share one endpoint and point in opposite directions.
  ![surface normal]({{"/assets/img/n02-surface_normal.png" | relative_url}})
* In the above diagram, $$\overrightarrow{A}$$ is the vector from P0 to P1 and $$\overrightarrow{B}$$; is the vector from P0 to P2

  $$\begin{aligned}
  \overrightarrow{A} &= P_1 - P_0 = <x_1 - x_0, y_1 - y_0, z_1 - z_0> \\
  \overrightarrow{B} &= P_2 - P_0 = <x_2 - x_0, y_2 - y_0, z_2 - z_0> \\
  \overrightarrow{N} &= \overrightarrow{A} \times \overrightarrow{B} \\
  \overrightarrow{N} &= <a_yb_z - a_zb_y, a_zb_x - a_xb_z, a_xb_y - a_yb_x>
  \end{aligned}
  $$

__Calculate &theta;__
  * Before we figure out $$\theta$$, we need to discuss the _view vector_ ($$\overrightarrow{V}$$)
    * $$\overrightarrow{V}$$ is supposed to be a vector that comes out of the plane of the surface and into the observer. So the question is, what is the relationship between the observer and the surface?
      * For right now, we will assume that the observer is very very very far away from the object. This assumption means that moving left, right, up or down will not have any perceptible effect on what part of the object you are looking at.
      * Think about looking up at the moon, if you move around, you don't start to see a new part of the moon. It looks the same, even if you went from Staten Island up to the Bronx, the moon would look the same.
    * This means that we can ignore any changes along the x or y axes, but what about z?
    * z is the important one, since that determines if you are in front of or behind the object. Remember that z moves in a positive direction out from the screen towards the viewer, so $$\overrightarrow{V}$$, the vector from the object to the viewer, should have a positive z component.
    * For right now $$\overrightarrow{V} = <0, 0, 1>$$
      * We don't care about changes in x and y, so leaving them at 0 is fine.
      * We need a positive z.
      * By giving z the value of 1, the total mangnitude of $$\overrightarrow{V}$$ is 1. This is referred to as a _normalized_ vector. It's not very important right now, but it will be later on, so we might as well start here.
      * We will not be looking at changing $$\overrightarrow{V}$$ for now, but you can think about what that would mean for the rendered image and what effects that might lead to.
  * Now that we know both $$\overrightarrow{N}$$ and $$\overrightarrow{V}$$, there's a little bit of vector math we can use to our advantage.
    * Dot product to the rescue: $$\overrightarrow{N} \cdot \overrightarrow{V} = Mcos\theta$$
      * The _[dot product](https://www.mathsisfun.com/algebra/vectors-dot-product.html){:target="_blank"}_ of  $$\overrightarrow{N}$$ and $$\overrightarrow{V}$$ is a _scalar_ (not a vector) value equal to the cosine of the angle between them times the product of each vector's magnitude ($$M$$). You can calculate the dot product like so:
        * $$\overrightarrow{N} \cdot \overrightarrow{V} = Mcos\theta = n_xv_x + n_yv_y + n_zv_z$$
      * If we think about the properties of $$cos\theta$$, this is incredibly useful.
      * $$cos\theta > 0$$ when $$-90 < \theta < 90$$
        * This is exactly what we want.
      * Turns out, we only care about whether or not the dot product is positive or negative. If it's positive, then the triangle is front facing, and we should draw it, if it's negative, we pass. And since mangnitude is always positive, we don't actually need to worry about it for this calculation.
        * (later on, when we get to lighting, we will care about mangnitude, but that's a problem for future us, who will be smarter than present us)

__Putting it all together__
* Given any triangle starting at P0:
  * Calculate $$\overrightarrow{N} = \overrightarrow{A} \times \overrightarrow{B}$$, where $$\overrightarrow{A} = P_1 - P_0$$, and $$\overrightarrow{B} = P_2 - P_0$$.
  * Calculate $$\overrightarrow{N} \cdot \overrightarrow{V}$$, where $$\overrightarrow{V} = <0, 0, 1>$$
  * If $$\overrightarrow{N} \cdot \overrightarrow{V} > 0$$, draw the triangle.
    * The keen observer will note that since $$\overrightarrow{V} = <0, 0, 1>$$, the x and y components of the dot product will be 0. Also, since the z component of $$\overrightarrow{V}$$ is 1, the dot product will simply be the z component of $$\overrightarrow{N}$$.
    * This is ok for now, but eventually we will actually need the value of the dot product, so it doesn't hurt to do that now anyway.

##### [Back to top](#)
-----

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