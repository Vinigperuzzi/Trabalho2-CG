let fragmentShaderSource = 
`#version 300 es
precision highp float;
void mainImage(out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y; //Normalizar
    vec3 col = vec3(0);//tela escura
    
    vec3 ro = vec3(0, 1, 0);					//Posição da câmera
    vec3 rd = normalize(vec3(uv.x, uv.y, 1));	//Vista da câmera
    
    fragColor = vec4(col,1.0);//saida da cor
    
}
`;