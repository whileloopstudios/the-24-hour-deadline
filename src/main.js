import kaboom from "kaboom";

kaboom({
    font: "sink",
    background: [15, 15, 30],
    touchToMouse: true,
    global: true,
});

const Storage = {
    get(key, fallback) {
        try { return localStorage.getItem(key) || fallback; } 
        catch (e) { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, value); } 
        catch (e) { console.warn("Local storage disabled."); }
    }
};

let playerCharacter = Storage.get('selectedCharacter', 'Zayn');
let difficultyLevel = parseFloat(Storage.get('selectedDifficulty', '1.0'));
let audioEnabled = Storage.get('audioEnabled', 'true') === 'true';
let endlessHighScore = parseInt(Storage.get('endlessHighScore', '0'));

let currentBGM = null;
let currentTrackName = "";

function playMusic(trackName) {
    if (!audioEnabled) return;
    if (currentBGM && currentTrackName === trackName) {
        if (currentBGM.paused) currentBGM.paused = false;
        return;
    }
    if (currentBGM) currentBGM.paused = true;
    
    currentTrackName = trackName;
    currentBGM = play(trackName, { loop: true, volume: 0.4 });
}

function stopMusic() {
    if (currentBGM) currentBGM.paused = true;
}

function toggleAudio(state) {
    audioEnabled = state;
    Storage.set('audioEnabled', state.toString());
    if (!state) stopMusic();
    else if (currentTrackName) playMusic(currentTrackName);
}

function loadGameAssets() {
    loadSprite("Ayesher", "sprites/aysher.png");
    loadSprite("Zayn", "sprites/zayn.png");
    loadSprite("Book", "sprites/book.png");
    loadSprite("Pen", "sprites/pen.png");
    loadSprite("Mobile", "sprites/mobile.png");
    loadSprite("Games", "sprites/games.png");
    loadSprite("Comic", "sprites/comic.png");
    loadSprite("Notification", "sprites/notification.png");
    loadSprite("Evil_Book", "sprites/evil_book.png");
    loadSprite("Monster", "sprites/monster.png");
    loadSprite("Shadow", "sprites/shadow.png");

    loadSprite("Room_BG", "backgrounds/room.jpg");
    loadSprite("Library_BG", "backgrounds/library.jpg");
    loadSprite("Evil_Class_BG", "backgrounds/evil_class.png");
    loadSprite("Menu_BG", "backgrounds/class.jpg"); 
    loadSprite("School_BG", "backgrounds/school.jpg");

    loadSound("bgm_menu", "sounds/bgm_menu.mp3");
    loadSound("bgm_game", "sounds/bgm.mp3");
    loadSound("bgm_horror", "sounds/bgm.mp3");
    loadSound("heal", "sounds/heal.mp3");       
    loadSound("hurt", "sounds/hurt.mp3");       
    loadSound("game-over", "sounds/game-over.mp3");
    loadSound("flip", "sounds/flip.mp3");
}

function centerBackground(spriteName) {
    const bg = add([
        sprite(spriteName),
        pos(width() / 2, height() / 2),
        anchor("center"),
        z(-100)
    ]);
    const scaleFactor = Math.max(width() / bg.width, height() / bg.height);
    bg.scale = vec2(scaleFactor);
    return bg;
}

function createButton(txt, p, action, parent = null) {
    const btnWidth = Math.min(width() * 0.5, 300);
    const btnHeight = 55;
    
    const btnParams = [
        rect(btnWidth, btnHeight, { radius: 12 }),
        pos(p),
        area(),
        scale(1),
        anchor("center"),
        color(255, 255, 255),
        outline(4, rgb(0,0,0)),
        z(1000)
    ];

    const btn = parent ? parent.add(btnParams) : add(btnParams);
    
    btn.add([
        text(txt, { size: 24 }),
        anchor("center"),
        color(0, 0, 0),
    ]);
    
    btn.onUpdate(() => {
        if (btn.isHovering()) {
            const t = time() * 5;
            btn.scale = vec2(1.05 + Math.sin(t) * 0.02);
            btn.color = rgb(220, 230, 255);
            setCursor("pointer");
        } else {
            btn.scale = vec2(1);
            btn.color = rgb(255, 255, 255);
        }
    });
    
    btn.onClick(() => {
        if (audioEnabled) play("flip", { volume: 0.6 });
        action();
    });

    return btn;
}

function createMobileControls(isPausedCheck) {
    const btnSize = Math.min(width() * 0.15, 70);
    const padding = 20;
    let activeDir = vec2(0, 0);

    function addDirBtn(txt, p, dir) {
        const btn = add([
            rect(btnSize, btnSize, { radius: 15 }),
            pos(p),
            area(),
            color(0, 0, 0),
            opacity(0.3),
            anchor("center"),
            fixed(),
            z(100)
        ]);
        
        btn.add([ text(txt, { size: 28 }), anchor("center"), color(255, 255, 255) ]);

        btn.onUpdate(() => {
            if (isPausedCheck && isPausedCheck()) return;
            if (btn.isHovering() && isMouseDown()) {
                activeDir = dir;
                btn.opacity = 0.7;
                btn.scale = vec2(1.1);
            } else {
                btn.opacity = 0.3;
                btn.scale = vec2(1);
            }
        });
    }

    const leftX = padding + btnSize;
    const rightX = width() - padding - btnSize * 1.5;
    const bottomY = height() - padding - btnSize * 0.5;

    addDirBtn("▲", vec2(leftX, bottomY - btnSize * 1.2), vec2(0, -1));
    addDirBtn("▼", vec2(leftX, bottomY), vec2(0, 1));
    addDirBtn("◀", vec2(rightX, bottomY), vec2(-1, 0));
    addDirBtn("▶", vec2(rightX + btnSize * 1.2, bottomY), vec2(1, 0));

    onMouseRelease(() => { activeDir = vec2(0, 0); });

    return { getDirection: () => activeDir };
}

function spawnFloatingText(txt, p, col) {
    add([
        text(txt, { size: 28, font: "sink" }),
        pos(p.x, p.y - 20),
        color(col),
        anchor("center"),
        opacity(1),
        lifespan(1, { fade: 0.5 }),
        move(UP, 80),
        z(200)
    ]);
}

scene("splash", () => {
    const logo = add([
        text("whileLoop Studios", { size: Math.min(width() * 0.08, 48) }),
        pos(width() / 2, height() / 2 - 20),
        anchor("center"),
    ]);

    const startPrompt = add([
        text("Tap anywhere to start", { size: 20 }),
        pos(width() / 2, height() / 2 + 50),
        anchor("center"),
        opacity(1)
    ]);

    onUpdate(() => {
        logo.pos.y = (height() / 2 - 20) + Math.sin(time() * 2) * 8;
        startPrompt.opacity = 0.5 + Math.sin(time() * 5) * 0.5;
    });

    onClick(() => go("main_menu"));
});

scene("main_menu", () => {
    centerBackground("School_BG");
    playMusic("bgm_menu");

    const title = add([
        text("The 24 Hour Deadline", { size: Math.min(width() * 0.07, 42) }),
        pos(width() / 2, height() * 0.20),
        anchor("center"),
        color(255, 255, 255),
        outline(5, rgb(0,0,0))
    ]);

    title.onUpdate(() => {
        title.pos.y = (height() * 0.20) + Math.sin(time() * 2) * 5;
    });

    createButton("Story Mode", vec2(width() / 2, height() * 0.40), () => go("character_select", "story"));
    createButton("Endless Mode", vec2(width() / 2, height() * 0.53), () => go("character_select", "endless"));
    createButton("Preferences", vec2(width() / 2, height() * 0.66), () => go("settings_menu"));
    createButton("Credits", vec2(width() / 2, height() * 0.79), () => go("credits"));
});

scene("settings_menu", () => {
    centerBackground("School_BG");

    add([ text("Settings", { size: 36 }), pos(width() / 2, height() * 0.2), anchor("center"), outline(4, rgb(0,0,0)) ]);

    createButton(`Audio: ${audioEnabled ? "ON" : "OFF"}`, vec2(width() / 2, height() * 0.4), () => {
        toggleAudio(!audioEnabled);
        go("settings_menu"); 
    });

    let diffText = difficultyLevel === 0.8 ? "Easy" : (difficultyLevel === 1.5 ? "Hard" : "Normal");
    createButton(`Difficulty: ${diffText}`, vec2(width() / 2, height() * 0.55), () => {
        if (difficultyLevel === 0.8) difficultyLevel = 1.0;
        else if (difficultyLevel === 1.0) difficultyLevel = 1.5;
        else difficultyLevel = 0.8;
        Storage.set('selectedDifficulty', difficultyLevel.toString());
        go("settings_menu"); 
    });

    createButton("Back", vec2(width() / 2, height() * 0.75), () => go("main_menu"));
});

scene("credits", () => {
    centerBackground("Menu_BG");

    const credits = [
        "Developer: whileLoop Studios",
        "Inspired by: Aspirant: Homework & Distraction",
        "Sound Effects: Pixabay"
    ];

    add([ text("Credits", { size: 40 }), pos(width() / 2, height() * 0.15), anchor("center"), outline(4, rgb(0,0,0)) ]);

    credits.forEach((line, i) => {
        add([
            text(line, { size: Math.min(width() * 0.04, 20) }),
            pos(width() / 2, height() * 0.3 + (i * 45)),
            anchor("center"),
            outline(3, rgb(0,0,0))
        ]);
    });

    createButton("Back", vec2(width() / 2, height() * 0.85), () => go("main_menu"));
});

scene("character_select", (mode) => {
    centerBackground("Menu_BG");

    add([ text("Choose Your Identity", { size: 36 }), pos(width() / 2, height() * 0.2), anchor("center"), outline(4, rgb(0,0,0)) ]);

    createButton("Play as Zayn", vec2(width() / 2, height() * 0.45), () => {
        playerCharacter = "Zayn";
        Storage.set('selectedCharacter', "Zayn");
        go(mode === "endless" ? "play_endless" : "cutscene_intro");
    });

    createButton("Play as Ayesher", vec2(width() / 2, height() * 0.6), () => {
        playerCharacter = "Ayesher";
        Storage.set('selectedCharacter', "Ayesher");
        go(mode === "endless" ? "play_endless" : "cutscene_intro");
    });
    
    createButton("Back", vec2(width() / 2, height() * 0.8), () => go("main_menu"));
});

scene("cutscene", ({ script, nextScene, bgImage, musicTrack }) => {
    const bg = centerBackground(bgImage);
    bg.opacity = 0.5; 
    if (musicTrack) playMusic(musicTrack);

    let dialogIndex = 0;

    add([
        rect(width() - 40, 160, { radius: 15 }),
        pos(20, height() - 180),
        color(0, 0, 0),
        opacity(0.85),
    ]);

    const dialogText = add([
        text(script[dialogIndex], { size: 24, width: width() - 80, lineSpacing: 8 }),
        pos(40, height() - 150),
    ]);

    const promptText = add([
        text("(Tap or Space to continue)", { size: 14 }),
        pos(width() - 260, height() - 40),
        color(200, 200, 200)
    ]);

    promptText.onUpdate(() => {
        promptText.opacity = 0.3 + Math.sin(time() * 6) * 0.7;
    });

    function nextLine() {
        if (audioEnabled) play("flip", { volume: 0.4 });
        dialogIndex++;
        if (dialogIndex < script.length) {
            dialogText.text = script[dialogIndex];
        } else {
            go(nextScene);
        }
    }

    onKeyPress("space", nextLine);
    onClick(nextLine);
});

scene("cutscene_intro", () => {
    go("cutscene", {
        bgImage: "Room_BG",
        musicTrack: "bgm_game",
        script: [
            "Friend: Hey! Are you ready for the final exam tomorrow?",
            `${playerCharacter}: Wait... THE EXAM IS TOMORROW?!`,
            "Friend: Uh, yeah. Worth 50% of our grade. Good luck!",
            `${playerCharacter}: I haven't studied! I need to focus right now!`,
            "(Tip: Avoid distractions. Collect books & pens to absorb knowledge!)"
        ],
        nextScene: "level_bedroom"
    });
});

scene("cutscene_library", () => {
    go("cutscene", {
        bgImage: "Library_BG",
        musicTrack: "bgm_game",
        script: [
            `${playerCharacter}: It's getting too noisy in my room.`,
            `${playerCharacter}: I need absolute silence. Time to hit the library.`,
            "(Tip: Distractions fall much faster here. Stay sharp!)"
        ],
        nextScene: "level_library"
    });
});

scene("cutscene_exam", () => {
    go("cutscene", {
        bgImage: "Evil_Class_BG",
        musicTrack: "bgm_horror",
        script: [
            `*Alarm ringing loudly*`,
            `${playerCharacter}: Oh no, it's time. I'm at the exam hall.`,
            `${playerCharacter}: Wait... why is it so cold in here?`,
            `${playerCharacter}: Did that shadow just move?!`,
            "(Tip: Survive the horrors of the exam hall. Don't lose your focus!)"
        ],
        nextScene: "level_exam"
    });
});

scene("play_level", ({ bg, goodItems, badItems, scoreTarget, nextScene, speedMulti }) => {
    setupGameplay(bg, goodItems, badItems, scoreTarget, nextScene, speedMulti, false);
});

scene("play_endless", () => {
    const allGood = ["Book", "Pen"];
    const allBad = ["Mobile", "Games", "Comic", "Notification", "Evil_Book", "Monster", "Shadow"];
    setupGameplay("Library_BG", allGood, allBad, Infinity, null, 1.0, true);
});

function setupGameplay(bg, goodItems, badItems, scoreTarget, nextScene, speedMulti, isEndless) {
    centerBackground(bg);
    playMusic("bgm_game");
    
    let isPaused = false;
    let isGameOver = false;
    let currentScore = 0;
    
    const baseSpeed = Math.min(width(), height()); 
    const SPEED = baseSpeed * 1.5; 
    let baseEnemySpeed = (baseSpeed * 0.4) * speedMulti * difficultyLevel;

    if (bg === "Evil_Class_BG") {
        add([ rect(width(), height()), color(0, 0, 50), opacity(0.3), fixed(), z(-90) ]);
    }

    const mobileUI = createMobileControls(() => isPaused);
    
    const playerScale = Math.min(width(), height()) / 2000; 
    const itemScale = Math.min(width(), height()) / 3000;

    const player = add([
        sprite(playerCharacter),
        pos(width() / 2, height() - 150),
        area({ shape: new Rect(vec2(0), 105, 105) }), 
        scale(playerScale),
        anchor("center")
    ]);

    add([ rect(width(), 60), pos(0,0), color(0,0,0), opacity(0.7), fixed(), z(100) ]);

    const scoreText = isEndless 
        ? `Score: 0 | High: ${endlessHighScore}` 
        : `Knowledge: 0 / ${scoreTarget}`;

    const scoreLabel = add([
        text(scoreText, { size: 28 }),
        pos(20, 16),
        color(255, 255, 255),
        fixed(),
        z(101)
    ]);

    const pauseMenu = add([
        rect(width(), height()),
        color(0, 0, 0),
        opacity(0.85),
        fixed(),
        z(900),
    ]);
    pauseMenu.hidden = true;

    pauseMenu.add([ text("PAUSED", { size: 48 }), anchor("center"), pos(width()/2, height()*0.3) ]);
    createButton("Resume", vec2(width()/2, height()*0.5), togglePause, pauseMenu);
    createButton("Quit to Menu", vec2(width()/2, height()*0.65), () => go("main_menu"), pauseMenu);

    const hamburgerBtn = add([
        text("☰", { size: 36 }),
        pos(width() - 40, 30),
        anchor("center"),
        area(),
        color(255, 255, 255),
        fixed(),
        z(101)
    ]);

    hamburgerBtn.onClick(togglePause);
    onKeyPress("p", togglePause);
    onKeyPress("escape", togglePause);

    function togglePause() {
        if (isGameOver) return;
        isPaused = !isPaused;
        pauseMenu.hidden = !isPaused;
        if (audioEnabled && !isPaused) play("flip");
    }

    onUpdate(() => {
        if (isGameOver || isPaused) return;

        const dir = mobileUI.getDirection();
        let dx = dir.x;
        let dy = dir.y;

        if (isKeyDown("left") || isKeyDown("a")) dx = -1;
        if (isKeyDown("right") || isKeyDown("d")) dx = 1;
        if (isKeyDown("up") || isKeyDown("w")) dy = -1;
        if (isKeyDown("down") || isKeyDown("s")) dy = 1;

        if (dx !== 0 || dy !== 0) {
            player.move(dx * SPEED, dy * SPEED);
        }

        if (player.pos.x < 40) player.pos.x = 40;
        if (player.pos.x > width() - 40) player.pos.x = width() - 40;
        if (player.pos.y < 90) player.pos.y = 90;
        if (player.pos.y > height() - 40) player.pos.y = height() - 40;
    });

    const spawnTimer = loop(1 / (difficultyLevel * speedMulti), () => {
        if (isGameOver || isPaused) return;

        let currentEnemySpeed = baseEnemySpeed;
        if (isEndless) {
            currentEnemySpeed += (currentScore * 2.5);
        }

        const badType = choose(badItems);
        add([
            sprite(badType),
            pos(rand(50, width() - 50), -50),
            area(),
            scale(itemScale),
            "danger",
            { speed: currentEnemySpeed + rand(-50, 50) }
        ]);

        if (chance(0.65)) {
            const goodType = choose(goodItems);
            add([
                sprite(goodType),
                pos(rand(50, width() - 50), -50),
                area(),
                scale(itemScale),
                "study",
                { speed: currentEnemySpeed }
            ]);
        }
    });

    onUpdate("danger", (d) => {
        if (isPaused) return;
        d.move(0, d.speed);
        d.angle += dt() * 50; 
        if (d.pos.y > height() + 100) destroy(d);
    });

    onUpdate("study", (s) => {
        if (isPaused) return;
        s.move(0, s.speed);
        if (s.pos.y > height() + 100) destroy(s);
    });

    player.onCollide("danger", (d) => {
        if (isGameOver || isPaused) return;
        shake(25); 
        if (audioEnabled) play("hurt", { volume: 0.8 });
        
        spawnFloatingText("-2 Focus", d.pos, rgb(255, 50, 50));
        destroy(d);
        
        currentScore -= 2; 
        updateScoreDisplay();
        
        scoreLabel.color = rgb(255, 50, 50);
        wait(0.2, () => scoreLabel.color = rgb(255, 255, 255));

        if (currentScore < 0) {
            triggerGameOver("Distractions took over your mind!");
        }
    });

    player.onCollide("study", (s) => {
        if (isGameOver || isPaused) return;
        if (audioEnabled) play("heal", { volume: 0.8 });
        
        spawnFloatingText("+1 Intel", s.pos, rgb(50, 255, 50));
        destroy(s);
        
        currentScore += 1;
        updateScoreDisplay();
        
        scoreLabel.color = rgb(50, 255, 50);
        scoreLabel.scale = vec2(1.2);
        wait(0.15, () => {
            scoreLabel.color = rgb(255, 255, 255);
            scoreLabel.scale = vec2(1);
        });

        if (!isEndless && currentScore >= scoreTarget) {
            isGameOver = true;
            spawnTimer.cancel();
            go(nextScene);
        }
    });

    function updateScoreDisplay() {
        if (isEndless) {
            if (currentScore > endlessHighScore) {
                endlessHighScore = currentScore;
                Storage.set('endlessHighScore', endlessHighScore.toString());
            }
            scoreLabel.text = `Score: ${Math.max(0, currentScore)} | High: ${endlessHighScore}`;
        } else {
            scoreLabel.text = `Knowledge: ${Math.max(0, currentScore)} / ${scoreTarget}`;
        }
    }

    function triggerGameOver(reason) {
        isGameOver = true;
        spawnTimer.cancel();
        if (audioEnabled) play("game-over", { volume: 0.8 });
        destroy(player);
        
        for (let i = 0; i < 10; i++) {
            add([
                rect(20, 20),
                pos(player.pos),
                color(255, 50, 50),
                move(choose([UP, DOWN, LEFT, RIGHT, vec2(1,1), vec2(-1,-1)]), rand(100, 300)),
                lifespan(0.5, { fade: 0.5 })
            ]);
        }
        
        wait(1, () => go("game_over", { reason: reason, mode: isEndless ? "endless" : "story" }));
    }
}

scene("level_bedroom", () => go("play_level", { bg: "Room_BG", goodItems: ["Book"], badItems: ["Mobile", "Games"], scoreTarget: 10, nextScene: "cutscene_library", speedMulti: 1.0 }));
scene("level_library", () => go("play_level", { bg: "Library_BG", goodItems: ["Book", "Pen"], badItems: ["Comic", "Notification"], scoreTarget: 15, nextScene: "cutscene_exam", speedMulti: 1.3 }));
scene("level_exam", () => go("play_level", { bg: "Evil_Class_BG", goodItems: ["Book", "Pen"], badItems: ["Evil_Book", "Monster", "Shadow"], scoreTarget: 20, nextScene: "victory", speedMulti: 1.8 }));

scene("game_over", ({ reason, mode }) => {
    centerBackground("Evil_Class_BG");
    stopMusic();

    add([ text("SESSION ENDED", { size: 48 }), pos(width() / 2, height() * 0.3), anchor("center"), color(255, 50, 50), outline(5, rgb(0,0,0)) ]);
    add([ text(reason, { size: 24 }), pos(width() / 2, height() * 0.45), anchor("center"), outline(3, rgb(0,0,0)) ]);

    createButton("Try Again", vec2(width() / 2, height() * 0.65), () => {
        go(mode === "endless" ? "play_endless" : "character_select");
    });
    createButton("Main Menu", vec2(width() / 2, height() * 0.8), () => go("main_menu"));
});

scene("victory", () => {
    centerBackground("School_BG");
    stopMusic();
    if (audioEnabled) play("heal", { volume: 1.0 });

    const title = add([ text("EXAM PASSED!", { size: 54 }), pos(width() / 2, height() * 0.3), anchor("center"), color(50, 255, 50), outline(5, rgb(0,0,0)) ]);
    add([ text("You survived the 24-hour deadline.", { size: 24 }), pos(width() / 2, height() * 0.45), anchor("center"), outline(3, rgb(0,0,0)) ]);

    title.onUpdate(() => { title.scale = vec2(1 + Math.sin(time() * 4) * 0.05); });

    createButton("Play Again", vec2(width() / 2, height() * 0.65), () => go("character_select"));
    createButton("Main Menu", vec2(width() / 2, height() * 0.8), () => go("main_menu"));
});

loadGameAssets();
go("splash");