type Coordinates = [number, number];
type MapMap = Map<number, Map<number, any>>;

class CubicHex {
    q: number;
    r: number;
    s: number;

    constructor(q: number, r: number, s: number) {
        if (q+r+s != 0) {
            throw(`A hex's cubic coordinates must sum to 0 but ${q} + ${r} + ${s} = ${q+r+s}.`)
        }
        this.q = q;
        this.r = r;
        this.s = s;
    }

    minus(other_hex: CubicHex): CubicHex {
        return new CubicHex(this.q - other_hex.q, this.r - other_hex.r, this.s - other_hex.s)
    }

    plus(other_hex: CubicHex): CubicHex {
        return new CubicHex(this.q + other_hex.q, this.r + other_hex.r, this.s + other_hex.s)
    }

    equals(other_hex: CubicHex): boolean {
        if (this.q == other_hex.q && this.r == other_hex.r && this.s == other_hex.s) {
            return true;
        } else {
            return false;
        }
    }

    dist(other_hex: CubicHex): number {
        let dist = this.minus(other_hex);
        return (Math.abs(dist.q) + Math.abs(dist.r) + Math.abs(dist.s))/2
    }

    to_axial(): AxialHex {
        return new AxialHex(this.q, this.r);
    }
}

class AxialHex {
    q: number;
    r: number;

    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
    }

    minus(other_hex: AxialHex): AxialHex {
        return new AxialHex(this.q - other_hex.q, this.r - other_hex.r)
    }

    plus(other_hex: AxialHex): AxialHex {
        return new AxialHex(this.q + other_hex.q, this.r + other_hex.r)
    }

    equals(other_hex: AxialHex): boolean {
        if (this.q == other_hex.q && this.r == other_hex.r) {
            return true;
        } else {
            return false;
        }
    }

    dist(other_hex: AxialHex): number {
        let dist = this.minus(other_hex);
        return (Math.abs(dist.q) + Math.abs(dist.r) + Math.abs(dist.q + dist.r))/2
    }

    to_cubic(): CubicHex {
        return new CubicHex(this.q, this.r, -(this.q+this.r));
    }

    to_offset(): OffsetHex {
        let x = this.q;
        let y = this.r + (this.q - (this.q&1)) / 2;
        return new OffsetHex(x, y);
    }

    to_double_height(): DoubleHeightHex {
        return new DoubleHeightHex(this.q, 2*this.r + this.q);
    }

    euclidean(other_hex: AxialHex): number {
        return this.to_double_height().euclidian(other_hex.to_double_height());
    }

    angle(other_hex: AxialHex, as_rad: boolean=true): number {
        return this.to_double_height().angle(other_hex.to_double_height(), as_rad);
    }

    pixel_position(size:number=1): Coordinates {
        let x: number = size * 3/2 * this.q;
        let y: number = size * 3**0.5 * (0.5*this.q + this.r);
        return [x, y];
    } 

    
}

class OffsetHex {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    equals(other_hex: OffsetHex): boolean {
        if (this.x == other_hex.x && this.y == other_hex.y) {
            return true;
        } else {
            return false;
        }
    }

    to_axial(): AxialHex {
        return new AxialHex(this.x, this.y - (this.x - (this.x&1))/2);
    }
}

class DoubleHeightHex {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        if (((x + y)&1) == 1) {
            throw(`The coordinates of a DoubleHeightHex must sum to an even number: ${x} and ${y} do not.`)
        }
        this.x = x;
        this.y = y;
    }

    equals(other_hex: DoubleHeightHex): boolean {
        if (this.x == other_hex.x && this.y == other_hex.y) {
            return true;
        } else {
            return false;
        }
    }

    minus(other_hex: DoubleHeightHex): DoubleHeightHex {
        return new DoubleHeightHex(this.x - other_hex.x, this.y - other_hex.y);
    }

    plus(other_hex: DoubleHeightHex): DoubleHeightHex {
        return new DoubleHeightHex(this.x + other_hex.x, this.y + other_hex.y);
    }

    to_axial(): AxialHex {
        return new AxialHex(this.x, (this.y-this.x)/2);
    }

    euclidian(other_hex: DoubleHeightHex): number {
        return (9/4*(this.x-other_hex.x)**2 + 3/4*(this.y-other_hex.y)**2)**0.5
    }

    angle(other_hex: DoubleHeightHex, as_rad: boolean = true): number {
        let angle = Math.atan(1/3**0.5 * (other_hex.y - this.y)/(other_hex.x - this.x));
        if (this.x > other_hex.x) {
            angle += Math.PI;
        } else if (this.y > other_hex.y) {
            angle += 2 * Math.PI;
        }
        if (!as_rad) {
            return angle * 180/Math.PI; 
        }
        return angle;
    }
}

class HexMap {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
    hex_table: MapMap;

    constructor(x_dim: number, y_dim: number) {
        this.x_min = 0;
        this.y_min = 0;
        this.x_max = x_dim-1;
        this.y_max = y_dim-1;
        this.hex_table = new Map();
        for (let coord of this.coords()) {
            this.set(coord, undefined)
        }
    }

    * coords() {
        for (let x=this.x_min; x <= this.x_max; x++) {
            for (let y=this.y_min + ((this.y_min&1) ^ (x&1)); y <= this.y_max; y+=2) {
                let q = x;
                let r = (y-x)/2;
                let out:Coordinates = [q, r];
                yield out
            }
        }
    }

    * hexes() {
        for (let coord of this.coords()) {
            yield new AxialHex(coord[0], coord[1]), this.get(coord);
        }
    }

    set(coord:Coordinates, value:any) {
        this.validate_coordinate(coord);
        if (!this.hex_table.has(coord[0])) {
            this.hex_table.set(coord[0], new Map());
        }
        this.hex_table.get(coord[0]).set(coord[1], value);
    }

    get(coord:Coordinates) {
        this.validate_coordinate(coord);
        return this.hex_table.get(coord[0]).get(coord[1]);
    }

    validate_coordinate(coord:Coordinates) {
        if (coord[0] < this.x_min ) {
            throw(`X-coordinate ${coord[0]} is less than ${this.x_min}.`)
        }
        if (coord[0] > this.x_max) {
            throw(`X-coordinate ${coord[0]} is out of range for a grid with x-dimension, ${this.x_max-this.x_min+1}`)
        }
        if (coord[1] < -Math.floor(coord[0]/2)) {
            throw(`Y-coordinate ${coord[1]} is too small for the ${coord[0]}th column.`)
        }
        if (coord[1] > Math.floor((this.x_max-this.x_min)/2) - Math.floor(coord[0]/2)) {
            throw(`Y-coordinate ${coord[1]} is too large for a grid with y-dimension, ${this.y_max-this.y_min+1}, in the ${coord[0]}th column.`)
        }
    }
}

function draw_hex(hex_coord:AxialHex, color:string, side_length:number, context:CanvasRenderingContext2D, offset:Coordinates=[0, 0]) {
    var [x, y] = hex_coord.pixel_position(side_length);
    x += offset[0]; y += offset[1];
    context.fillStyle = color;
    context.beginPath();
    var vert = 3**0.5/2;
    context.moveTo(x+0.5*side_length, y-vert*side_length);
    context.lineTo(x+side_length, y);
    context.lineTo(x+0.5*side_length, y+vert*side_length);
    context.lineTo(x-0.5*side_length, y+vert*side_length);
    context.lineTo(x-side_length, y);
    context.lineTo(x-0.5*side_length, y-vert*side_length);
    context.lineTo(x+0.5*side_length, y-vert*side_length);
    context.fill();
}

function draw_random_hexes(context:CanvasRenderingContext2D, size:number, x_size:number, y_size:number) {
    let grid = new HexMap(x_size, y_size);
    for (let coord of grid.coords()) {
        var color = '#'+Math.floor(Math.random()*16777215).toString(16);
        let hex = new AxialHex(coord[0], coord[1]);
        draw_hex(hex, color, size, context);
    }
}

let j = new HexMap(6, 4);
for (let x of j.hexes()) {
    console.log(x[0])
}