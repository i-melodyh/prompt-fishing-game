
export class inputs {
    constructor(renderer) {
        this.renderer = renderer;

        //track which keys are being pressed 
        this.keys = {}

        this.mouse = {
            x: 0,        
            y: 0,
            dx: 0,       
            dy: 0,
            buttons: {},  // mouse buttons
        };

        //keys
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup',   (e) => this.keys[e.code] = false);

        // mouse
        window.addEventListener('mousemove',  (e) => this.onMouseMove(e));
        window.addEventListener('mousedown',  (e) => this.mouse.buttons[e.button] = true);
        window.addEventListener('mouseup',    (e) => this.mouse.buttons[e.button] = false);

    }

    onMouseMove(e) {
        this.mouse.dx = e.movementX;
        this.mouse.dy = e.movementY;
    }

    checkKey(key){
        return this.keys[key] || false;
    }

    checkMouseMovement(){
        const movement = { dx: this.mouse.dx, dy: this.mouse.dy };
        this.mouse.dx = 0;
        this.mouse.dy = 0;
        return movement;
    }
}


