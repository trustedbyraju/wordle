document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const keyboard = document.getElementById('keyboard');
    const toast = document.getElementById('toast');
    const themeBtn = document.getElementById('theme-btn');

    let targetWord = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
    let currentGuess = '';
    let guesses = [];
    let gameOver = false;

    // Initialize Board
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        board.appendChild(row);
    }

    // Initialize Keyboard
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];

    keys.forEach(rowKeys => {
        const row = document.createElement('div');
        row.className = 'keyboard-row';
        rowKeys.forEach(key => {
            const btn = document.createElement('button');
            btn.textContent = key;
            btn.className = 'key';
            if (key === 'ENTER' || key === '⌫') btn.classList.add('large');
            btn.addEventListener('click', () => handleInput(key));
            row.appendChild(btn);
        });
        keyboard.appendChild(row);
    });

    function handleInput(key) {
        if (gameOver) return;

        if (key === 'ENTER') {
            submitGuess();
        } else if (key === '⌫' || key === 'BACKSPACE') {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
        } else if (/^[A-Z]$/.test(key.toUpperCase()) && currentGuess.length < 5) {
            currentGuess += key.toUpperCase();
            updateBoard();
        }
    }

    function updateBoard() {
        const row = board.children[guesses.length];
        for (let i = 0; i < 5; i++) {
            const tile = row.children[i];
            tile.textContent = currentGuess[i] || '';
            tile.classList.toggle('pop', !!currentGuess[i]);
        }
    }

    function submitGuess() {
        if (currentGuess.length !== 5) {
            showToast('Not enough letters');
            return;
        }

        if (!VALID_GUESSES.includes(currentGuess.toLowerCase())) {
            showToast('Not in word list');
            return;
        }

        const row = board.children[guesses.length];
        const result = checkGuess(currentGuess, targetWord);
        
        // Animate tiles
        for (let i = 0; i < 5; i++) {
            const tile = row.children[i];
            tile.setAttribute('data-state', result[i]);
            updateKeyColor(currentGuess[i], result[i]);
        }

        guesses.push(currentGuess);
        
        if (currentGuess === targetWord) {
            showToast('Splendid!');
            gameOver = true;
        } else if (guesses.length === 6) {
            showToast(`Game Over! Word was: ${targetWord}`);
            gameOver = true;
        }

        currentGuess = '';
    }

    function checkGuess(guess, target) {
        const result = Array(5).fill('absent');
        const targetArr = target.split('');
        const guessArr = guess.split('');

        // First pass: Correct positions
        for (let i = 0; i < 5; i++) {
            if (guessArr[i] === targetArr[i]) {
                result[i] = 'correct';
                targetArr[i] = null;
                guessArr[i] = null;
            }
        }

        // Second pass: Present but wrong position
        for (let i = 0; i < 5; i++) {
            if (guessArr[i] && targetArr.includes(guessArr[i])) {
                result[i] = 'present';
                targetArr[targetArr.indexOf(guessArr[i])] = null;
            }
        }

        return result;
    }

    function updateKeyColor(letter, state) {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            if (key.textContent === letter) {
                const currentState = key.getAttribute('data-state');
                if (state === 'correct' || (state === 'present' && currentState !== 'correct') || (!currentState)) {
                    key.setAttribute('data-state', state);
                }
            }
        });
    }

    function showToast(message) {
        toast.textContent = message;
        toast.style.opacity = 1;
        setTimeout(() => toast.style.opacity = 0, 2000);
    }

    // Physical Keyboard Support
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleInput('ENTER');
        else if (e.key === 'Backspace') handleInput('⌫');
        else handleInput(e.key.toUpperCase());
    });

    // Theme Toggle
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
});
