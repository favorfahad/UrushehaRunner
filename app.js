let backgroundMusic;
class Boss {
    constructor() {
        this.direction = 1;
        this.BossHealth = 6;
        this.enemyObject = null;
        this.isDamaged = false;
    }

    createObject(scene, x, y, sprite) {
        this.enemyObject = scene.physics.add.sprite(x, y, sprite)
            .setScale(0.45, 0.45)
            .setImmovable(true);
        this.enemyObject.body.allowGravity = false;
    }

    changeDirection() {
        this.direction *= -1;
    }

    addcolider(scene, ground, blocks) {
        scene.physics.add.collider(this.enemyObject, ground);
        scene.physics.add.collider(this.enemyObject, blocks, () => this.changeDirection());
    }

    colideWithPlayer(scene, player) {
        scene.physics.add.collider(this.enemyObject, player, () => {
            if (!this.enemyObject.active || !player.active) return;
    
            if (player.y + 40 > this.enemyObject.y) {
                // Player dies if jumps on boss
                scene.sound.play('fpd');
                player.disableBody(true, true);
                scene.playerDead = true;
                scene.gameOverText.setVisible(true);
            } else {
                // ✅ Only damage boss if not in cooldown
                if (!this.isDamaged) {
                    this.BossHealth--;
                    this.isDamaged = true;
    
                    this.enemyObject.setTint(0xff0000);  // Flash red
    
                    // ✅ STRONG KNOCKBACK LOGIC
                    const directionX = player.x < this.enemyObject.x ? -1 : 1;
                    const knockbackX = 1600 * directionX;
                    const knockbackY = -600;
    
                    player.setVelocity(knockbackX, knockbackY);
    
                    // Delay before boss can be hit again
                    scene.time.addEvent({
                        delay: 1000,
                        callback: () => {
                            this.isDamaged = false;
                            this.enemyObject.clearTint();
                        },
                        callbackScope: this
                    });
    
                    if (this.BossHealth <= 0) {
                        this.enemyObject.disableBody(true, true);
                        scene.sound.play('ed');
                    }
                }
            }
        });
    }
      
}


class Enemy {
    direction;
    enemyObject;
    constructor() {
        this.direction = 1;
        this.enemyObject = {};

    }

    createObject(parent, w, h, sprite) 
    {
        this.enemyObject = parent.physics.add.sprite(w, h, sprite).setScale(0.75, 0.75).setImmovable(true);
        this.enemyObject.body.allowGravity = false;
    }
    
    changeDirection() 
    {
        this.direction *= -1;
    }

    addcolider(parent, secondObject, thirdObject) 
    {
      parent.physics.add.collider(this.enemyObject, secondObject);
      parent.physics.add.collider(this.enemyObject, thirdObject, ()=>{
        this.changeDirection()
      });
    }

    colideWithPlayer(parent, player)
    {
        parent.physics.add.collider(this.enemyObject, player, ()=>{
            if (player.y + 40 > this.enemyObject.y) {
                parent.sound.play('pd');
                player.active = false;
                player.disableBody(true, true);
                parent.playerDead = true;
                parent.gameOverText.setVisible(true);
            } else {
                    // Player jumped on enemy
                    this.enemyObject.active = false;
                    this.enemyObject.disableBody(true, true);
                    parent.sound.play('ed');
            }
            
        });
    }
};

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.audio('bgmusic', 'assets/Theme-song.m4a'); // Replace with your music file
        this.load.image('playButton', 'assets/play.png');     // Optional UI images
        this.load.image('muteButton', 'assets/mute.png');
        this.load.image('head', 'assets/header.png');
    }

    create() {
        const title = this.add.text(this.cameras.main.centerX, 100, 'URUSHEHA RUNNER', {
            fontSize: '40px',
            fill: '#ffffff',
            fontFamily: '"Press Start 2P"',
        }).setOrigin(0.5);
        title.setShadow(4, 4, '#000000', 4, true, true);
        title.setDepth(10);

        this.tweens.add({
            targets: title,
            y: title.y + 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        let head = this.add.sprite(700, 500, "head").setScale(0.65, 0.65)

        // Play Button
        const playBtn = this.add.text(this.cameras.main.centerX, 250, '▶ PLAY', {
            fontSize: '30px',
            fill: '#00ff00',
            fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5).setInteractive();

        playBtn.on('pointerdown', () => {
            this.scene.start('MainGame');
        });

        // Mute Button
        const muteBtn = this.add.text(this.cameras.main.centerX, 330, '🔇 MUTE MUSIC', {
            fontSize: '20px',
            fill: '#ff0000',
            fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5).setInteractive();

        muteBtn.on('pointerdown', () => {
            if (backgroundMusic) {
                backgroundMusic.setMute(!backgroundMusic.mute);
                muteBtn.setText(backgroundMusic.mute ? '🔊 UNMUTE MUSIC' : '🔇 MUTE MUSIC');
            }
        });

        // Start background music
        if (!backgroundMusic) {
            backgroundMusic = this.sound.add('bgmusic', { loop: true, volume: 0.5 });
            backgroundMusic.play();
        }
    }
}

class MainGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGame' });
    }

     preload() 
    {    
        this.load.audio('pd', 'assets/playerdie.mp3');
        this.load.audio('ed', 'assets/enemydie.mp3');
        this.load.audio('eat', 'assets/eat.mp3');
        this.load.audio('fpd', 'assets/Noob.m4a');
        this.load.image("ground", "assets/ground.png");
        this.load.image("apple", "assets/cake.png");
        this.load.image("cloud", "assets/cloud.png");
        this.load.image("plants", "assets/plants.png");
        this.load.image("Boss", "assets/Boss.png");
        this.load.image("plant2", "assets/plant2.png");
        this.load.image("gemBlock", "assets/gemBlock.png");
        this.load.image("block", "assets/block.png");
        this.load.image("Pipe", "assets/Pipe.png");
        this.load.image("pot", "assets/Pot.png");
        this.load.spritesheet('hero', 'assets/Urusheha.png', {
            frameWidth: 22, frameHeight: 76,
            spacing: 0.3
        });
        this.load.image("enemy", "assets/spritesheet.png");
        this.load.image("text", "assets/finalboss.png"); 
    }

    create() 
    { 
        let W = 4500;
        let H = game.config.height;
        this.playerDead = false;
        // Add game over text (hidden at start)
        this.gameOverText = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, 'GAME OVER\n Press \'ENTER\' to Restart', {
            fontSize: '25px',
            fill: '#ff0000',
            fontFamily: '"Press Start 2P"',   
            align: 'center'
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setDepth(100);
        this.gameOverText.setVisible(false);
        this.gameOverText.setScrollFactor(0);   
        this.gameOverText.setShadow(2, 2, "#000", 2, true, true);
    
        this.e1 = new Enemy();
        this.e1.createObject(this, 3780, 242, 'enemy');
        this.e2 = new Enemy();
        this.e2.createObject(this, 1700, 550, 'enemy');
        this.e3 = new Enemy();
        this.e3.createObject(this, 1700, 550, 'enemy');
        this.boss = new Boss();
        this.boss.createObject(this, 3850, 450, 'Boss');
        // this.anims.create({
        //     key: 'run',
        //     frames: this.anims.generateFrameNumbers('enemy', {
        //         start: 0, end: 1
        //     }),
        //     repate: -1,
        //     frameRate: 10
        // })
    
        let ground = this.add.tileSprite(0, H - 48, W, 48, 'ground');
        ground.setOrigin(0, 0);
        this.physics.add.existing(ground, true);// ground.body.allowGravity = false; // ground.body.immovable = true;
    
        let cloud = this.add.sprite(500, 280, "cloud").setScale(0.75, 0.75)
        let plants = this.add.sprite(650, H - 70, "plants");
        let plant2 = this.add.sprite(150, H - 80, "plant2").setScale(0.75, 1);
        let text = this.add.sprite(2700, 350, "text").setScale(0.3, 0.3);
    
        this.player = this.physics.add.sprite(50, 90, 'hero').setScale(1.5,1);
        this.player.setBounce(0.5)
        this.player.setCollideWorldBounds(true);
    
        //Player animation and Player movement
    
        //animation
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('hero', {
                start: 0, end: 7
            }),
            frameRate: 10,
            repate: -1
        })
    
        this.anims.create({
            key: 'center',
            frames: this.anims.generateFrameNumbers('hero', {
                start: 8, end: 8
            }),
            frameRate: 10
        })
    
        this.anims.create({
            key: 'rigth',
            frames: this.anims.generateFrameNumbers('hero', {
                start: 9, end: 15
            }),
            frameRate: 10,
            repate: -1
        })
        //Keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
    
        let fruits = this.physics.add.group({
            key: "apple",
            repeat: 15,
            setScale: { x: 0.02, y: 0.02 },
            setXY: { x: 200, y: 0, stepX: 250 },
    
        })
    
        fruits.children.iterate((f, index) => {
            f.setBounce(Phaser.Math.FloatBetween(0.4, 0.7));
            f.y = Phaser.Math.Between(100, 400); 
        })
    
    
        let blocks = this.physics.add.staticGroup();
        blocks.create(900, 440, "gemBlock").refreshBody();
        blocks.create(3000, 440, "block").refreshBody();
        blocks.create(2800, 490, "block").refreshBody();
        blocks.create(3300, 365, "block").refreshBody();
        blocks.create(3150, 400, "block").refreshBody();
        blocks.create(3600, 290, "block").refreshBody();
        blocks.create(3650, 290, "block").refreshBody();
        blocks.create(3700, 290, "block").refreshBody();
        blocks.create(3750, 290, "block").refreshBody();
        blocks.create(3800, 290, "block").refreshBody();
        blocks.create(3850, 290, "block").refreshBody();
        blocks.create(3550, 290, "block").refreshBody();
        blocks.create(3500, 290, "block").refreshBody();
        blocks.create(4100, 290, "block").refreshBody();
        blocks.create(4150, 290, "block").refreshBody();
        blocks.create(4200, 290, "block").refreshBody();
        blocks.create(4250, 290, "block").refreshBody();
        blocks.create(4300, 290, "block").refreshBody();
        blocks.create(4350, 290, "block").refreshBody();
        blocks.create(4400, 290, "block").refreshBody();
        blocks.create(4450, 290, "block").refreshBody();
        blocks.create(4500, 290, "block").refreshBody();
        blocks.create(1110, 440, "gemBlock").refreshBody();
        blocks.create(1167, 440, "block").refreshBody()
        blocks.create(1050, 440, "block").refreshBody()
        blocks.create(1227, 440, "gemBlock").refreshBody();
        blocks.create(1284, 440, "block").refreshBody()
        blocks.create(1167, 300, "gemBlock").refreshBody();
        blocks.create(1500, H-68, "Pipe").refreshBody();
        blocks.create(2100, H-68, "Pipe").refreshBody();
        blocks.create(4300, 255, "Pipe").refreshBody();
        blocks.create(3700, 255, "Pipe").refreshBody();
        blocks.create(3700, H-68, "pot").setScale(0.09, 0.09).refreshBody();
        blocks.create(4300, H-68, "pot").setScale(0.09, 0.09).refreshBody();
    
        let platforms = this.physics.add.staticGroup();
        // platforms.create(600, 400, 'ground').setScale(3, 0.75).refreshBody()
        // platforms.create(700, 300, 'ground').setScale(3, 0.75).refreshBody();
        // platforms.create(290, 320, 'ground').setScale(3, 0.75).refreshBody()
        platforms.add(ground);
    
        //add a collision detection 
        this.physics.add.collider(platforms, this.player)
        this.physics.add.collider(platforms, fruits);
        this.physics.add.collider(blocks, fruits);
        this.physics.add.overlap(this.player, fruits, eatFruit, null, this);
        this.physics.add.collider(this.player, blocks);
        this.e1.addcolider(this, platforms, blocks); 
        this.e1.colideWithPlayer(this, this.player);
        this.e2.addcolider(this, platforms, blocks); 
        this.e2.colideWithPlayer(this, this.player);
        this.e3.addcolider(this, platforms, blocks); 
        this.e3.colideWithPlayer(this, this.player);
        this.boss.addcolider(this, platforms, blocks); 
        this.boss.colideWithPlayer(this, this.player);
    
        this.cameras.main.setBounds(0, 0, W, H);
        this.physics.world.setBounds(0, 0, W, H);
    
        this.cameras.main.startFollow(this.player, true, true);
        this.cameras.main.setZoom(1.5);
    
    }

    update() 
    { 
        
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-player_config.player_speed);
            this.player.anims.play('left', true)
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(player_config.player_speed);
            this.player.anims.play('rigth', true)
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('center', 'true')
        }

        //add jumping ablility
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(player_config.player_jumpspeed)
        }

        this.e1.enemyObject.setVelocityX(75*this.e1.direction);
        // this.e1.enemyObject.anims.play('run', true);
        this.e2.enemyObject.setVelocityX(75*this.e2.direction);
        this.e3.enemyObject.setVelocityX(-75*this.e3.direction);
        // this.e2.enemyObject.anims.play('run', true);
        this.boss.enemyObject.setVelocityX(195*this.boss.direction);

        if (this.playerDead) {
            if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER), 250)) {
                this.scene.restart();  // ✅ Restart the scene
            }
            return;  // Prevent further game logic
        }
    
    }
    
}
function eatFruit(player, fruit) {
    fruit.disableBody(true, true); 
    player.scene.sound.play('eat'); 
}

let player_config = {
    player_speed: 400,
    player_jumpspeed: -600,
}

let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container', // or the ID of your HTML element
    scale: {
        mode: Phaser.Scale.RESIZE, // This is key to auto-resizing
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#db7bcb',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1000,
            },
            // debug: true
        }
    },
    scene: [MenuScene, MainGame]
};

let game = new Phaser.Game(config);

