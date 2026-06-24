import { Character } from './Character.js';

export class Guardian extends Character {
    constructor(scene, x, y, patrolRange = [-200, 200]) {
        super(scene, "enemy", x, y, "enemy", "idle", 5); 
        this.isGuardian = true; 
        
        // Tamanho visual do Boss
        this.baseWidth = 85;
        this.baseHeight = 85;
        this.sprite.scale.set(this.baseWidth, this.baseHeight, 1); 
        
        // Hitbox Física (Uma caixa ligeiramente menor que o PNG para evitar que ele fique preso nas bordas das plataformas)
        this.width = 50; 
        this.height = 50; 
        
        this.visualFeetOffset = 6; 

        this.hasKnockback = false;
        this.flashesOnDamage = true;
        this.invulnerabilityDuration = 0; 
        this.flashDuration = 40; 

        this.initHealthBar();

        this.patrolMin = patrolRange[0];
        this.patrolMax = patrolRange[1];
        
        this.detectionRange = 600; 
        
        // Variáveis do pulo estilo "Boss"
        this.jumpCooldownTimer = Math.floor(Math.random() * 20);
        this.vx = 0; 
        this.direction = 1;
        
        this.animations = {
            "idle": this._loadAnimationFrames("enemy/enemy_idle", 2),
            "run": this._loadAnimationFrames("enemy/enemy_run", 28)
        };
    }

    updateBehavior(playerPos) {
        if (this.isOnGround) {
            // ==========================================
            // FASE 1: ESTADO NO CHÃO (Caminhada ou Decisão de Pulo)
            // ==========================================
            
            if (this.jumpCooldownTimer > 0) {
                // --- MOVIMENTAÇÃO NO CHÃO DURANTE O COOLDOWN ---
                this.jumpCooldownTimer--;

                const playerX = playerPos.x;
                const dx = playerX - this.sprite.position.x;
                const distanceToPlayer = Math.abs(dx);

                if (distanceToPlayer < this.detectionRange) {
                    // Persegue agressivamente no chão (Mais rápido que os normais)
                    this.direction = dx > 0 ? 1 : -1;
                    this.vx = this.direction * 2.5; 
                    this.currentAnimationName = "run";
                } else {
                    // Patrulha
                    if (this.sprite.position.x <= this.patrolMin) {
                        this.direction = 1;
                    } else if (this.sprite.position.x >= this.patrolMax) {
                        this.direction = -1;
                    }
                    this.vx = this.direction * 1.2; 
                    this.currentAnimationName = "run";
                }

                this.flipX = this.direction === -1;
                this.sprite.position.x += this.vx;

                if (this.hitWall) {
                    this.direction *= -1;
                    this.hitWall = false;
                }

                // Ajuste estético (Squash & Stretch)
                this.sprite.scale.set(this.baseWidth + 4, this.baseHeight - 4, 1);

            } else {
                // --- O COOLDOWN ACABOU: EXECUTA O PULO/QUEDA DE BOSS ---
                this.vx = 0; 
                this.currentAnimationName = "idle";

                const playerX = playerPos.x;
                const dx = playerX - this.sprite.position.x;
                const dy = playerPos.y - this.sprite.position.y;
                const distanceToPlayer = Math.abs(dx);

                if (distanceToPlayer < this.detectionRange) {
                    this.direction = dx > 0 ? 1 : -1;

                    if (dy > 60) {
                        // 1. JOGADOR ACIMA: Super Pulo Maciço do Boss
                        this.vy = Math.random() * 2.0 + 16.5; // Pula MUITO alto
                        this.vx = this.direction * 3.0; // Pula rápido para a frente
                        this.jumpCooldownTimer = Math.floor(Math.random() * 40) + 80; 
                    } 
                    else if (dy < -60) {
                        // 2. JOGADOR ABAIXO: Atravessa a plataforma como uma bigorna
                        this.sprite.position.y -= 25; 
                        this.vy = -4.0; // Cai rápido
                        this.vx = this.direction * 2.0; 
                        this.jumpCooldownTimer = Math.floor(Math.random() * 40) + 80; 
                    } 
                    else {
                        // 3. MESMO ANDAR: Pulo de ataque ultra agressivo
                        this.vy = Math.random() * 2 + 10.0; 
                        this.vx = this.direction * (Math.random() * 1.5 + 4.0); // Avanço longo e perigoso
                        this.jumpCooldownTimer = Math.floor(Math.random() * 20) + 15; // Quase não para quieto
                    }
                } else {
                    // Fora da visão: Pulos de patrulha
                    if (this.sprite.position.x <= this.patrolMin) {
                        this.direction = 1;
                    } else if (this.sprite.position.x >= this.patrolMax) {
                        this.direction = -1;
                    } else if (Math.random() < 0.15) {
                        this.direction *= -1; 
                    }

                    this.vy = Math.random() * 3 + 8.5; 
                    this.vx = this.direction * (Math.random() * 1.0 + 1.5); 
                    this.jumpCooldownTimer = Math.floor(Math.random() * 30) + 50; 
                }

                this.flipX = this.direction === -1;
                this.isOnGround = false;
                
                // Força o tamanho base estável imediatamente no voo
                this.sprite.scale.set(this.baseWidth, this.baseHeight, 1);
            }

        } else {
            // ==========================================
            // FASE 2: VOO E MOVIMENTO (No ar)
            // ==========================================
            this.sprite.position.x += this.vx;
            this.currentAnimationName = "run"; 
            
            // Escala travada no ar para manter a hitbox 100% certa com o chão
            this.sprite.scale.set(this.baseWidth, this.baseHeight, 1);

            // Limitador de queda pesada do Boss
            if (this.vy < -14) {
                this.vy = -14; 
            }

            if (this.hitWall) {
                this.vx *= -0.5; 
                this.direction *= -1;
                this.flipX = this.direction === -1;
                this.hitWall = false;
            }
        }
    }

    update(playerPos, platforms, gravity) {
        this.updateBehavior(playerPos);
        this.updatePhysics(platforms, gravity);
        this.updateAnimation();
        

        if (this.sprite && this.sprite.material) {
            // Mantém a cor sombria que combinamos!
            this.sprite.material.color.setHex(0xff0000); 
        }
    }
}