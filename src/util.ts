export enum Direction {
  EAST = 0,
  SOUTH = 1,
  WEST = 2,
  NORTH = 3,
}

export class Matrix {
  a: number = 0;
  b: number = 0;
  c: number = 0;
  d: number = 0;
  e: number = 0;
  f: number = 0;

  mulV(v: Vector): Vector {
    return new Vector(this.a*v.x+this.b*v.y+this.c, this.d*v.x+this.e*v.y+this.f);
  }
  inverse(): Matrix {
    const rtn = new Matrix();
    const det = this.a*this.e-this.b*this.d;
    rtn.a = this.e/det;
    rtn.b = -this.b/det;
    rtn.c = -(this.c*this.e-this.b*this.f)/det;
    rtn.d = -this.d/det;
    rtn.e = this.a/det;
    rtn.f = (this.c*this.d-this.a*this.f)/det;
    return rtn;
  }

  applyCtx(ctx: CanvasRenderingContext2D): void {
    ctx.transform(this.a, this.d, this.b, this.e, this.c, this.f);
  }
}

export function mod(a: number, n: number) {
  return (a+n)%n;
}

export class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y+v.y);
  }

  mult(k: number): Vector {
    return new Vector(this.x*k, this.y*k);
  }

  toInt(threshold: number = 0.5): Vector {
    return new Vector((this.x + threshold)|0, (this.y + threshold)|0);
  }

  applyDirection(direction: number, k: number): Vector {
    return this.add(DIRECTION_MAP[direction].mult(k));
  }

  size(): number {
    return Math.hypot(this.x, this.y);
  }
}

export class Box {
  constructor(
    public x1: number,
    public x2: number,
    public y1: number,
    public y2: number
  ) {}

  move(v: Vector): Box {
    return new Box(this.x1+v.x, this.x2+v.x, this.y1+v.y, this.y2+v.y);
  }

  rotate(d: number): Box {
    switch(d%4) {
      case 0:
        return new Box(this.x1, this.x2, this.y1, this.y2);
      case 1:
        return new Box(-this.y2, -this.y1, this.x1, this.x2);
      case 2:
        return new Box(-this.x2, -this.x1, -this.y2, -this.y1);
      case 3:
        return new Box(this.y1, this.y2, -this.x2, -this.x1);
    }
    return this;
  }
  
  static isColliding(b1: Box, b2:Box) {
    return b1.x2 > b2.x1 && b1.x1 < b2.x2 && b1.y2 > b2.y1 && b1.y1 < b2.y2;
  }
}

export const DIRECTION_MAP = [
  new Vector(1,0),
  new Vector(0,1),
  new Vector(-1,0),
  new Vector(0,-1),
]

