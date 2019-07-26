//CONSTANTS
const bgColor = [0.38, 0.75, 0.95];
const X_VOXELS = 60;
const Y_VOXELS = 25;
const Z_VOXELS = 60;
const NUM_VOXELS = X_VOXELS*Y_VOXELS*Z_VOXELS;

const GLOBAL_UP = [0,1,0];
const CAMERA_LOOKAT = [X_VOXELS/2,Y_VOXELS/2,Z_VOXELS/2];
const FIELD_OF_VIEW = .5;
const NEAR_CLIP = .001;
const FAR_CLIP = 1000;
const MOVE_RATE = 0.008;
const Y_CLAMP = 0.1;

var runTest = function() {
    
  console.log("runTest");
    
  const canvas = document.querySelector("#glCanvas");

  var time = 0.0;
  var fps = 0;
  var fpstime = 0.0;
  var start = 0.0;
  var startCamPos = [X_VOXELS, 2*Y_VOXELS, Z_VOXELS];
  var isRotating = 1;

  var prevX;
  var prevY;
  var dX;
  var dY;
  var xAngle = 0;
  var yAngle = 0;
  var mouseIsDown = false;
  var currentZoom = X_VOXELS*1.5;
                        

  //event listener 
  
  document.addEventListener('keydown', function(event) { //use for key events 
    if(event.keyCode == 32) {
      event.preventDefault(); //so page doesnt scroll
      isRotating = Math.abs(isRotating - 1); //if its 0 become 1, if 1 become 0

    }
    if( event.keyCode == 82 || event.keyCode == 69) { //'r', space, or 'e'

      isRotating = Math.abs(isRotating - 1); //if its 0 become 1, if 1 become 0
      //console.log("keydown e");

    }
  });


  canvas.addEventListener('wheel', function(event) {
    event.preventDefault();//so page doesnt scroll
    currentZoom += event.deltaY/5; //5 arbitrary
    //console.log(currentZoom);
  });

  canvas.addEventListener('mousedown', function(event) {
    isRotating = 0;
    mouseIsDown = true;
    prevX = event.clientX;
    prevY = event.clientY;
    //console.log(mouseIsDown);
  });
  canvas.addEventListener('mouseup', function(event) {
    mouseIsDown = false;
    prevX = 0;
    prevY = event.clientY;
    //console.log(mouseIsDown);
  });
  canvas.addEventListener('mousemove', function(event) {
    if( mouseIsDown) {
      dX = event.clientX - prevX;
      dY = event.clientY - prevY;

      xAngle += dX;
      yAngle = Math.max(-Math.PI/(MOVE_RATE*2)+Y_CLAMP, Math.min(yAngle+dY, Math.PI/(MOVE_RATE*2)-Y_CLAMP)); //clamps y to prevent flipping
      prevX = event.clientX;
      prevY = event.clientY;   
      //console.log(xAngle +", " + yAngle);   
    } 
  });

  
  



  //SHADER SETUP
  var vertShaderText = document.getElementById("2d-vertex-shader").text;
  var fragShaderText = document.getElementById("raymarch-frag-shader").text;

  // Initialize the GL context
  const gl = canvas.getContext("webgl2");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }


  // Set clear color to blue, fully opaque
  gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);
  


  //SHADER AND PROGRAM SETUP
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertShaderText);
  gl.shaderSource(fragmentShader, fragShaderText);

  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("ERROR compiling vertex shader", gl.getShaderInfoLog(vertexShader));
    return
  }

  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("ERROR compiling fragment shader", gl.getShaderInfoLog(fragmentShader));
    return
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("ERROR linking program", gl.getProgramInfoLog(shaderProgram));
    return
  }


  //DATA BUFFERS 
  var twoTriVerts = new Float32Array(
      //coords          
    [ -1.0, -1.0,
      1.0, -1.0,
     -1.0,  1.0,
     -1.0,  1.0,
      1.0, -1.0,
      1.0,  1.0
    ]); 

  //translating canvas pixel dimensions to [-1,1] format
  var max = Math.max(canvas.width, canvas.height);
  var xdivmax = canvas.width/max; //Coordinates range from [-1,1].
  var ydivmax = canvas.height/max;


  //BUFFERS
  var bufferVerts = gl.createBuffer();
  //set vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferVerts);
  gl.bufferData(gl.ARRAY_BUFFER, twoTriVerts, gl.STATIC_DRAW); //static = cant change once passed
  gl.bindBuffer(gl.ARRAY_BUFFER, null); //unbind
  
  //choose program
  gl.useProgram(shaderProgram);

  //set shader attributes and uniforms
  var positionAttribLocation = gl.getAttribLocation(shaderProgram, 'a_position');
  gl.enableVertexAttribArray(positionAttribLocation); //enables attribute for use

  var screenRatioLocation = gl.getUniformLocation(shaderProgram, "screenRatio");
  gl.uniform2f(screenRatioLocation, xdivmax, ydivmax);

  var timeLocation = gl.getUniformLocation(shaderProgram, "time");  
  gl.uniform1f(timeLocation, time);

  var resolutionUnifLocation = gl.getUniformLocation(shaderProgram, 'resolution');
  gl.uniform2f(resolutionUnifLocation, canvas.width, canvas.height); //resolution

  //camera uniforms
  var camPosUnifLocation = gl.getUniformLocation(shaderProgram, 'cameraPos');
  gl.uniform3f(camPosUnifLocation, startCamPos[0], startCamPos[1], startCamPos[2]); //

  //camera constant uniforms
  var globalUpUnifLocation = gl.getUniformLocation(shaderProgram, 'globalUp');
  gl.uniform3f(globalUpUnifLocation, GLOBAL_UP[0], GLOBAL_UP[1], GLOBAL_UP[0]); //

  var camLookAtUnifLocation = gl.getUniformLocation(shaderProgram, 'camLookAt');
  gl.uniform3f(camLookAtUnifLocation, CAMERA_LOOKAT[0], CAMERA_LOOKAT[1], CAMERA_LOOKAT[2]); //

  //var isRotatingUnifLocation = gl.getUniformLocation(shaderProgram, 'isRotating');
  //gl.uniform1i(isRotatingUnifLocation, isRotating); //0 == false, 1 == true

  //var zoomScaleUnifLocation = gl.getUniformLocation(shaderProgram, 'zoomScale');
  //gl.uniform1f(zoomScaleUnifLocation, currentZoom);

 // var mouseRotateUnifLocation = gl.getUniformLocation(shaderProgram, 'mouseRotate');
 // gl.uniform2f(mouseRotateUnifLocation, xAngle, yAngle, zAngle);
  
  var fovUnifLocation = gl.getUniformLocation(shaderProgram, 'FOV');
  gl.uniform1f(fovUnifLocation, FIELD_OF_VIEW); //

 // var nearClipUnifLocation = gl.getUniformLocation(shaderProgram, 'nearClip');
  //gl.uniform1f(nearClipUnifLocation, NEAR_CLIP); //

  //var farClipUnifLocation = gl.getUniformLocation(shaderProgram, 'farClip');
  //gl.uniform1f(farClipUnifLocation, FAR_CLIP); //
  
  //texture location
  var textureUnifLocation = gl.getUniformLocation(shaderProgram, "u_texture");
  gl.uniform1i(textureUnifLocation, 0);


  //set attribute data for vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferVerts);//bind

  gl.vertexAttribPointer(
    positionAttribLocation, //attrib loaction
    2, //num elements per attrib
    gl.FLOAT,//element type
    gl.FALSE, //??
    2*Float32Array.BYTES_PER_ELEMENT,//bytes until next vertex
    0//ofset from beginning of data
  )

  gl.bindBuffer(gl.ARRAY_BUFFER, null); //unbind



  //TEXTURE_3D
  //tutorials: https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/texture_3d.html
  // https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html 
  voxelData = new Uint8Array(NUM_VOXELS);
  updateTexture(voxelData, 0);

  voxelTexture = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0); //which texture
  gl.bindTexture(gl.TEXTURE_3D, voxelTexture);
 // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
  // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 0);

  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); //tells it to be unfiltered hopefully
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  

  const target = gl.TEXTURE_3D;      // target
  const level = 0;                   // level 
  const internalFormat = gl.R8;      // internalformat 
  const border = 0;
  const format = gl.RED;
  const type =    gl.UNSIGNED_BYTE;   // type
 // gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage3D(target, level, internalFormat, X_VOXELS, Y_VOXELS, Z_VOXELS, border, format, type, voxelData);



  //framerate counter
  document.getElementById('info').innerHTML = "<i>Frame Rate</i>: ...";
  start = Date.now();
  
  var count = 0;
  var xzRadius;
  //main render loop
  var loop = function() {
    count++;
    var elapsedtime = (Date.now() - start)/1000.0;

    var framespeed = 1.0;
    time += framespeed*elapsedtime;
    
    if(isRotating) {
      camPos = [CAMERA_LOOKAT[0]+currentZoom*Math.sin(time*0.75), currentZoom*0.8, CAMERA_LOOKAT[2]+currentZoom*Math.cos(time*0.75)];
    }
    else{
      xzRadius = currentZoom*Math.cos(yAngle*MOVE_RATE);
      camPos = [CAMERA_LOOKAT[0]+Math.sin(xAngle*MOVE_RATE)*xzRadius, CAMERA_LOOKAT[1]+Math.sin(yAngle*MOVE_RATE)*currentZoom, CAMERA_LOOKAT[2]+Math.cos(xAngle*MOVE_RATE)*xzRadius]; //arcball camera
    }

    //gl.uniform1i(isRotatingUnifLocation, isRotating);
    //gl.uniform1f(zoomScaleUnifLocation, currentZoom);
    //gl.uniform2f(mouseRotateUnifLocation, xAngle/100, yAngle/100); //fix so pass in camPos instead
    
    gl.uniform1f(timeLocation, time);
    gl.uniform3f(camPosUnifLocation, camPos[0], camPos[1], camPos[2]); //update camera


    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //update voxel info in texture
    updateTexture(voxelData, time);
    //gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); //tells it to read 1 byte at a time? try in case of "too much data" error
    gl.texImage3D(target, level, internalFormat, X_VOXELS, Y_VOXELS, Z_VOXELS, border, format, type, voxelData);

    gl.drawArrays(gl.TRIANGLES, 0, 6); //for arrays w/o indeces
    
    elapsedtime = (Date.now() - start)/1000.0;
    fps++;
    fpstime += elapsedtime;
    if(fpstime>=1.0){

        fpstime -= Math.floor(fpstime);
        document.getElementById('info').innerHTML = "<i>Frame Rate</i>: " + fps + " fps";
        fps = 0;
    }

    start = Date.now();
    requestAnimationFrame(loop);
  };

  
  //gl.drawArrays(gl.TRIANGLES, 0, 6); //draw 2 triangles
  requestAnimationFrame(loop);
}

function updateTexture(voxelArray, modNum) {
  /** for (let index = 0; index < numVoxels; index++) { 
    if(true) {
      //voxelArray[index] = 200;
      voxelArray.set([4*index],index);
    } else{
      //voxelArray[index] = 0;
      voxelArray.set([0],index);


    }
  }
  */
  //t = 80*CR_VOXELS/2*Math.abs(Math.sin(modNum/60))+CR_VOXELS/2; 
  //t = modNum%(2*Math.PI);
  for (var k = 0; k < Z_VOXELS; ++k) {
    for (var j = 0; j < Y_VOXELS; ++j) {
        for (var i = 0; i < X_VOXELS; ++i) {
          //if ((k-CR_VOXELS/2)*(k-CR_VOXELS/2) + (j-CR_VOXELS/2)*(j-CR_VOXELS/2) + (i-CR_VOXELS/2)*(i-CR_VOXELS/2) < t ) { //sphere
          
          //(j < 24) { 
            if (j > 7) {
            // if(j/(CR_VOXELS/12)-4 < Math.sin(3*modNum+3.1*Math.PI*(i-CR_VOXELS/2)/CR_VOXELS)*Math.sin(2*modNum+1.3*Math.PI*(k-CR_VOXELS/2)/CR_VOXELS)){ //wave surface (colors)
              //wave magnitude * j - (guarunteed height) - (random zone height * random) < sin(inverse x wavelength - speed)
              if(0.22*j - 2.8   < Math.sin(0.11*i-3.2*modNum)*Math.sin(0.06*k-4*modNum) + (.2*Math.sin(0.01*i*(j+k)))){ //wave surface with randomness, 
                voxelArray.set([255],i + j * X_VOXELS + k * X_VOXELS * Y_VOXELS);//yes no, colors in frag shader
                //voxelArray.set([15*(j+.01)+15*(k+.01)+15*(i+.01)],i + j * CR_VOXELS + k * CR_VOXELS * CR_VOXELS); //blue waves
                //voxelArray.set([30*(j+.01)+30*(k+.01)+30*(i+.01)],i + j * CR_VOXELS + k * CR_VOXELS * CR_VOXELS);

              }
              else{
                voxelArray.set([0],i + j * X_VOXELS + k * X_VOXELS * Y_VOXELS);
              }
             }
            else{
              voxelArray.set([255],i + j * X_VOXELS + k * X_VOXELS * Y_VOXELS);
            }/**
          }
          else{
            voxelArray.set([0],i + j * X_VOXELS + k * X_VOXELS * Y_VOXELS);
          }
          */

        }
    }
  } 
}

