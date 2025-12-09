document.addEventListener("DOMContentLoaded", () => {
      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');
      const startButton = document.getElementById('startButton');
      const resetButton = document.getElementById('resetButton');
      const scoreDisplay = document.getElementById('scoreDisplay');

      canvas.height = window.innerHeight - 40; 
      canvas.width = 600; 

      let gameRunning = false;
      let gameOver = false;
      let gameOverP1 = false;
      let gameOverP2 = false;
      let animationFrameId;
      let score = 0;
      let roadOffset = 0; 

      const numLanes = 4;
      const laneWidth = canvas.width / numLanes; 
      const carWidth = 40; 
      const carHeight = 60; 

      const laneCenters = [];
      for (let i = 0; i < numLanes; i++) {
            laneCenters.push((i * laneWidth) + (laneWidth / 2));
      }

      const player = {
            lane: 1, 
            x: laneCenters[1],
            y: canvas.height - 70, 
            width: carWidth,
            height: carHeight,
            color: '#e63946', 
            darkColor: '#a8202d'
      };

      const player2 = {
            lane: 2, 
            x: laneCenters[2],
            y: canvas.height - 70, 
            width: carWidth,
            height: carHeight,
            color: '#0077b6', 
            darkColor: '#00507a'
      };

      function dibujarAuto(car) {
            ctx.save();
            ctx.translate(car.x, car.y);
            ctx.fillStyle = car.color;
            ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
            ctx.fillStyle = car.darkColor;
            ctx.fillRect(-car.width / 2 + 5, -car.height / 2 + 8, car.width - 10, 15);
            ctx.fillStyle = '#ffb703';
            ctx.fillRect(-car.width / 2 + 4, -car.height / 2 + 2, 8, 4);
            ctx.fillRect(car.width / 2 - 12, -car.height / 2 + 2, 8, 4);
            ctx.restore();
      }

      class Bloque {
            constructor(laneIndex, y, dy) {
                  this.width = carWidth;
                  this.height = carHeight;
                  this.x = laneCenters[laneIndex] - (this.width / 2); 
                  this.y = y;
                  this.dy = dy;
                  
                  const hue = Math.random() * 360;
                  this.color = `hsl(${hue}, 70%, 50%)`;
                  this.darkColor = `hsl(${hue}, 70%, 30%)`;
            }

            dibujar() {
                  ctx.fillStyle = this.color;
                  ctx.fillRect(this.x, this.y, this.width, this.height);
                  ctx.fillStyle = this.darkColor;
                  ctx.fillRect(this.x + 5, this.y + this.height - 23, this.width - 10, 15);
                  ctx.fillStyle = '#ffb703';
                  ctx.fillRect(this.x + 4, this.y + this.height - 6, 8, 4);
                  ctx.fillRect(this.x + this.width - 12, this.y + this.height - 6, 8, 4);
            }

            actualizar() {
                  this.y += this.dy;
            }

            colisiona(player) {
                  const playerLeft = player.x - player.width / 2;
                  const playerRight = player.x + player.width / 2;
                  const playerTop = player.y - player.height / 2;
                  const playerBottom = player.y + player.height / 2;
                  const blockRight = this.x + this.width;
                  const blockBottom = this.y + this.height;
                  const collisionX = playerRight > this.x && playerLeft < blockRight;
                  const collisionY = playerBottom > this.y && playerTop < blockBottom;
                  return collisionX && collisionY;
            }
      }
      
      const blocks = []; 
      let lastSpawnTime = 0;
      let spawnDelay = 2000; 

      function generarOleada() {
            const baseSpeed = 1.5 + (score * 0.05);

            const speeds = [
                  baseSpeed + (Math.random() * 0.5), 
                  baseSpeed + 0.6 + (Math.random() * 0.5), 
                  baseSpeed + 1.2 + (Math.random() * 0.5) 
            ];
            
            const verticalOffsets = [
                  -carHeight - (Math.random() * 50), 
                  -carHeight - 150 - (Math.random() * 50),
                  -carHeight - 300 - (Math.random() * 50) 
            ];
            
            let lanes = [0, 1, 2, 3];
            const emptyLaneIndex = Math.floor(Math.random() * numLanes);
            lanes.splice(emptyLaneIndex, 1);
            
            blocks.push(new Bloque(lanes[0], verticalOffsets[0], speeds[0]));
            blocks.push(new Bloque(lanes[1], verticalOffsets[1], speeds[1]));
            blocks.push(new Bloque(lanes[2], verticalOffsets[2], speeds[2]));
      }

      function inicializarBloques() {
            blocks.length = 0; 
            lastSpawnTime = Date.now(); 
            spawnDelay = 2000; 
      }

      function dibujarCarretera() {
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5;
            ctx.setLineDash([20, 25]); 
            roadOffset = (roadOffset + 5) % 45; 
            ctx.lineDashOffset = -roadOffset;
            for (let i = 1; i < numLanes; i++) {
                  if (i !== Math.floor(numLanes / 2)) { 
                        ctx.beginPath();
                        ctx.moveTo(i * laneWidth, 0);
                        ctx.lineTo(i * laneWidth, canvas.height);
                        ctx.stroke();
                  }
            }
            ctx.setLineDash([]); 

            ctx.strokeStyle = '#fbc02d'; 
            ctx.lineWidth = 8; 
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0); 
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
      }

      function bucleJuego() {
            if (!gameRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dibujarCarretera();

            let now = Date.now();
            if (now - lastSpawnTime > spawnDelay) {
                  generarOleada();
                  lastSpawnTime = now;
                  if (spawnDelay > 700) { 
                       spawnDelay -= 30; 
                  }
            }

            for (let i = blocks.length - 1; i >= 0; i--) {
                  const block = blocks[i];
                  block.actualizar();
                  block.dibujar();

                  if (!gameOverP1 && block.colisiona(player)) {
                        gameOverP1 = true; 
                        player.color = '#555'; 
                  }
                  if (!gameOverP2 && block.colisiona(player2)) {
                        gameOverP2 = true;
                        player2.color = '#555';
                  }

                  if (block.y > canvas.height) {
                        blocks.splice(i, 1);
                        if (gameRunning && (!gameOverP1 || !gameOverP2)) { 
                              score += 1;
                              scoreDisplay.textContent = `Puntuación: ${score}`;
                                                }
                  }
            } 

            dibujarAuto(player);
            dibujarAuto(player2);

            if (gameOverP1 && gameOverP2) {
                  gameOver = true;
                  gameRunning = false;
                  cancelAnimationFrame(animationFrameId);
                  startButton.disabled = true;
                  alert('¡Ambos chocaron, ya váyanse del ciber! PUNTUACIÓN FINAL: ' + score + ' puntos');
                  return;
            }

            animationFrameId = requestAnimationFrame(bucleJuego);
      }

      document.addEventListener('keydown', (e) => {
            if (!gameRunning || gameOver) return;
            if (!gameOverP1) {
                  if (e.key === 'a' || e.key === 'A') {
                        player.lane = Math.max(0, player.lane - 1); 
                  } else if (e.key === 'd' || e.key === 'D') {
                        player.lane = Math.min(numLanes - 1, player.lane + 1);
                  }
                  player.x = laneCenters[player.lane]; 
            }
            if (!gameOverP2) {
                  if (e.key === 'ArrowLeft') {
                        player2.lane = Math.max(0, player2.lane - 1);
                  } else if (e.key === 'ArrowRight') {
                        player2.lane = Math.min(numLanes - 1, player2.lane + 1);
                  }
                  player2.x = laneCenters[player2.lane];
            }
      });

      startButton.addEventListener('click', () => {
            if (!gameRunning && !gameOver) {
                  gameRunning = true;
                  startButton.disabled = true;
                  lastSpawnTime = Date.now(); 
                  bucleJuego();
            }
      });

      function reiniciarJuego() {
            score = 0;
            scoreDisplay.textContent = `Puntuación: ${score}`;
            
            gameRunning = false;
            gameOver = false;
            gameOverP1 = false;
            gameOverP2 = false;
            
            cancelAnimationFrame(animationFrameId);
            
            player.lane = 1;
            player.x = laneCenters[player.lane];
            player.color = '#e63946';
            
            player2.lane = 2;
            player2.x = laneCenters[player2.lane];
            player2.color = '#0077b6';
            
            inicializarBloques(); 
            dibujarPantallaInicial();
            
            startButton.disabled = false;
      }

      resetButton.addEventListener('click', () => {
            reiniciarJuego();
      });

      function dibujarPantallaInicial() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dibujarCarretera();
            dibujarAuto(player);
            dibujarAuto(player2);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Pulsa "Iniciar Juego" para empezar', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '18px Arial';
            ctx.fillText('J1: Teclas A y D | J2: Flechas Izq/Der', canvas.width / 2, canvas.height / 2 + 20);
      }

      reiniciarJuego(); 
});