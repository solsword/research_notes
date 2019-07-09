 <script id="raymarch-frag-shader" type="x-shader/x-fragment">#version 300 es
            precision mediump float;
            precision mediump sampler3D;
            #define NUM_VOXELS 50000 
            #define X_VOXELS (50.)
            #define Y_VOXELS (20.)
            #define Z_VOXELS (50.)  // float 
        
            uniform vec2 resolution;
            uniform vec3 globalUp;            
            uniform vec3 cameraPos;
            uniform vec3 camLookAt;
            uniform float FOV;
            //uniform float nearClip;
            //uniform float farClip;

            uniform float time;
                   
            uniform sampler3D u_texture;

            out vec4 outputColor;
        
        
            
            //ray-cube intersection bounding box: adapted from source http://ray-tracing-conept.blogspot.com/2015/01/ray-box-intersection-and-normal.html
            
            float intersectCube(vec3 rayStart, vec3 normalizedRayDirection, float rayLength, vec3 b1, vec3 b2){
            //float intersectCube(vec3 normalizedRayDirection, float rayLength, vec3 rayStart){
                vec3 rayDirection = normalizedRayDirection * rayLength;
                float t1;
                float t2;
                float tnear = -1.; //arbitrary negative number?
                float tfar = 1.1; //because distances can't (I think) exceed 1
                float temp;
                float tCube;
                bool intersectFlag = true;
                for(int i =0 ;i < 3; i++){ //x, y, z
                    if(rayDirection[i] == 0.){ //cant divide by zero
                        if(rayStart[i] < b1[i] || rayStart[i] > b2[i]) {
                            intersectFlag = false;
                        }
                    }
                    else{ //closer % of line traveled in one dimension = closer, *not* actual distance in 1 dimension because that's not representative of *ray* distance
                        t1 = (b1[i] - rayStart[i])/rayDirection[i]; //find where line intersects (near)plane of axis (in terms of % of legnth traveled in 1 dimension)
                        t2 = (b2[i] - rayStart[i])/rayDirection[i]; //find where line intersects (far)plane of axis
                        if(t1 > t2){ //swap t1 and t2 so t1 is smaller
                            temp = t1;
                            t1 = t2;
                            t2 = temp;
                        }
                        if(t1 > tnear) {tnear = t1; } //find largest tnear
                        if(t2 < tfar) {tfar = t2; } //find smallest tfar
                        if(tnear > tfar) { intersectFlag = false; } //line doesn't intersect if furthest "near" is further than closest "far"
                        if(tfar < 0.) { intersectFlag = false; } //BB is before origin
                    }
                }
                if(intersectFlag == false) {
                    tCube = -1.;
                }
                else {
                    tCube =  tnear * rayLength;
                }
                
                return tCube;
            }
        
            //voxel defined by point in bottom corner such that the voxel at (0,0,0) goes up to not including (1,0,0) (0,1,0) (0,0,1) etc.
            //tutorials https://www.scratchapixel.com/lessons/advanced-rendering/introduction-acceleration-structure/grid
            //tutorials http://castingrays.blogspot.com/2014/01/voxel-rendering-using-discrete-ray.html
            
            vec4 ddaMarching (vec3 origin, vec3 dir) { //took out start, end
                //setup: calculate direction, [ray length to get from 0->1 for each axis]
                vec3 signs = sign(dir);
                vec3 tDelta = abs(vec3(1./dir.x, 1./dir.y, 1./dir.z)); //scratchapixel for explanation
                vec3 voxelCoords = vec3(floor(origin.xyz)); //what voxel we start in
                vec3 startOffset = vec3(origin - voxelCoords);
                vec3 isPos = vec3(0.5*signs + 0.5); //1 = pos, 0 = neg
                vec3 distToNext = abs(vec3( ((isPos.x) - startOffset.x)/dir.x,  //handles pos and neg
                                            ((isPos.y) - startOffset.y)/dir.y, 
                                            ((isPos.z) - startOffset.z)/dir.z));       
        
                //because of bounding box, assume camera is never *in* voxel. so, check starting voxel for hit before looping
                vec4 currentVoxel = texelFetch(u_texture, ivec3(voxelCoords.x, voxelCoords.y, voxelCoords.z),0);
                 if (currentVoxel.r > 0.) {
                    return vec4(voxelCoords, currentVoxel.r);
                 }
                //int currentVoxel = int(voxelCoords.x + voxelCoords.z * CR_VOXELS + voxelCoords.y * CR_VOXELS * CR_VOXELS); //x,z,y, order for now cause it works in my head

        
        
                while (true) {  
                    if(distToNext.x < min(distToNext.y, distToNext.z)){
                        distToNext.x += tDelta.x; //distToNext = TOTAL distance from origin
                        voxelCoords.x += signs.x;
                    }
                    else if(distToNext.y < distToNext.z){ //double check this
                        distToNext.y += tDelta.y;
                        voxelCoords.y += signs.y;
                    }
                    else {
                        distToNext.z += tDelta.z;
                        voxelCoords.z += signs.z;
                    }
                    if (   voxelCoords.x >= X_VOXELS || voxelCoords.x < 0. 
                        || voxelCoords.y >= Y_VOXELS || voxelCoords.y < 0. 
                        || voxelCoords.z >= Z_VOXELS || voxelCoords.z < 0.) { 
                        break;
                    }
        
                    currentVoxel = texelFetch(u_texture, ivec3(voxelCoords.x, voxelCoords.y, voxelCoords.z),0);
                    if (currentVoxel.r > 0.) {
                        return vec4(voxelCoords, currentVoxel.r);
                    }

                }
                //else
                return vec4(0.0, 0.0, 0.0, 0.0);
            }
        
            void main() {
        
                //setup screen coords
                //converts from pixels from bottom left to centered at (0,0) from [-1,1]
                vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
                vec2 screenCoords = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*aspect;
        
        
                
                //setup camera

        
                vec3 camPos = cameraPos; //calculated in cpu

                //basically define up, forward, right in relation to camera; camera-relative coords
                vec3 forward = normalize(camLookAt-camPos);
                vec3 right = normalize(cross(globalUp, forward));
                vec3 up = normalize(cross(forward,right));
        
                //ray origin/direction
                vec3 rayOrigin = camPos; //originally 'ro'
                vec3 rayDirection =  normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up); //originally 'rd', fairly standard (not minus camPos cause forward already did that)
        
        
                //optional background shading? i wonder if its hard to do basic distance "fog"
                vec3 bgColor = vec3(0.38, 0.75, 0.95);
        
        
                float intersectDist = intersectCube(rayOrigin, rayDirection, 500., vec3(0.001, 0.001, 0.001), vec3(X_VOXELS-.001, Y_VOXELS-.001, Z_VOXELS-.001));     
                //float intersectDist = intersectCube(rayDirection, 50., rayOrigin);     
                vec3 intersectPoint = rayOrigin + (rayDirection * intersectDist);
        
                if (intersectDist <= -1.) {
                    //outputColor = vec4(bgColor, 1.0);
                    outputColor = vec4(1.,0.95, 0.65, 1.0);
                    //outputColor = vec4(0.,0.,0., 1.0);
                    return;
                }
        
                vec4 hitVoxel = ddaMarching(intersectPoint, rayDirection); 
                //if past clip planes, return bg color
                if ( hitVoxel.a != 0. ) {
                   // outputColor = vec4(.05*hitVoxel.y*(1.-(60./distance(hitVoxel.xyz, camPos))), (hitVoxel.y/40.)+0.15*fract(abs(sin(rayDirection.y*intersectDist*1000.)*cos(1234.*rayDirection.z*time)*2.)), hitVoxel.y/23., 1+ //1. - (12./distance(hitVoxel.xyz, camPos))); //random wave surface (CR_VOXELS = 40)

                    outputColor = vec4(.05*hitVoxel.y*(1.-(60./distance(hitVoxel.xyz, camPos))), (0.8+sin(4.*time)/5.)*(hitVoxel.y/28.), hitVoxel.y/23.,   1. - ((hitVoxel.y-14.)/8.));// + 10.*(hitVoxel.y)); //(12./distance(hitVoxel.xyz, camPos))); //random wave surface (CR_VOXELS = 40)
                    //outputColor = vec4(hitVoxel.r, 0., 0., 1.);
                    return;        
                }
               
        
                else {
                    //outputColor = vec4(bgColor, 1.0);
                     outputColor = vec4(1.,0.95, 0.65, 1.);
                   // outputColor = vec4(0.,0.,1., 1.0);
        
                    //outputColor = vec4(normalize(intersectPoint), 1.0);  
                    //outputColor = vec4(0.15, 0.15, 0.15, 1.);
                    
                    
                }
            }
        </script>