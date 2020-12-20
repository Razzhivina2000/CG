#version 330 core
out vec4 color;

in vec3 FragPos;
in vec3 Normal;
  
uniform vec3 lightPos;
uniform vec3 viewPos;
uniform vec3 objectColor;

float CookTorrance(vec3 _normal, vec3 _light, vec3 _view, float roughness_val) {
    if (roughness_val <= 0.0) return 0.0;
    vec3  half_vec = normalize( _view + _light );
    // найдем разнообразные скалярные произведения :)
       float NdotL    = max( dot( _normal, _light ), 0.0 );
       float NdotV    = max( dot( _normal, _view ), 0.0 );
       float NdotH    = max( dot( _normal, half_vec ), 1.0e-7 );
       float VdotH    = max( dot( _view,   half_vec ), 0.0 );
    // NdotH не может быть равным нулю, так как в последствии на него надо будет делить

    // вычислим геометрическую составляющую
       float geometric = 2.0 * NdotH / VdotH;
             geometric = min( 1.0, geometric * min(NdotV, NdotL) );

    // вычислим компонент шероховатости поверхности
       float r_sq          = roughness_val * roughness_val;
       float NdotH_sq      = NdotH * NdotH;
       float NdotH_sq_r    = 1.0 / (NdotH_sq * r_sq);
       float roughness_exp = (NdotH_sq - 1.0) * ( NdotH_sq_r );
       float roughness     = exp(roughness_exp) * NdotH_sq_r / (4.0 * NdotH_sq );
    // может быть, эти вычисления в точности не соответствуют приведенным выше формулам
    // но поверьте – это они и есть :)

    // вычислим коэффициент Френеля, не вводя дополнительный параметр
       float fresnel = 1.0 / (1.0 + NdotV);

    // вычисляем результат, добавляя к знаменателю малую величину
    // чтобы не было деления на ноль
       return min(1.0, (fresnel * geometric * roughness) / (NdotV * NdotL + 1.0e-7));
}

void main()
{
    // Ambient
    float ambientStrength = 0.1f;
    vec3 ambient = ambientStrength * vec3(1.0f);
      
    // Diffuse
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * vec3(1.0f);
    
    // Specular
    float specularStrength = 0.5f;
    float roughness_val = 0.5f;
    vec3 viewDir = normalize(viewPos - FragPos);
    float spec = CookTorrance(norm, lightDir, viewDir, roughness_val);
    vec3 specular = specularStrength * spec * diff * vec3(1.0f);
        
    vec3 result = (ambient + diffuse + specular) * objectColor;
    color = vec4(result, 1.0f);
} 
