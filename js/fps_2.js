//ベクトルクラス（定義・計算)

class Vec2 {
  /**
   * @param {number} x ベクトルのx成分
   * @param {number} y ベクトルのy成分
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  /**
   * @param {Vec2} b 足したいベクトル
   */
  add(b) {
    let a = this;
    return new Vec2(a.x+b.x, a.y+b.y);
  }
  /**
   * @param {Vec2} b 引きたいベクトル
   */
  sub(b) {
    let a = this;
    return new Vec2(a.x-b.x, a.y-b.y);
  }
  /**
   * このベクトルのコピーを返す
   */
  copy() {
    return new Vec2(this.x, this.y);
  }
  /**
   * このベクトルの実数s倍を求める。
   * @param {number} s 何倍するか
   */
  mult(s) {
    return new Vec2(s*this.x, s*this.y);
  }
  /**
   * このベクトルの大きさを求める。
   */
  mag() {
    return sqrt(this.x ** 2 + this.y ** 2);
  }
}

//直線クラス
class Ray2 {
  /**
   * @param {Vec2} pos この直線の始点の位置ベクトル.
   * @param {Vec2} way この直線の始点から伸びる方向ベクトル.
   */
  constructor(pos, way) {
    this.pos = pos;
    this.way = way;
  }
  /**
   * 位置ベクトルと方向ベクトルではなく、始点と終点を通る直線を作る。

   * @param {Vec2} begin
   * @param {Vec2} end
   */
  static with2p(begin, end) {
    return new Ray2(begin, end.sub(begin));
  }
  /**
   * この直線の始点を求める
   * getをつけると、計算時に r.begin() ではなく r.begin と書くだけでよくなるらしい。
   */
  get begin() {
    return this.pos;
  }
  /**
   * この直線の終点を求める
   */
  get end() {
    return this.pos.add(this.way);
  }
  /**
   * この直線と、r2の交点を求める。
   * @param {Ray2} r2
   */
  intersection(r2) {
    let r1 = this;
    // Y軸並行の線分はこのコードでは扱えないので、並行の場合は微妙にずらす
    if (abs(r1.way.x) < 0.01) r1.way.x = 0.01;
    if (abs(r2.way.x) < 0.01) r2.way.x = 0.01;

    // r1,r2を直線として見て、その交点を求める
    let t1 = r1.way.y / r1.way.x;
    let t2 = r2.way.y / r2.way.x;
    let x1 = r1.pos.x;
    let x2 = r2.pos.x;
    let y1 = r1.pos.y;
    let y2 = r2.pos.y;
    /*
    (x1, y1)を通る傾きt1の直線と
    (x2, y2)を通る傾きt2の直線の
    交点(sx,sy)
    */
    let sx = (t1*x1 - t2*x2 - y1 + y2) / (t1 - t2);//直線の交点のx
    let sy = t1 * (sx - x1) + y1;//直線の交点のy

    // 交点が線分上にないときはnullを返す
    /*
    線分同士の交点は、x座標に身について考える
    二つの線分の交点は、交点のx成分が線分1かつ線分2のx成分に含まれていれば良い
    */
    if (
      sx > min(r1.begin.x, r1.end.x)
      && sx < max(r1.begin.x, r1.end.x)
      && sx > min(r2.begin.x, r2.end.x)
      && sx < max(r2.begin.x, r2.end.x)
    ){
      return new Vec2(sx, sy);
    }else{
      return null;
    }
  }
}

class Player {
  constructor() {
    this.pos = new Vec2(0, 0);
    this.angle = 0;
  }
}

class Bait {
  constructor() {
    this.pos = new Vec2(0, 0);
    this.angle = 0;
  }
}

/** @type {Player} */
let player;

/** @type {Bait} */
let bait;

function getRandom_min_max(min, max) {
  const rN_min_max = Math.floor(Math.random() * (max - min) +1) + min;
  return rN_min_max
}
let fieldRangeX = [50, 250];
let fieldRangeY = [50, 300];

function setup() {
  createCanvas(640, 360);

  player = new Player();
  player.pos = new Vec2(100, 200);
  player.angle = -PI / 2;

  bait = new Bait();
  bait.pos = new Vec2(getRandom_min_max(fieldRangeX[0] + 15 - bait.pos.x, fieldRangeX[1] - 15 - bait.pos.x), getRandom_min_max(fieldRangeY[0] + 15 - bait.pos.y, fieldRangeY[1] - 15 - bait.pos.y));
  bait.angle = -PI / 2;

}

let score = 0;
function draw() {
  background(10, 30, 60);

  // 壁を描画. Draw the walls
  strokeWeight(3);
  stroke('white');

  // 壁の定義
  let walls = [
    Ray2.with2p(new Vec2(50, 50), new Vec2(50, 300)),
    Ray2.with2p(new Vec2(50, 50), new Vec2(250, 50)),
    Ray2.with2p(new Vec2(50, 300), new Vec2(250, 300)),
    Ray2.with2p(new Vec2(250, 50), new Vec2(250, 300)),
  ];
  for(let wall of walls) {
    line(wall.begin.x, wall.begin.y, wall.end.x, wall.end.y);
  }

  // ========マスを作成========
  let grids = [
    Ray2.with2p(new Vec2(50, 100), new Vec2(250, 100)),
    Ray2.with2p(new Vec2(50, 150), new Vec2(250, 150)),
    Ray2.with2p(new Vec2(50, 200), new Vec2(250, 200)),
    Ray2.with2p(new Vec2(50, 250), new Vec2(250, 250)),
    Ray2.with2p(new Vec2(100, 50), new Vec2(100, 300)),
    Ray2.with2p(new Vec2(150, 50), new Vec2(150, 300)),
    Ray2.with2p(new Vec2(200, 50), new Vec2(200, 300)),
  ];
  for(let grid of grids) {
    line(grid.begin.x, grid.begin.y, grid.end.x, grid.end.y);
  }
  // ========================




  // ランダムな位置を定義
  let randomPosX = 0;
  // console.log(randomPosX);
  let randomPosY = 0;
  let randomPos = new Vec2(randomPosX, randomPosY);
  let playerBaitDis = bait.pos.sub(player.pos).mag()
  // この条件をぶつかったらにする
  if (playerBaitDis < 10) {
    score += 1;
    console.log(score);
    randomPosX = getRandom_min_max(fieldRangeX[0] + 15 - bait.pos.x, fieldRangeX[1] - 15 - bait.pos.x);
    randomPosY = getRandom_min_max(fieldRangeY[0] + 15 - bait.pos.y, fieldRangeY[1] - 15 - bait.pos.y);
    randomPos.x = randomPosX;
    randomPos.y = randomPosY;
    bait.pos = bait.pos.add(randomPos);
      console.log(randomPos);
  }
   // ベイトの中心点を描画
  stroke('red');
  strokeWeight(5);
  point(bait.pos.x, bait.pos.y);
  bait.angle += PI / 120

  // チーズを描画
  strokeWeight(3);
  stroke('yellow');

  // チーズを定義
  let cheeses = [
    Ray2.with2p(bait.pos.add(new Vec2(5*cos((PI/4)+ bait.angle), 5*sin((PI/4)+ bait.angle))), bait.pos.add(new Vec2(10*cos((PI*3/2)+ bait.angle), 10*sin((PI*3/2)+ bait.angle)))),
    Ray2.with2p(bait.pos.add(new Vec2(5*cos((PI*3/4)+ bait.angle), 5*sin((PI*3/4)+ bait.angle))), bait.pos.add(new Vec2(10*cos((PI*3/2)+ bait.angle), 10*sin((PI*3/2)+ bait.angle)))),
    Ray2.with2p(bait.pos.add(new Vec2(5*cos((PI/4)+ bait.angle), 5*sin((PI/4)+ bait.angle))), bait.pos.add(new Vec2(5*cos((PI*3/4)+ bait.angle), 5*sin((PI*3/4)+ bait.angle)))),
  ];


  for(let cheese of cheeses) {
    line(cheese.begin.x, cheese.begin.y, cheese.end.x, cheese.end.y);
  }
  // ==================================

  // プレイヤーを描画
  stroke('yellow');
  strokeWeight(20);
  point(player.pos.x, player.pos.y);

  // キー入力
  let pv = 2;
  if (keyIsDown(LEFT_ARROW)) {
    player.angle -= PI / 120;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.angle += PI / 120;
  }
  if (keyIsDown(UP_ARROW)){
    if((fieldRangeX[0]+3 <= player.pos.x  && cos(player.angle) < 0) || (player.pos.x <= fieldRangeX[1]-3 && cos(player.angle) > 0 )) {
      if ((fieldRangeY[0]+3 <= player.pos.y  && sin(player.angle) < 0) || (player.pos.y <= fieldRangeY[1]-3 && sin(player.angle) > 0 )) {
        player.pos.x += cos(player.angle)*pv
        player.pos.y += sin(player.angle)*pv
      }
    }
  }
  if (keyIsDown(DOWN_ARROW)){
    if((fieldRangeX[0]+3 <= player.pos.x  && cos(player.angle) > 0) || (player.pos.x <= fieldRangeX[1]-3 && cos(player.angle) < 0 )) {
      if ((fieldRangeY[0]+3 <= player.pos.y  && sin(player.angle) > 0) || (player.pos.y <= fieldRangeY[1]-3 && sin(player.angle) < 0 )) {
        player.pos.x -= cos(player.angle)*pv
        player.pos.y -= sin(player.angle)*pv
      }
    }
  }


  // プレイヤーの視界を描画
  {
    let viewRect = new Ray2(new Vec2(315, 55), new Vec2(312, 250));
    noFill();
    stroke('white');
    strokeWeight(8);
    rect(viewRect.pos.x, viewRect.pos.y, viewRect.way.x, viewRect.way.y);

    let fov = PI / 2; //視野90° Field of View
    let centerAngle = player.angle;
    let leftAngle = centerAngle - fov/2;
    let rightAngle = centerAngle + fov/2;
    let beamTotal = 80;//視野の線の数
    let beamIndex = -1;//※一つ目の壁を0番目にしたいので-1スタート
    let beamLength = 100;
    for(let angle=leftAngle; angle<rightAngle; angle+=fov/beamTotal) {
      beamIndex++;
      // console.log(beamIndex);
      //視野線：プレイヤーのポシションからアングル方向に伸びる線分
      let beam = new Ray2(
        player.pos.copy(),
        new Vec2(cos(angle), sin(angle)).mult(beamLength)
      );
      stroke(255, 255, 0, 50);
      strokeWeight(2);
      line(beam.begin.x, beam.begin.y, beam.end.x, beam.end.y);//視野線を明示。

      for(let wall of walls) {
        let hitPos = beam.intersection(wall);//視野線beamと壁の線分wallの交点
        if (hitPos === null) continue;//ないときは無視
        stroke('yellow');
        strokeWeight(10);
        point(hitPos.x, hitPos.y);//交点に点を打つ

        // 3Dビューに描画
        let viewRoot = new Vec2(320, 180); //3Dビュー基準
        let wallDist = hitPos.sub(beam.begin).mag();//壁までの距離=（交点-プレイヤー位置）の大きさ
        let wallPerpDist = wallDist * cos(angle - centerAngle);//垂直距離perpendicular
        let lineHeight = constrain(2800 / wallPerpDist, 0, viewRect.way.y);//壁から遠いほど壁短く (分数関数)、constrain()画面からはみ出さないようにする。
        /*
        viewRoot：y成分の画面中央、x成分左端
        lineBegin：視点の縦線の始点
        画面幅/視線数だけずらして描画。
        ループを重ねるたびに右にずらすので、ループ回数beamIndexをかける。
        画面中央を3D縦線の中央にしたいので、
        y成分で画面中央から3D縦線の半分だけ下の点を視点とする。
        lineEnd：lineBeginから縦に3D縦線の長さ。
        */
        let lineBegin = viewRoot.add(new Vec2(300/beamTotal*beamIndex, -lineHeight/2));
        let lineEnd = lineBegin.add(new Vec2(0, lineHeight));
        let lineColor = 255 - (255/beamLength)*wallDist;
        stroke(255, 255, 255, lineColor);
        strokeWeight(5);
        line(lineBegin.x, lineBegin.y, lineEnd.x, lineEnd.y);
      }

      // =====グリッドを描画=====
      for(let grid of grids) {
        let hitPos = beam.intersection(grid);//視野線beamと壁の線分gridの交点
        if (hitPos === null) continue;//ないときは無視
        stroke('yellow');
        strokeWeight(10);
        point(hitPos.x, hitPos.y);//交点に点を打つ

        // 3Dビューに描画
        let viewRoot = new Vec2(320, 180); //3Dビューの画面の基準点
        let gridDist = hitPos.sub(beam.begin).mag();//壁までの距離=（交点-プレイヤー位置）の大きさ
        let gridPerpDist = gridDist * cos(angle - centerAngle);//垂直距離perpendicular
        let lineHeight = constrain(2800 / gridPerpDist, 0, viewRect.way.y);//壁から遠いほど壁短く

        let lineBegin = viewRoot.add(new Vec2(300/beamTotal*beamIndex, lineHeight/2));
        let lineEnd = lineBegin.add(new Vec2(0, 0));//描画は高さ0
        let lineColor = 255 - (255/beamLength)*gridDist;
        stroke(255, 255, 255, lineColor);
        strokeWeight(5);
        line(lineBegin.x, lineBegin.y, lineEnd.x, lineEnd.y);
      }
      // ===========================
      // オブジェクト描画
      for(let cheese of cheeses) {
        let hitPos = beam.intersection(cheese);//視野線beamと壁の線分cheeseの交点
        if (hitPos === null) continue;//ないときは無視
        stroke('yellow');
        strokeWeight(10);
        point(hitPos.x, hitPos.y);//交点に点を打つ

        // 3Dビューに描画
        let viewRoot = new Vec2(320, 180); //3Dビューの画面配置
        let cheeseDist = hitPos.sub(beam.begin).mag();//壁までの距離=（交点-プレイヤー位置）の大きさ
        let cheesePerpDist = cheeseDist * cos(angle - centerAngle);//垂直距離perpendicular
        let lineHeight = constrain(400 / cheesePerpDist, 0, viewRect.way.y);//壁から遠いほど壁短く

        let lineBegin = viewRoot.add(new Vec2(300/beamTotal*beamIndex, -lineHeight/2));
        let lineEnd = lineBegin.add(new Vec2(0, lineHeight));
        let lineColor = 255 - (255/beamLength)*cheeseDist;
        stroke(255, 255, 0, lineColor);
        strokeWeight(7);
        line(lineBegin.x, lineBegin.y, lineEnd.x, lineEnd.y);
      }
    }
  }
  textSize(32);
  strokeWeight(3);
  // text(文字, x座標, y座標)
  text(score, 600, 40);
}


