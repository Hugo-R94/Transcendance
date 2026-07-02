import { useEffect, useRef } from "react";

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const CONFIG = {
      SPIN_ROTATION: -2.0,
      SPIN_SPEED: 7.0,
      OFFSET: [0.0, 0.0],
      COLOUR_1: [0.871, 0.267, 0.231, 1.0],
      COLOUR_2: [0.0, 0.42, 0.706, 1.0],
      COLOUR_3: [0.086, 0.137, 0.145, 1.0],
      CONTRAST: 3.5,
      LIGTHING: 0.4,
      SPIN_AMOUNT: 0.25,
      PIXEL_FILTER: 745.0,
      SPIN_EASE: 1.0,
      IS_ROTATE: false
    };

    const glFloat = (n: number) =>
      Number.isInteger(n) ? n.toFixed(1) : String(n);

    const glVec = (arr: number[]) => arr.map(glFloat).join(", ");

    const vertexSrc = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSrc = `
      precision highp float;

      uniform vec2 iResolution;
      uniform float iTime;

      #define SPIN_ROTATION ${glFloat(CONFIG.SPIN_ROTATION)}
      #define SPIN_SPEED ${glFloat(CONFIG.SPIN_SPEED)}
      #define OFFSET vec2(${glVec(CONFIG.OFFSET)})
      #define COLOUR_1 vec4(${glVec(CONFIG.COLOUR_1)})
      #define COLOUR_2 vec4(${glVec(CONFIG.COLOUR_2)})
      #define COLOUR_3 vec4(${glVec(CONFIG.COLOUR_3)})
      #define CONTRAST ${glFloat(CONFIG.CONTRAST)}
      #define LIGTHING ${glFloat(CONFIG.LIGTHING)}
      #define SPIN_AMOUNT ${glFloat(CONFIG.SPIN_AMOUNT)}
      #define PIXEL_FILTER ${glFloat(CONFIG.PIXEL_FILTER)}
      #define SPIN_EASE ${glFloat(CONFIG.SPIN_EASE)}
      #define PI 3.14159265359
      #define IS_ROTATE ${CONFIG.IS_ROTATE ? "true" : "false"}

      vec4 effect(vec2 screenSize, vec2 screen_coords) {
          float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
          vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy) - OFFSET;
          float uv_len = length(uv);

          float speed = (SPIN_ROTATION*SPIN_EASE*0.2);
          if (IS_ROTATE) {
             speed = iTime * speed;
          }
          speed += 302.2;

          float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len + (1. - 1.*SPIN_AMOUNT));
          vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
          uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

          uv *= 30.;
          speed = iTime*(SPIN_SPEED);
          vec2 uv2 = vec2(uv.x+uv.y);

          for (int i=0; i < 5; i++) {
              uv2 += sin(max(uv.x, uv.y)) + uv;
              uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121), sin(uv2.x - 0.113*speed));
              uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
          }

          float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2);
          float paint_res = min(2., max(0., length(uv)*(0.035)*contrast_mod));
          float c1p = max(0., 1. - contrast_mod*abs(1.-paint_res));
          float c2p = max(0., 1. - contrast_mod*abs(paint_res));
          float c3p = 1. - min(1., c1p + c2p);
          float light = (LIGTHING - 0.2)*max(c1p*5. - 4., 0.) + LIGTHING*max(c2p*5. - 4., 0.);

          return (0.3/CONTRAST)*COLOUR_1 +
          (1. - 0.3/CONTRAST)*(COLOUR_1*c1p + COLOUR_2*c2p + vec4(c3p*COLOUR_3.rgb, c3p*COLOUR_1.a)) + light;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        gl_FragColor = effect(iResolution.xy, uv * iResolution.xy);
      }
    `;

    function compile(type: number, src: string) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1,-1, 1,-1, -1,1,
        -1,1, 1,-1, 1,1
      ]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, "iResolution");
    const timeLoc = gl.getUniformLocation(program, "iTime");

    const start = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener("resize", resize);
    resize();

    function render() {
      const t = (performance.now() - start) / 1000;

      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, t);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);
	return (
	<canvas className="fixed inset-0 -z-1 w-[100%] h-[100%] pointer-events-none"
		ref={canvasRef}
	/>
	);
}
