//エンチャントJSを用意する。
enchant();
let enemy_count = 0;
let enemy_list = new Array();
let eliminate_count = 0;

let enemyLaser = new Array();
let maxEnemyLaser = 20;

window.onload = function(){
  let game = new Core(1000, 1000);
  game.fps = 30;
  game.preload("images/enemy.png", "images/beam.png", "images/own.png", "images/enemy_beam.png", "images/shi.png" );
  game.rootScene.backgroundColor = "white";
  game.score = 0;

  //スコア。ここクラス化したい
  let scoreLabel = new Label("スﾝコア : 0");
  scoreLabel.font = "16px Tahoma";
  scoreLabel.color = "black";
  scoreLabel.x = 10; // X座標
  scoreLabel.y = 5; // Y座標
  game.rootScene.addChild(scoreLabel);

  game.onload = function(){
    //自機
    let fighter = new Sprite(29, 23);
    fighter.image = game.assets["images/own.png"];
    fighter.x = game.width / 2; // X座標
    fighter.y = game.height - 100; // Y座標
    fighter._style.zIndex = 1;

    game.rootScene.addChild(fighter);

    // ビームの設定
    let beam = new Sprite(100, 100);
    beam.flag = false; // ビームが発射されているかどうかのフラグ
    beam.visible = false;
    beam.x = fighter.x - 50; // 自機の中央に設置
    beam.y = fighter.y + 20;  // 自機より少し上のY座標に設置
    beam.image = game.assets["images/beam.png"];
    beam._style.zIndex = 2;
    game.rootScene.addChild(beam);

    let shi = new Sprite(410, 410);
    shi.image = game.assets["images/shi.png"];
    shi.visible = false;
    shi.x = game.width / 4; // X座標
    shi.y = game.height / 4; // Y座標
    shi._style.zIndex = 999;

    game.rootScene.addChild(shi);

    // Zキーをaボタンとして割り当てる
    game.keybind(90, "a");

    //敵を描く
    drawEnemy(game);
    initEnemyLaser(game);

    game.rootScene.addEventListener(Event.ENTER_FRAME, function(){
      startBeam(beam, fighter, game); // ビームの発射を確認
      moveBeam(beam); // ビームを移動させる
      moveFighter(fighter, game, beam); // 自機を移動させる（キーボード対応）
      hitCheck(game, scoreLabel, beam);  // ビームと敵の接触判定
      moveEnemy();
      hitCheckLaser(game, fighter, shi);
      startEnemyLaser();
      moveEnemyLaser(game);
    });
  }
  game.start();
};

const drawEnemy = (game) => {
  count = 0; // 敵の総数を示すカウンタを0にする
  // ビームの設定を縦横の数だけ繰り返し生成
  for(let y=0; y<5; y++){
    for(let x=0; x<7; x++){
      enemy_list[enemy_count] = new Sprite(100, 100);
      enemy_list[enemy_count].image = game.assets["images/enemy.png"];
      enemy_list[enemy_count].x = x * (100+10); // X座標
      enemy_list[enemy_count].y = y * 100 + 30; // Y座標
      enemy_list[enemy_count]._style.zIndex = 2;  // Z座標
      game.rootScene.addChild(enemy_list[enemy_count]);
      enemy_count = enemy_count + 1; // 敵の総数を示すカウンタを増やす
    }
  }
  eliminate_count = enemy_count; // 消す敵の総数を変数に入れる
}

const moveBeam = (beam) => {
  if (beam.flag){
   beam.y = beam.y - 8; // 8を減算するとビームは上に移動する
   // 画面外かどうか調べる
   if (beam.y < -32){ beam.flag = false; }
  }
}


const startBeam = (beam, fighter, game) => {
  if (!beam.flag){
    // Aボタンが押されたらビームを発射
    if (game.input.a){
      beam.flag = true; // trueにしてビームが発射されている事を示すようにする
      beam.visible = true;
      beam.x = fighter.x - 30; // 自機の中央から出す
      beam.y = fighter.y - 30; // 自機より少し上のY座標から出す
    }
  }
}

const moveFighter = (fighter, game, beam) => {
  // キーボード操作の場合
  if (game.input.left){
    fighter.x = fighter.x - 20; // パドルを左に移動
    if (fighter.x < 0){ fighter.x = 0; } // 左端かどうか調べる
  }
  if (game.input.right){
    fighter.x = fighter.x + 20;  // パドルを右に移動
    if (fighter.x > (game.width-fighter.width)){ fighter.x = game.width - fighter.width; } // 右端かどうか調べる
  }
  // ビームが発射されていない場合は自機と一緒に移動
  if (!beam.flag){
    beam.x = fighter.x + 14; // 自機の中央に設置
    beam.y = fighter.y - 11; // 自機より少し上のY座標に設置
  }
}


const hitCheck = (game, scoreLabel, beam) => {
  for(let i=0; i< enemy_count; i++){
   if (beam.intersect(enemy_list[i])){
     beam.flag = false; // 接触した場合はビームを消す
     beam.visible = false;
     enemy_list[i].y = -9999;  // 見えない場所に移動
     game.score = game.score + 1; // スコアを加算(1点)
     eliminate_count = eliminate_count - 1; // 総敵数から1を引く
     if (eliminate_count < 1){  // 全部倒したか調べる
       setTimeout(drawEnemy, 2000); // 2秒後に敵を再描画
     }
   }
  }
  scoreLabel.text = "SCORE : "+ game.score;
}

const moveEnemy = () => {
  const move_speed = 100;
  for(let i=0; i < enemy_count; i++){
    enemy_list[i].x = enemy_list[i].x + Math.floor(Math.random() * (Math.floor(Math.random() * 100) % 2 == 0 ? -move_speed : move_speed));	// X座標の移動処理
    enemy_list[i].y = enemy_list[i].y + Math.floor(Math.random() * (Math.floor(Math.random() * 100) % 2 == 0 ? -move_speed : move_speed));	// Y座標の移動処理
    // 左右の端に到達したか調べる
    if (enemy_list[i].y < 0)enemy_list[i].y = Math.floor(Math.random() * 600);
    if (enemy_list[i].x < 0)enemy_list[i].x = Math.floor(Math.random() * 1000);
    if (enemy_list[i].x > 1000)enemy_list[i].x = Math.floor(Math.random() * 1000);
    if (enemy_list[i].y > 600)enemy_list[i].y = Math.floor(Math.random() * 600);
  }
}

const initEnemyLaser = (game) => {
  for(let i = 0; i < maxEnemyLaser; i++){
    enemyLaser[i] = new Sprite(50, 50);
    enemyLaser[i].image = game.assets["images/enemy_beam.png"];
    enemyLaser[i].flag = false;  // レーザービームが存在するかどうかのフラグ
    enemyLaser[i].x = -999; // X座標
    enemyLaser[i].y = -999;  // Y座標
    enemyLaser[i]._style.zIndex = 1; // Z座標

    game.rootScene.addChild(enemyLaser[i]);
  }
}

const moveEnemyLaser = (game) => {
  for(let i=0; i < maxEnemyLaser; i++){
    if (!enemyLaser[i].flag){ continue; } // レーザービームがない場合は繰り返しの先頭に
    enemyLaser[i].y = enemyLaser[i].y + 10; // Y座標の移動処理
    if (enemyLaser[i].y > game.height){  // 画面外か？
      enemyLaser[i].flag = false;  // 発射するレーザービームの存在をONにする
    }
  }
}

const startEnemyLaser = () => {
 let pointer = Math.floor(Math.random() * 100); // レーザービームを発射する敵の配列位置を求める
 if (!enemy_list[pointer] || enemy_list[pointer].y < 0 ){ return; } // 敵が存在しない場合は発射しない
 for(let i = 0; i < maxEnemyLaser; i++){
   if (!enemyLaser[i].flag){ // 空いているレーザービームの配列要素があるか
     enemyLaser[i].flag = true; // 発射するレーザービームの存在をONにする
     enemyLaser[i].x = enemy_list[pointer].x + 14; // X座標を設定
     enemyLaser[i].y = enemy_list[pointer].y + 16; // Y座標を設定
     return;  // 以後の処理はしない
   }
 }
}

const hitCheckLaser = (game, fighter, shi) => {
 for(let i = 0; i < maxEnemyLaser; i++){
   if (!enemyLaser[i].flag){ continue; }
   if (enemyLaser[i].intersect(fighter)){  // 接触したらゲームオーバー
     shi.visible =true;
     game.stop();
     alert("うわああああああああああああ\nスコア:"+game.score+"点");
     return;  // 以後の処理は行わないようにする
   }
 }
}
