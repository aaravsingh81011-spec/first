const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {
  left: false,
  right: false,
  jump: false,
  attack: false,
};

const world = {
  gravity: 0.7,
  floor: canvas.height - 90,
  cameraX: 0,
};

const player = {
  x: 120,
  y: 50,
  w: 42,
  h: 58,
  vx: 0,
  vy: 0,
  speed: 4,
  jumpForce: 13.5,
  grounded: false,
  facing: 1,
  attackTime: 0,
  hp: 5,
  invuln: 0,
};

const enemies = Array.from({ length: 6 }, (_, i) => ({
  x: 500 + i * 240,
  y: world.floor - 40,
  w: 36,
  h: 40,
  baseX: 500 + i * 240,
  hp: 3,
  alive: true,
  phase: Math.random() * Math.PI * 2,
}));

const platforms = [
  { x: 260, y: 360, w: 140, h: 16 },
  { x: 560, y: 300, w: 180, h: 16 },
  { x: 930, y: 390, w: 200, h: 16 },
  { x: 1320, y: 330, w: 130, h: 16 },
];

const worldEnd = 2000;
let previous = performance.now();

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "a", "A"].includes(event.key)) keys.left = true;
  if (["ArrowRight", "d", "D"].includes(event.key)) keys.right = true;
  if (event.key === " " || event.key === "ArrowUp") keys.jump = true;
  if (["j", "J"].includes(event.key)) keys.attack = true;
});

window.addEventListener("keyup", (event) => {
  if (["ArrowLeft", "a", "A"].includes(event.key)) keys.left = false;
  if (["ArrowRight", "d", "D"].includes(event.key)) keys.right = false;
  if (event.key === " " || event.key === "ArrowUp") keys.jump = false;
  if (["j", "J"].includes(event.key)) keys.attack = false;
});

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update(dt) {
  const moveInput = Number(keys.right) - Number(keys.left);
  player.vx = moveInput * player.speed;
  if (moveInput !== 0) player.facing = Math.sign(moveInput);

  if (keys.jump && player.grounded) {
    player.vy = -player.jumpForce;
    player.grounded = false;
  }

  if (keys.attack && player.attackTime <= 0) {
    player.attackTime = 0.22;
  }

  player.attackTime = Math.max(0, player.attackTime - dt);
  player.invuln = Math.max(0, player.invuln - dt);

  player.vy += world.gravity;
  player.x += player.vx;
  player.y += player.vy;

  player.grounded = false;

  const floorRect = { x: -1000, y: world.floor, w: worldEnd + 2000, h: 200 };
  const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
  if (rectsOverlap(pRect, floorRect) && player.vy >= 0) {
    player.y = world.floor - player.h;
    player.vy = 0;
    player.grounded = true;
  }

  for (const platform of platforms) {
    const nextRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (
      rectsOverlap(nextRect, platform) &&
      player.vy >= 0 &&
      player.y + player.h - player.vy <= platform.y + 8
    ) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }

  player.x = Math.max(0, Math.min(worldEnd - player.w, player.x));

  const attackRect = {
    x: player.facing === 1 ? player.x + player.w : player.x - 45,
    y: player.y + 8,
    w: 45,
    h: 35,
  };

  enemies.forEach((enemy) => {
    if (!enemy.alive) return;

    enemy.phase += dt;
    enemy.x = enemy.baseX + Math.sin(enemy.phase * 1.6) * 45;

    const enemyRect = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
    const hurtRect = { x: player.x + 6, y: player.y + 4, w: player.w - 12, h: player.h - 8 };

    if (player.attackTime > 0.05 && rectsOverlap(attackRect, enemyRect)) {
      enemy.hp -= 1;
      enemy.x += player.facing * 14;
      if (enemy.hp <= 0) enemy.alive = false;
    }

    if (player.invuln === 0 && rectsOverlap(hurtRect, enemyRect)) {
      player.hp -= 1;
      player.invuln = 1;
      player.vx = -player.facing * 6;
      player.vy = -6;
    }
  });

  world.cameraX = Math.max(0, Math.min(player.x - canvas.width * 0.35, worldEnd - canvas.width));
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#252f56");
  g.addColorStop(1, "#0b0e19");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(201,223,255,0.2)";
  for (let i = 0; i < 70; i++) {
    const x = (i * 173 - world.cameraX * 0.2) % (canvas.width + 200);
    const y = (i * 97) % 260;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawWorld() {
  ctx.save();
  ctx.translate(-world.cameraX, 0);

  ctx.fillStyle = "#151a31";
  ctx.fillRect(-200, world.floor, worldEnd + 400, canvas.height - world.floor);

  ctx.fillStyle = "#5f73ff";
  for (const platform of platforms) {
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
  }

  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    ctx.fillStyle = "#d95b80";
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(enemy.x + 8, enemy.y + 10, 6, 6);
    ctx.fillRect(enemy.x + 22, enemy.y + 10, 6, 6);
  });

  const blink = player.invuln > 0 && Math.floor(player.invuln * 20) % 2 === 0;
  if (!blink) {
    ctx.fillStyle = "#ecf2ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = "#111";
    ctx.fillRect(player.x + (player.facing === 1 ? 27 : 8), player.y + 16, 8, 8);
  }

  if (player.attackTime > 0) {
    ctx.fillStyle = "rgba(173, 229, 255, 0.8)";
    const ax = player.facing === 1 ? player.x + player.w : player.x - 45;
    ctx.fillRect(ax, player.y + 10, 45, 20);
  }

  ctx.restore();
}

function drawUI() {
  ctx.fillStyle = "rgba(8, 12, 30, 0.8)";
  ctx.fillRect(14, 14, 240, 70);
  ctx.strokeStyle = "#8da0ff";
  ctx.strokeRect(14, 14, 240, 70);

  ctx.fillStyle = "#e5ebff";
  ctx.font = "18px system-ui";
  ctx.fillText("Soul HP", 28, 41);

  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < player.hp ? "#9efcff" : "#33405f";
    ctx.fillRect(28 + i * 40, 52, 28, 18);
  }

  const alive = enemies.filter((e) => e.alive).length;
  ctx.fillStyle = "#c3ceff";
  ctx.fillText(`Foes Remaining: ${alive}`, canvas.width - 220, 40);

  if (player.hp <= 0) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px system-ui";
    ctx.fillText("YOU FELL", canvas.width / 2 - 130, canvas.height / 2);
  }
}

function loop(now) {
  const dt = Math.min((now - previous) / 1000, 0.033);
  previous = now;

  if (player.hp > 0) update(dt);
  drawBackground();
  drawWorld();
  drawUI();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
