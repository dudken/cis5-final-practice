const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const aiToggle = document.getElementById('aiToggle');

let board = Array(9).fill('');
let current = 'X';
let active = true;

function render(){
  const cells = document.querySelectorAll('.cell');
  cells.forEach((el,i)=>{
    el.textContent = board[i];
    el.classList.toggle('x', board[i]==='X');
    el.classList.toggle('o', board[i]==='O');
    el.disabled = !active || board[i] !== '';
    el.classList.remove('win');
  });
}

function updateStatus(text){ statusEl.textContent = text; }

function checkWin(player){
  return WIN_COMBOS.find(combo => combo.every(i => board[i]===player));
}

function checkTie(){ return board.every(cell => cell!==''); }

function endGame(winner, combo){
  active = false;
  if(winner){
    updateStatus(`Player ${winner} wins!`);
    combo.forEach(i => document.querySelector(`.cell[data-index="${i}"]`).classList.add('win'));
  } else {
    updateStatus('Tie game.');
  }
  render();
}

function aiMove(){
  // simple AI: choose winning move, block, else random
  if(!active) return;
  // try to win
  for(const i of availableMoves()){
    board[i] = 'O';
    if(checkWin('O')){ render(); return finishAfterDelay(); }
    board[i] = '';
  }
  // block X
  for(const i of availableMoves()){
    board[i] = 'X';
    if(checkWin('X')){ board[i] = 'O'; render(); return finishAfterDelay(); }
    board[i] = '';
  }
  // pick center, corners, then sides
  const preferred = [4,0,2,6,8,1,3,5,7];
  const pick = preferred.find(i => board[i]==='');
  if(pick!==undefined){ board[pick] = 'O'; render(); return finishAfterDelay(); }
}

function finishAfterDelay(){
  const winner = checkWin('O');
  if(winner) return endGame('O', winner);
  if(checkTie()) return endGame(null);
  current = 'X';
  updateStatus(`Player ${current}'s turn`);
}

function availableMoves(){ return board.map((v,i)=> v===''?i:null).filter(v=>v!==null); }

boardEl.addEventListener('click', (e)=>{
  if(!active) return;
  const cell = e.target.closest('.cell');
  if(!cell) return;
  const idx = Number(cell.dataset.index);
  if(board[idx] !== '') return;
  board[idx] = current;
  const winCombo = checkWin(current);
  if(winCombo) return endGame(current, winCombo);
  if(checkTie()) return endGame(null);
  // switch
  current = current === 'X' ? 'O' : 'X';
  updateStatus(`Player ${current}'s turn`);
  render();

  // if AI enabled and it's O's turn
  if(aiToggle.checked && current === 'O' && active){
    // small delay for UX
    setTimeout(()=>aiMove(), 250);
  }
});

restartBtn.addEventListener('click', ()=>{
  board = Array(9).fill(''); current = 'X'; active = true;
  updateStatus(`Player ${current}'s turn`);
  render();
});

// keyboard support: numbers 1-9
window.addEventListener('keydown', (e)=>{
  if(!active) return;
  const key = e.key;
  if(key >= '1' && key <= '9'){
    const idx = Number(key)-1;
    const el = document.querySelector(`.cell[data-index="${idx}"]`);
    el && el.click();
  }
});

render();
