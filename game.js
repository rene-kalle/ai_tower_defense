// Game Configuration
const GAME_CONFIG = {
    MAP_WIDTH: 800,
    MAP_HEIGHT: 600,
    TILE_SIZE: 40,
    GAME_LOOP_INTERVAL: 100, // milliseconds
    PROJECTILE_SPEED: 5,
    
    // Tower Types
    TOWERS: {
        archer: {
            cost: 100,
            damage: 25,
            range: 80,
            fireRate: 800, // milliseconds
            projectileSpeed: 6,
            name: 'Archer Tower'
        },
        catapult: {
            cost: 200,
            damage: 60,
            range: 100,
            fireRate: 1500,
            projectileSpeed: 4,
            name: 'Catapult Tower'
        },
        mage: {
            cost: 300,
            damage: 40,
            range: 90,
            fireRate: 1000,
            projectileSpeed: 8,
            name: 'Mage Tower'
        },
        cannon: {
            cost: 400,
            damage: 100,
            range: 120,
            fireRate: 2000,
            projectileSpeed: 3,
            name: 'Cannon Tower'
        }
    },
    
    // Enemy Types
    ENEMIES: {
        infantry: {
            health: 80,
            speed: 1.5,
            goldReward: 15,
            name: 'Infantry'
        },
        cavalry: {
            health: 120,
            speed: 2.5,
            goldReward: 25,
            name: 'Cavalry'
        },
        scout: {
            health: 40,
            speed: 3.5,
            goldReward: 10,
            name: 'Scout'
        },
        tank: {
            health: 200,
            speed: 1,
            goldReward: 40,
            name: 'Tank'
        }
    }
};

// Predefined enemy path coordinates
// --> original
const ENEMY_PATH_1 = [
    {x: -20, y: 200},   // spawn point (off-screen)
    {x: 40, y: 200},
    {x: 120, y: 200},
    {x: 200, y: 200},
    {x: 280, y: 200},
    {x: 280, y: 120},
    {x: 360, y: 120},
    {x: 440, y: 120},
    {x: 440, y: 280},
    {x: 520, y: 280},
    {x: 600, y: 280},
    {x: 680, y: 280},
    {x: 680, y: 200},
    {x: 760, y: 200},
    {x: 820, y: 200}    // base (off-screen)
];
// eine grade Linie
const ENEMY_PATH_2 = [
    {x: -20, y: 300},   // spawn point (off-screen)
    {x: 40, y: 300},
    {x: 120, y: 300},
    {x: 200, y: 300},
    {x: 280, y: 300},
    // {x: 280, y: 120},
    // {x: 360, y: 120},
    // {x: 440, y: 120},
    // {x: 440, y: 280},
    // {x: 520, y: 280},
    // {x: 600, y: 280},
    // {x: 680, y: 280},
    {x: 680, y: 300},
    {x: 760, y: 300},
    {x: 820, y: 300}    // base (off-screen)
];
// Zick Zack
const ENEMY_PATH_3 = [
    {x: -20, y: 300},   // spawn point (off-screen)
    {x: 220, y: 300},
    {x: 220, y: 140},
    {x: 420, y: 140},
    {x: 420, y: 460},
    {x: 620, y: 460},
    // {x: 280, y: 120},
    // {x: 360, y: 120},
    // {x: 440, y: 120},
    // {x: 440, y: 280},
    // {x: 520, y: 280},
    // {x: 600, y: 280},
    // {x: 680, y: 280},
    {x: 620, y: 300},
    // {x: 760, y: 300},
    {x: 820, y: 300}    // base (off-screen)
];
var ENEMY_PATH = ENEMY_PATH_1; // Standardpfad, kann durch Auswahl geändert werden

// Wave configurations
const WAVE_CONFIG = [
    // Wave 1
    {
        enemies: [
            {type: 'infantry', count: 8, interval: 1000},
        ]
    },
    // Wave 2
    {
        enemies: [
            {type: 'infantry', count: 12, interval: 800},
            {type: 'scout', count: 4, interval: 1500}
        ]
    },
    // Wave 3
    {
        enemies: [
            {type: 'infantry', count: 15, interval: 700},
            {type: 'cavalry', count: 6, interval: 1200}
        ]
    },
    // Wave 4
    {
        enemies: [
            {type: 'infantry', count: 20, interval: 600},
            {type: 'scout', count: 8, interval: 800},
            {type: 'cavalry', count: 4, interval: 1800}
        ]
    },
    // Wave 5+
    {
        enemies: [
            {type: 'infantry', count: 25, interval: 500},
            {type: 'cavalry', count: 10, interval: 1000},
            {type: 'scout', count: 12, interval: 600},
            {type: 'tank', count: 2, interval: 3000}
        ]
    }
];

// Main Game Class
class Game {
    constructor() {
        this.state = {
            gold: 200,
            lives: 20,
            currentWave: 0,
            isWaveActive: false,
            selectedTowerType: null,
            towers: [],
            enemies: [],
            projectiles: [],
            gameStatus: 'idle', // 'idle', 'active', 'gameover', 'victory'
            enemySpawnQueue: [],
            lastUpdate: Date.now()
        };
        
        this.gameLoop = null;
        this.towerPreview = null;

        // get path from URL parameter (if provided)
        const urlParams = new URLSearchParams(window.location.search);
        const pathParam = urlParams.get('path');
        if (pathParam === '2') {
            ENEMY_PATH = ENEMY_PATH_2;
        } else if (pathParam === '3') {
            ENEMY_PATH = ENEMY_PATH_3;
        }

        this.init();
    }
    
    init() {
        this.setupMap();
        this.setupEventListeners();
        this.updateUI();
        this.startGameLoop();
        
        // Announce game start
        this.announceToScreenReader('Tower Defense game loaded. Select a tower and click on the map to build it.');
    }
    
    setupMap() {
        const gameMap = document.getElementById('game-map');
        gameMap.innerHTML = ''; // Clear existing content
        
        // Create map tiles
        const tilesX = Math.floor(GAME_CONFIG.MAP_WIDTH / GAME_CONFIG.TILE_SIZE);
        const tilesY = Math.floor(GAME_CONFIG.MAP_HEIGHT / GAME_CONFIG.TILE_SIZE);
        
        // Create 2D array to track tile types
        this.mapGrid = [];
        for (let x = 0; x < tilesX; x++) {
            this.mapGrid[x] = [];
            for (let y = 0; y < tilesY; y++) {
                this.mapGrid[x][y] = 'buildable';
            }
        }
        
        // Mark path tiles
        // ENEMY_PATH.forEach(point => {
        //     const tileX = Math.floor(point.x / GAME_CONFIG.TILE_SIZE);
        //     const tileY = Math.floor(point.y / GAME_CONFIG.TILE_SIZE);
        //     if (tileX >= 0 && tileX < tilesX && tileY >= 0 && tileY < tilesY) {
        //         this.mapGrid[tileX][tileY] = 'path';
        //     }
        // });

        // Enemy path -> siehe weiter unten
        
        // Mark base tile
        // const baseTileX = Math.floor(760 / GAME_CONFIG.TILE_SIZE);
        // const baseTileY = Math.floor(200 / GAME_CONFIG.TILE_SIZE);
        // this.mapGrid[baseTileX][baseTileY] = 'base';
        
        // Create visual tiles
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                const tile = document.createElement('div');
                tile.className = `map-tile ${this.mapGrid[x][y]}`;
                tile.style.left = `${x * GAME_CONFIG.TILE_SIZE}px`;
                tile.style.top = `${y * GAME_CONFIG.TILE_SIZE}px`;
                tile.dataset.x = x;
                tile.dataset.y = y;
                
                gameMap.appendChild(tile);
            }
        }
        
        // Recreate SVG for enemy path
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'enemy-path-svg';
        svg.className.baseVal = 'enemy-path-svg';
        svg.setAttribute('viewBox', '0 0 800 600');
        svg.setAttribute('preserveAspectRatio', 'none');
        
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.id = 'enemy-path-line';
        polyline.className.baseVal = 'enemy-path-line';
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', '#FF0000');
        polyline.setAttribute('stroke-width', '5');
        polyline.setAttribute('stroke-linecap', 'round');
        polyline.setAttribute('stroke-linejoin', 'round');
        
        svg.appendChild(polyline);
        gameMap.appendChild(svg);
        
        // Draw the enemy path
        this.drawEnemyPath();

    }
    
    drawEnemyPath() {
        // Create points string for the polyline element
        const points = ENEMY_PATH.map(point => `${point.x},${point.y}`).join(' ');
        
        // Set the polyline points
        const polyline = document.getElementById('enemy-path-line');
        if (polyline) {
            polyline.setAttribute('points', points);
        }
    }
    
    setupEventListeners() {
        // Tower selection
        document.querySelectorAll('.tower-icon').forEach(icon => {
            icon.addEventListener('click', (e) => this.selectTower(e));
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectTower(e);
                }
            });
        });
        
        // Map clicks for tower placement
        const gameMap = document.getElementById('game-map');
        gameMap.addEventListener('click', (e) => this.handleMapClick(e));
        gameMap.addEventListener('mousemove', (e) => this.handleMapMouseMove(e));
        gameMap.addEventListener('mouseleave', () => this.hideTowerPreview());
        
        // Game controls
        document.getElementById('start-wave-btn').addEventListener('click', () => this.startWave());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelTowerSelection();
            }
        });
    }
    
    selectTower(e) {
        const towerType = e.currentTarget.dataset.towerType;
        const towerConfig = GAME_CONFIG.TOWERS[towerType];
        
        // Check if player can afford this tower
        if (this.state.gold < towerConfig.cost) {
            this.announceToScreenReader(`Not enough gold! Need ${towerConfig.cost} gold, you have ${this.state.gold}.`);
            return;
        }
        
        // Deselect previous selection
        document.querySelectorAll('.tower-icon').forEach(icon => {
            icon.classList.remove('selected');
        });
        
        // Select new tower
        e.currentTarget.classList.add('selected');
        this.state.selectedTowerType = towerType;
        
        // Enable build mode
        document.getElementById('game-map').classList.add('build-mode');
        
        this.announceToScreenReader(`${towerConfig.name} selected. Cost: ${towerConfig.cost} gold. Click on the map to build.`);
    }
    
    cancelTowerSelection() {
        document.querySelectorAll('.tower-icon').forEach(icon => {
            icon.classList.remove('selected');
        });
        
        this.state.selectedTowerType = null;
        document.getElementById('game-map').classList.remove('build-mode');
        this.hideTowerPreview();
        
        this.announceToScreenReader('Tower selection cancelled.');
    }
    
    handleMapClick(e) {
        if (!this.state.selectedTowerType) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const tileX = Math.floor(x / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor(y / GAME_CONFIG.TILE_SIZE);
        
        // Check if tile is buildable and empty
        if (this.canBuildAt(tileX, tileY)) {
            this.buildTower(tileX, tileY, this.state.selectedTowerType);
        } else {
            this.announceToScreenReader('Cannot build here! Choose an empty buildable area.');
        }
    }
    
    handleMapMouseMove(e) {
        if (!this.state.selectedTowerType) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.showTowerPreview(x, y);
    }
    
    showTowerPreview(x, y) {
        if (!this.towerPreview) {
            this.towerPreview = document.createElement('div');
            this.towerPreview.className = 'tower-preview';
            document.getElementById('game-map').appendChild(this.towerPreview);
        }
        
        this.towerPreview.className = `tower-preview tower ${this.state.selectedTowerType}`;
        this.towerPreview.style.left = `${x - 18}px`;
        this.towerPreview.style.top = `${y - 18}px`;
    }
    
    hideTowerPreview() {
        if (this.towerPreview) {
            this.towerPreview.remove();
            this.towerPreview = null;
        }
    }
    
    canBuildAt(tileX, tileY) {
        // Check bounds
        if (tileX < 0 || tileX >= this.mapGrid.length || tileY < 0 || tileY >= this.mapGrid[0].length) {
            return false;
        }
        
        // Check if tile is buildable
        if (this.mapGrid[tileX][tileY] !== 'buildable') {
            return false;
        }
        
        // Check if there's already a tower here
        const towerExists = this.state.towers.some(tower => 
            tower.tileX === tileX && tower.tileY === tileY
        );
        
        return !towerExists;
    }
    
    buildTower(tileX, tileY, towerType) {
        const towerConfig = GAME_CONFIG.TOWERS[towerType];
        
        // Deduct gold
        this.state.gold -= towerConfig.cost;
        
        // Create tower object
        const tower = {
            id: Date.now() + Math.random(),
            type: towerType,
            tileX: tileX,
            tileY: tileY,
            x: tileX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
            y: tileY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
            ...towerConfig,
            lastFire: 0,
            target: null,
            element: null
        };
        
        // Create visual element
        const element = document.createElement('div');
        element.className = `tower ${towerType}`;
        element.style.left = `${tower.x - 18}px`;
        element.style.top = `${tower.y - 18}px`;
        
        // Add range indicator (hidden by default)
        const rangeIndicator = document.createElement('div');
        rangeIndicator.className = 'tower-range';
        rangeIndicator.style.width = `${tower.range * 2}px`;
        rangeIndicator.style.height = `${tower.range * 2}px`;
        rangeIndicator.style.left = `${-tower.range + 18}px`;
        rangeIndicator.style.top = `${-tower.range + 18}px`;
        element.appendChild(rangeIndicator);
        
        document.getElementById('game-map').appendChild(element);
        tower.element = element;
        
        // Add to game state
        this.state.towers.push(tower);
        
        // Clear selection
        this.cancelTowerSelection();
        
        // Update UI
        this.updateUI();
        
        this.announceToScreenReader(`${towerConfig.name} built! Remaining gold: ${this.state.gold}`);
    }
    
    startWave() {
        if (this.state.isWaveActive) return;
        
        this.state.currentWave++;
        this.state.isWaveActive = true;
        
        // Get wave configuration (reuse last config for waves beyond defined ones)
        const waveIndex = Math.min(this.state.currentWave - 1, WAVE_CONFIG.length - 1);
        const waveConfig = WAVE_CONFIG[waveIndex];
        
        // Scale difficulty for higher waves
        const difficultyMultiplier = Math.max(1, this.state.currentWave - WAVE_CONFIG.length + 1);
        
        // Create spawn queue
        this.state.enemySpawnQueue = [];
        let spawnTime = Date.now() + 1000; // Start spawning after 1 second
        
        waveConfig.enemies.forEach(enemyGroup => {
            const count = Math.floor(enemyGroup.count * difficultyMultiplier);
            for (let i = 0; i < count; i++) {
                this.state.enemySpawnQueue.push({
                    type: enemyGroup.type,
                    spawnTime: spawnTime + (i * enemyGroup.interval)
                });
            }
        });
        
        // Sort by spawn time
        this.state.enemySpawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);
        
        document.getElementById('start-wave-btn').disabled = true;
        this.updateUI();
        
        this.announceToScreenReader(`Wave ${this.state.currentWave} starting! ${this.state.enemySpawnQueue.length} enemies incoming.`);
    }
    
    spawnEnemy(type) {
        const enemyConfig = GAME_CONFIG.ENEMIES[type];
        
        // Scale health for higher waves
        const difficultyMultiplier = Math.max(1, this.state.currentWave - WAVE_CONFIG.length + 1);
        const scaledHealth = Math.floor(enemyConfig.health * Math.sqrt(difficultyMultiplier));
        
        const enemy = {
            id: Date.now() + Math.random(),
            type: type,
            health: scaledHealth,
            maxHealth: scaledHealth,
            speed: enemyConfig.speed,
            goldReward: Math.floor(enemyConfig.goldReward * difficultyMultiplier),
            pathIndex: 0,
            x: ENEMY_PATH[0].x,
            y: ENEMY_PATH[0].y,
            element: null
        };
        
        // Create visual element
        const element = document.createElement('div');
        element.className = `enemy ${type}`;
        element.style.left = `${enemy.x - 10}px`;
        element.style.top = `${enemy.y - 10}px`;
        
        document.getElementById('game-map').appendChild(element);
        enemy.element = element;
        
        this.state.enemies.push(enemy);
    }
    
    updateEnemies() {
        this.state.enemies.forEach(enemy => {
            if (enemy.pathIndex >= ENEMY_PATH.length - 1) {
                // Enemy reached the base
                this.damageBase(enemy);
                return;
            }
            
            // Move towards next path point
            const targetPoint = ENEMY_PATH[enemy.pathIndex + 1];
            const dx = targetPoint.x - enemy.x;
            const dy = targetPoint.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < enemy.speed) {
                // Reached next path point
                enemy.pathIndex++;
                enemy.x = targetPoint.x;
                enemy.y = targetPoint.y;
            } else {
                // Move towards target
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            // Update visual position
            enemy.element.style.left = `${enemy.x - 10}px`;
            enemy.element.style.top = `${enemy.y - 10}px`;
            
            // Update health visualization
            const healthRatio = enemy.health / enemy.maxHealth;
            const opacity = 0.3 + (healthRatio * 0.7);
            enemy.element.style.opacity = opacity;
        });
    }
    
    updateTowers() {
        const currentTime = Date.now();
        
        this.state.towers.forEach(tower => {
            // Find target
            if (!tower.target || this.getDistance(tower, tower.target) > tower.range || tower.target.health <= 0) {
                tower.target = this.findTarget(tower);
            }
            
            // Fire at target
            if (tower.target && currentTime - tower.lastFire >= tower.fireRate) {
                this.fireTower(tower, tower.target);
                tower.lastFire = currentTime;
            }
        });
    }
    
    findTarget(tower) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        this.state.enemies.forEach(enemy => {
            if (enemy.health <= 0) return;
            
            const distance = this.getDistance(tower, enemy);
            if (distance <= tower.range && distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        });
        
        return closestEnemy;
    }
    
    fireTower(tower, target) {
        // Visual firing effect
        tower.element.classList.add('firing');
        setTimeout(() => {
            if (tower.element) {
                tower.element.classList.remove('firing');
            }
        }, 150);
        
        // Create projectile
        const projectile = {
            id: Date.now() + Math.random(),
            x: tower.x,
            y: tower.y,
            targetX: target.x,
            targetY: target.y,
            speed: tower.projectileSpeed,
            damage: tower.damage,
            target: target,
            element: null
        };
        
        // Create visual projectile
        const element = document.createElement('div');
        element.className = 'projectile';
        element.style.left = `${projectile.x - 2}px`;
        element.style.top = `${projectile.y - 2}px`;
        
        document.getElementById('game-map').appendChild(element);
        projectile.element = element;
        
        this.state.projectiles.push(projectile);
    }
    
    updateProjectiles() {
        this.state.projectiles.forEach((projectile, index) => {
            // Move towards target
            const dx = projectile.targetX - projectile.x;
            const dy = projectile.targetY - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= projectile.speed) {
                // Hit target
                if (projectile.target && projectile.target.health > 0) {
                    this.damageEnemy(projectile.target, projectile.damage);
                }
                
                // Remove projectile
                projectile.element.remove();
                this.state.projectiles.splice(index, 1);
            } else {
                // Move projectile
                projectile.x += (dx / distance) * projectile.speed;
                projectile.y += (dy / distance) * projectile.speed;
                
                // Update visual position
                projectile.element.style.left = `${projectile.x - 2}px`;
                projectile.element.style.top = `${projectile.y - 2}px`;
            }
        });
    }
    
    damageEnemy(enemy, damage) {
        enemy.health -= damage;
        
        if (enemy.health <= 0) {
            // Enemy defeated
            this.state.gold += enemy.goldReward;
            enemy.element.remove();
            
            // Remove from enemies array
            const index = this.state.enemies.indexOf(enemy);
            if (index > -1) {
                this.state.enemies.splice(index, 1);
            }
        }
    }
    
    damageBase(enemy) {
        this.state.lives--;
        
        // Remove enemy
        enemy.element.remove();
        const index = this.state.enemies.indexOf(enemy);
        if (index > -1) {
            this.state.enemies.splice(index, 1);
        }
        
        this.announceToScreenReader(`Base under attack! ${this.state.lives} lives remaining.`);
        
        if (this.state.lives <= 0) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.state.gameStatus = 'gameover';
        clearInterval(this.gameLoop);
        
        this.announceToScreenReader(`Game Over! You survived ${this.state.currentWave} waves.`);
        
        // Show game over message
        setTimeout(() => {
            alert(`Game Over!\n\nYou survived ${this.state.currentWave} waves.\nFinal Score: ${this.state.gold} gold`);
        }, 500);
    }
    
    checkWaveComplete() {
        if (!this.state.isWaveActive) return;
        
        // Check if all enemies spawned and defeated
        if (this.state.enemySpawnQueue.length === 0 && this.state.enemies.length === 0) {
            this.state.isWaveActive = false;
            document.getElementById('start-wave-btn').disabled = false;
            
            // Bonus gold for completing wave
            const bonusGold = 50 + (this.state.currentWave * 10);
            this.state.gold += bonusGold;
            
            this.announceToScreenReader(`Wave ${this.state.currentWave} complete! Bonus: ${bonusGold} gold.`);
        }
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    updateUI() {
        document.getElementById('gold-count').textContent = this.state.gold;
        document.getElementById('lives-count').textContent = this.state.lives;
        document.getElementById('wave-count').textContent = this.state.currentWave;
        
        // Update tower affordability
        document.querySelectorAll('.tower-icon').forEach(icon => {
            const towerType = icon.dataset.towerType;
            const towerConfig = GAME_CONFIG.TOWERS[towerType];
            
            if (this.state.gold < towerConfig.cost) {
                icon.classList.add('disabled');
            } else {
                icon.classList.remove('disabled');
            }
        });
        
        // Update screen reader stats
        const srStats = document.getElementById('sr-stats');
        srStats.textContent = `Gold: ${this.state.gold}, Lives: ${this.state.lives}, Wave: ${this.state.currentWave}`;
    }
    
    announceToScreenReader(message) {
        const srAnnouncements = document.getElementById('sr-announcements');
        srAnnouncements.textContent = message;
    }
    
    restartGame() {
        if (confirm('Are you sure you want to restart the game? All progress will be lost.')) {
            // Clear game loop
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
            }
            
            // Clear all game elements
            document.querySelectorAll('.enemy, .tower, .projectile, .tower-preview').forEach(el => el.remove());
            
            // Reset state
            this.state = {
                gold: 200,
                lives: 20,
                currentWave: 0,
                isWaveActive: false,
                selectedTowerType: null,
                towers: [],
                enemies: [],
                projectiles: [],
                gameStatus: 'idle',
                enemySpawnQueue: [],
                lastUpdate: Date.now()
            };
            
            // Reset UI
            document.getElementById('start-wave-btn').disabled = false;
            document.querySelectorAll('.tower-icon').forEach(icon => {
                icon.classList.remove('selected', 'disabled');
            });
            document.getElementById('game-map').classList.remove('build-mode');
            
            // Restart game loop
            this.startGameLoop();
            this.updateUI();
            
            this.announceToScreenReader('Game restarted! Select towers and defend your base.');
        }
    }
    
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            const currentTime = Date.now();
            
            // Process enemy spawning
            while (this.state.enemySpawnQueue.length > 0 && 
                   this.state.enemySpawnQueue[0].spawnTime <= currentTime) {
                const enemyToSpawn = this.state.enemySpawnQueue.shift();
                this.spawnEnemy(enemyToSpawn.type);
            }
            
            // Update game objects
            this.updateEnemies();
            this.updateTowers();
            this.updateProjectiles();
            
            // Check wave completion
            this.checkWaveComplete();
            
            // Update UI
            this.updateUI();
            
            this.state.lastUpdate = currentTime;
        }, GAME_CONFIG.GAME_LOOP_INTERVAL);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});