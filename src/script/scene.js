//Refrence code, not all my work!
////////////////////////////Variables/////////////////////////////

const canvas = document.getElementById("myCanvas");
let gl;
let shaderProgram;
let vertexPositionBuffer;
let vertexIndexBuffer; 

let light_vector = [1.0,1,1,1];  //use parallel light
var mat_ambient = [0.3, 0, 0, 1]; 
var mat_diffuse= [1, 0, 0, 1]; 
var mat_specular = [.9, .9, .9,1]; 
var mat_shine = [50]; 
let light_color = [1,1,1,1];

var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create();  // model matrix
var mvMatrix = mat4.create();  // modelview matrix
var pMatrix = mat4.create();  //projection matrix 
var nMatrix = mat4.create();  // normal matrix
let horizontal = 0.0;
let vertical = 0.0;
let yaw = 0.0;

function webGLStart() {
    initGL(canvas);
    initShaders();

    gl.enable(gl.DEPTH_TEST); 

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");	

    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

    shaderProgram.light_vectorUniform = gl.getUniformLocation(shaderProgram, "light_vector");
    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
    shaderProgram.light_colorUniform = gl.getUniformLocation(shaderProgram, "light_color");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    document.addEventListener('keydown', onDocumentKeyDown, false);

    drawScene();
}

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


/////////////////////////////////////////////////////

function drawScene() {
    let vi; //vector containing geometric information
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(mMatrix);	
    mat4.identity(vMatrix);

    // set up the projection matrix
    // mat4.perspective(60, 1.0, 0.1, 20, pMatrix);  
    mat4.perspective(pMatrix, glMatrix.toRadian(60), 1.0, 0.1, 20); // changed to glMatrix version 2
    // fovy, aspect, near, far
    // Try changing the parameters to see the effects
    // Task: Change from mat4.perspective to mat4.frustum to have the same effect
    // Hint: calculate the left, right, bottom, top from the fovy, aspect, near, far
    // mat4.frustum(pMatrix, left, right, bottom, top, near, far);
    // Extra Task: Setup this matrix from scratch

    // modify vMatrix
    vMatrix = mat4.translate(vMatrix,vMatrix,[0,0,-9]);
    vMatrix = mat4.rotate(vMatrix,vMatrix,-vertical,[1,0,0]);
    vMatrix = mat4.rotate(vMatrix,vMatrix,-horizontal,[0,1,0]);
    vMatrix = mat4.rotate(vMatrix,vMatrix,-yaw,[0,0,1]);
    // Task: Try to translate this code to mat4.lookAt
    
    // drawing Scene

    // Yellow cylinder
    // Yes, I'm being boring and using almost the same material for all objects.
    mat_ambient = [0.8, 0.8, 0, 1]; 
    mat_diffuse= [111/255, 121/255, 124/255, 1]; 
    mat_specular = [1, 1, 1,1]; 
    mat_shine = [75]; 

    vi = generateCylinder(0.5,0.5,1);
    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[-2,-0.5,0]);
    drawBuffer(vi[0],vi[1],vi[2]);

    // Lime cube
    mat_ambient = [0.5, 0.9, 0.5, 1]; 
    //mat_diffuse= [0.15, 0.15, 0.15, 1]; 
    //mat_specular = [1, 1, 1,1]; 
    //mat_shine = [5]; 

    vi = generateCube(1);
    mat4.identity(mMatrix);	
    mMatrix = mat4.translate(mMatrix,mMatrix,[2,0,0]);
    //mMatrix = mat4.scale(mMatrix,mMatrix,[5.3/0.2,1,1]);
    drawBuffer(vi[0],vi[1],vi[2]);
    
    // cyan sphere
    mat_ambient = [0, 0.5, 0.5, 1]; 

    vi = generateSphere(0.5);
    mat4.identity(mMatrix);
    drawBuffer(vi[0],vi[1],vi[2]);
}
//////////// Camera Controls ////////////////////////
// Start AI code
function onDocumentKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
            vertical -= 0.05; // Pitch up
            break;
        case 'ArrowDown':
            vertical += 0.05; // Pitch down
            break;
        case 'ArrowLeft':
            horizontal -= 0.05; // Roll left
            break;
        case 'ArrowRight':
            horizontal += 0.05; // Roll right
            break;
        case 'BracketLeft':
            yaw -= 0.05; // Yaw left
            break;
        case 'BracketRight':
            yaw += 0.05; // Yaw right
            break;
    }
    drawScene();
}
///////////////////////////Helper functions////////////////////////////////////////

function generateSphere(radius, nSlice=20,nStack=20){
    // set up transform matrix before calling this function
    let v = [];
    let index = [];
    let n = [];
    let aStep=2*Math.PI/nSlice;
    let bStep=Math.PI/(nStack+1);
    let a;
    let b;

    //input vertices
    for (let i = 0;i<nSlice;i++){
        a = i*aStep;
        for (let j = 0;j<nStack;j++){
            b = (j+1)*bStep-Math.PI/2;
            v.push(radius*Math.cos(a)*Math.cos(b));
            v.push(radius*Math.sin(b));
            v.push(radius*Math.sin(a)*Math.cos(b));

            n.push(Math.cos(a)*Math.cos(b));
            n.push(Math.sin(b));
            n.push(Math.sin(a)*Math.cos(b));
        }
    }

    v.push(0);v.push(radius);v.push(0);
    v.push(0);v.push(-radius);v.push(0);
    n.push(0);n.push(1);n.push(0);
    n.push(0);n.push(-1);n.push(0);
    let topI = nSlice*nStack;
    let bottomI = topI+1;

    //input index
    for (let i = 0;i<nSlice;i++){
        let start = i*nStack;
        let next = (i+1)%nSlice*nStack;
        index.push(bottomI);index.push(start);index.push(next);
        index.push(start+nStack-1);index.push(topI);index.push(next+nStack-1);
        for(let j =0;j<nStack-1;j++){
            index.push(start+j);index.push(next+j);index.push(next+j+1);
            index.push(start+j);index.push(start+j+1);index.push(next+j+1);
        }
    }

    return (initBuffer(v,index,n));
    
}

function generateCube(size){
    // set up transform matrix before calling this function
    let v = [];
    let index = [];
    let n = [];
    let ccc = size/2;

    // input vertices
    v.push(ccc);v.push(ccc);v.push(ccc);
    v.push(ccc);v.push(-ccc);v.push(ccc);
    v.push(-ccc);v.push(ccc);v.push(ccc);
    v.push(-ccc);v.push(-ccc);v.push(ccc);
    v.push(-ccc);v.push(ccc);v.push(-ccc);
    v.push(-ccc);v.push(-ccc);v.push(-ccc);
    v.push(ccc);v.push(ccc);v.push(-ccc);
    v.push(ccc);v.push(-ccc);v.push(-ccc);

    // input normal
    n.push(ccc);n.push(ccc);n.push(ccc);
    n.push(ccc);n.push(-ccc);n.push(ccc);
    n.push(-ccc);n.push(ccc);n.push(ccc);
    n.push(-ccc);n.push(-ccc);n.push(ccc);
    n.push(-ccc);n.push(ccc);n.push(-ccc);
    n.push(-ccc);n.push(-ccc);n.push(-ccc);
    n.push(ccc);n.push(ccc);n.push(-ccc);
    n.push(ccc);n.push(-ccc);n.push(-ccc);


    // input index
    index.push(0);index.push(1);index.push(2);
    index.push(1);index.push(2);index.push(3);
    index.push(2);index.push(3);index.push(4);
    index.push(3);index.push(4);index.push(5);
    index.push(4);index.push(5);index.push(6);
    index.push(5);index.push(6);index.push(7);
    index.push(6);index.push(7);index.push(0);
    index.push(7);index.push(0);index.push(1);
    index.push(0);index.push(2);index.push(4);
    index.push(0);index.push(4);index.push(6);
    index.push(1);index.push(3);index.push(5);
    index.push(1);index.push(5);index.push(7);

    return (initBuffer(v,index,n));
}

function generateCylinder(tRadius,bRadius,height, nSlice=20,nStack=20){
    // set up transform matrix before calling this function
    let v = [];
    let index = [];
    let n = [];
    let aStep=2*Math.PI/nSlice;
    let hStep=height/(nStack+1);
    let rStep = (tRadius-bRadius)/(nStack+1);

    //input vertices
    for (let i = 0;i<nSlice;i++){
        let a = i*aStep;
        for (let j = 0;j<nStack+2;j++){
            let h = hStep * j;
            let delR = rStep *j;
            v.push((bRadius+delR)*Math.cos(a));
            v.push(h);
            v.push((bRadius+delR)*Math.sin(a));

            n.push(Math.cos(a));
            n.push((tRadius-bRadius)/height);
            n.push(Math.sin(a));
        }
    }

    //input index
    for (let i = 0;i<nSlice;i++){
        let start = i*(nStack+2);
        let next = (i+1)%nSlice*(nStack+2);
        index.push(0);index.push(start);index.push(next);
        index.push(nStack+1);index.push(start+nStack+1);index.push(next+nStack+1);
        for(let j =0;j<nStack+1;j++){
            index.push(start+j);index.push(next+j);index.push(next+j+1);
            index.push(start+j);index.push(start+j+1);index.push(next+j+1);
        }
    }

    return (initBuffer(v,index,n));
}

function initBuffer(v,index,n){
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numItems = v.length;

    vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(n), gl.STATIC_DRAW);
    vertexNormalBuffer.itemSize = 3;
    vertexNormalBuffer.numItems = n.length;  

    vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer); 	
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);  
    vertexIndexBuffer.itemsize = 3;
    vertexIndexBuffer.numItems = index.length; 

    return ([vertexPositionBuffer,vertexIndexBuffer,vertexNormalBuffer]);
}

function drawBuffer(v,index,n){
    mat4.multiply(mvMatrix, vMatrix,mMatrix);  // mvMatrix = vMatrix * mMatrix and is the modelview Matrix 
    mat4.multiply(nMatrix, vMatrix,mMatrix);
	nMatrix = mat4.invert(nMatrix, nMatrix);
    nMatrix = mat4.transpose(nMatrix, nMatrix);


    gl.uniform4f(shaderProgram.light_vectorUniform,light_vector[0], light_vector[1], light_vector[2],1.0); 
    gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
    gl.uniform4f(shaderProgram.light_colorUniform, light_color[0], light_color[1], light_color[2], 1.0); 
    gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);	
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);


    gl.bindBuffer(gl.ARRAY_BUFFER, v);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, n);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); 
    gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}