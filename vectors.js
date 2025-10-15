
export class Vector2{
  // 2D Vector. Immutable.
  // Mostly self-explainatory.
  #x;#y;
  constructor(x=0,y=0){
    this.#x=x;
    this.#y=y
  }
  get x(){ return this.#x; }
  get y(){ return this.#y; }
  add(v){
    return new Vector2(this.x+v.x,this.y+v.y);
  }
  invert(){
    return new Vector2(-this.x,-this.y);
  }
  subtract(v){
    return this.add(v.invert());
  }
  multiply(n){
    //console.log("V2/Mult "+n);
    return new Vector2(this.x*n,this.y*n);
  }
  divide(n){
    //console.log("V2/Div "+n);
    return this.multiply(1/n);
  }
  length(){
    return Math.sqrt(this.x*this.x+this.y*this.y);
  }
  normalize(){
    let len=this.length();
    if (len<0.0000001) return new Vector2(0,0);
    else return this.divide(len);
  }
  toString(){
    return "V2D("+this.x.toFixed(3)+","+this.y.toFixed(3)+")";
  }
  static random(){
    while (1){
      let v=new Vector2(Math.random()*2-1,Math.random()*2-1);
      if (v.length()>1.0) continue;
      return v;
    }
  }
  static ZERO = new Vector2(0,0);
}
export class Vector3{
  // 3D Vector. Immutable.
  // Mostly self-explainatory.
  #x;#y;#z;
  constructor(x=0,y=0,z=0){
    this.#x=x;
    this.#y=y;
    this.#z=z;
  }
  get x(){ return this.#x; }
  get y(){ return this.#y; }
  get z(){ return this.#z; }
  add(v){
    return new Vector3(this.x+v.x,this.y+v.y,this.z+v.z);
  }
  invert(){
    return new Vector3(-this.x,-this.y,-this.z);
  }
  subtract(v){
    return this.add(v.invert());
  }
  multiply(n){
    return new Vector3(this.x*n,this.y*n,this.z*n);
  }
  divide(n){
    return this.multiply(1/n);
  }
  length(){
    return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
  }
  normalize(){
    let len=this.length();
    if (len<0.0000001) return new Vector3(0,0,0);
    else return this.divide(len);
  }
  toString(){
    return "V3D("+this.x.toFixed(3)+","+this.y.toFixed(3)+","+this.z.toFixed(3)+")";
  }
  projectXY(){
    return new Vector2(this.x,this.y)
  }
  static random(){
    while (1){
      let v=new Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1);
      if (v.length()>1.0) continue;
      return v;
    }
  }
  static ZERO = new Vector3(0,0,0);
}
