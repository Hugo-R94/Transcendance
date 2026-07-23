import * as THREE from "three";

export class Game {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;

    cookie: THREE.Mesh;

    cookies = 0;
    clickPower = 1;
    cookiesPerSecond = 0;

    clickUpgradeCost = 20;
    autoUpgradeCost = 50;

    ui: HTMLElement;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );

        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        document.body.appendChild(this.renderer.domElement);


        // Lumière
        const light = new THREE.PointLight(
            0xffffff,
            10
        );

        light.position.set(3,3,3);

        this.scene.add(light);


        // Cookie
        const geometry = new THREE.CylinderGeometry(
            1.3,
            1.3,
            0.3,
            64
        );

        const material = new THREE.MeshStandardMaterial({
            color: 0xd2691e
        });


        this.cookie = new THREE.Mesh(
            geometry,
            material
        );

        this.cookie.rotation.x = Math.PI / 2;

        this.scene.add(this.cookie);


        this.ui = document.createElement("div");

        this.ui.style.position = "absolute";
        this.ui.style.top = "20px";
        this.ui.style.left = "20px";
        this.ui.style.color = "white";
        this.ui.style.fontSize = "24px";

        document.body.appendChild(this.ui);


        this.setupEvents();

        setInterval(() => {
            this.cookies += this.cookiesPerSecond;
            this.updateUI();
        }, 1000);


        this.animate();
    }


    setupEvents() {

        window.addEventListener(
            "click",
            () => {

                this.cookies += this.clickPower;

                this.cookie.scale.set(
                    1.1,
                    1.1,
                    1.1
                );

                setTimeout(() => {
                    this.cookie.scale.set(
                        1,
                        1,
                        1
                    );
                },100);

                this.updateUI();
            }
        );


        window.addEventListener(
            "keydown",
            (e)=>{

                if(e.key === "1") {
                    this.buyClickUpgrade();
                }

                if(e.key === "2") {
                    this.buyAutoUpgrade();
                }

            }
        );
    }


    buyClickUpgrade(){

        if(this.cookies >= this.clickUpgradeCost){

            this.cookies -= this.clickUpgradeCost;

            this.clickPower++;

            this.clickUpgradeCost *= 2;

            this.updateUI();
        }
    }


    buyAutoUpgrade(){

        if(this.cookies >= this.autoUpgradeCost){

            this.cookies -= this.autoUpgradeCost;

            this.cookiesPerSecond++;

            this.autoUpgradeCost *= 2;

            this.updateUI();
        }
    }



    updateUI(){

        this.ui.innerHTML = `
        🍪 Cookies : ${Math.floor(this.cookies)}
        <br>
        👆 Click : +${this.clickPower}
        <br>
        ⚙️ Auto : +${this.cookiesPerSecond}/s
        <br><br>

        [1] Upgrade clic (${this.clickUpgradeCost})
        <br>

        [2] Auto cookie (${this.autoUpgradeCost})
        `;
    }



    animate(){

        requestAnimationFrame(
            ()=>this.animate()
        );


        this.cookie.rotation.z += 0.01;


        this.renderer.render(
            this.scene,
            this.camera
        );
    }
}
