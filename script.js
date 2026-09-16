/**
 * 化学元素周期表前40号数据字典
 * 1-20为基础元素，21-40补充为常见金属与非金属
 */
const ELEMENTS_DATA = [
  { num: 1, symbol: 'H', name: '氢', pinyin: 'qīng' },
  { num: 2, symbol: 'He', name: '氦', pinyin: 'hài' },
  { num: 3, symbol: 'Li', name: '锂', pinyin: 'lǐ' },
  { num: 4, symbol: 'Be', name: '铍', pinyin: 'pí' },
  { num: 5, symbol: 'B', name: '硼', pinyin: 'péng' },
  { num: 6, symbol: 'C', name: '碳', pinyin: 'tàn' },
  { num: 7, symbol: 'N', name: '氮', pinyin: 'dàn' },
  { num: 8, symbol: 'O', name: '氧', pinyin: 'yǎng' },
  { num: 9, symbol: 'F', name: '氟', pinyin: 'fú' },
  { num: 10, symbol: 'Ne', name: '氖', pinyin: 'nǎi' },
  { num: 11, symbol: 'Na', name: '钠', pinyin: 'nà' },
  { num: 12, symbol: 'Mg', name: '镁', pinyin: 'měi' },
  { num: 13, symbol: 'Al', name: '铝', pinyin: 'lǚ' },
  { num: 14, symbol: 'Si', name: '硅', pinyin: 'guī' },
  { num: 15, symbol: 'P', name: '磷', pinyin: 'lín' },
  { num: 16, symbol: 'S', name: '硫', pinyin: 'liú' },
  { num: 17, symbol: 'Cl', name: '氯', pinyin: 'lǜ' },
  { num: 18, symbol: 'Ar', name: '氩', pinyin: 'yà' },
  { num: 19, symbol: 'K', name: '钾', pinyin: 'jiǎ' },
  { num: 20, symbol: 'Ca', name: '钙', pinyin: 'gài' },
  { num: 21, symbol: 'Sc', name: '钪', pinyin: 'kàng' },
  { num: 22, symbol: 'Ti', name: '钛', pinyin: 'tài' },
  { num: 23, symbol: 'V', name: '钒', pinyin: 'fán' },
  { num: 24, symbol: 'Cr', name: '铬', pinyin: 'gè' },
  { num: 25, symbol: 'Mn', name: '锰', pinyin: 'měng' },
  { num: 26, symbol: 'Fe', name: '铁', pinyin: 'tiě' },
  { num: 27, symbol: 'Co', name: '钴', pinyin: 'gǔ' },
  { num: 28, symbol: 'Ni', name: '镍', pinyin: 'niè' },
  { num: 29, symbol: 'Cu', name: '铜', pinyin: 'tóng' },
  { num: 30, symbol: 'Zn', name: '锌', pinyin: 'xīn' },
  { num: 31, symbol: 'Ga', name: '镓', pinyin: 'jiā' },
  { num: 32, symbol: 'Ge', name: '锗', pinyin: 'zhě' },
  { num: 33, symbol: 'As', name: '砷', pinyin: 'shēn' },
  { num: 34, symbol: 'Se', name: '硒', pinyin: 'xī' },
  { num: 35, symbol: 'Br', name: '溴', pinyin: 'xiù' },
  { num: 36, symbol: 'Kr', name: '氪', pinyin: 'kè' },
  { num: 37, symbol: 'Rb', name: '铷', pinyin: 'rú' },
  { num: 38, symbol: 'Sr', name: '锶', pinyin: 'sī' },
  { num: 39, symbol: 'Y', name: '钇', pinyin: 'yǐ' },
  { num: 40, symbol: 'Zr', name: '锆', pinyin: 'gào' }
];

// 游戏常量
const TOTAL_TIME = 120; // 120秒限时
const PAIRS_PER_ROUND = 10; // 每次展示10对
const POINTS_PER_PAIR = 10; // 每对一个加10分

// 状态对象
const state = {
  isPlaying: false,
  timeLeft: TOTAL_TIME,
  timerInterval: null,
  score: 0,
  round: 1,
  matchedPairsInRound: 0,
  totalMatchedPairs: 0,
  totalAttempts: 0,
  selectedBall: null, // 当前选中的球体 { id, elementId, type, el }
  isUseTop40: false, // 是否包含前40个化学元素
  currentRoundBalls: [],
  isChecking: false // 防止连续狂点
};

// DOM 元素引用
const dom = {
  timerValue: document.getElementById('timerValue'),
  timerCard: document.querySelector('.timer-card'),
  scoreValue: document.getElementById('scoreValue'),
  elementRangeCheckbox: document.getElementById('elementRangeCheckbox'),
  toggleLabel: document.getElementById('toggleLabel'),
  startBtn: document.getElementById('startBtn'),
  startBtnIcon: document.getElementById('startBtnIcon'),
  startBtnText: document.getElementById('startBtnText'),
  resetBtn: document.getElementById('resetBtn'),
  gameBoard: document.getElementById('gameBoard'),
  startOverlay: document.getElementById('startOverlay'),
  overlayStartBtn: document.getElementById('overlayStartBtn'),
  roundIndex: document.getElementById('roundIndex'),
  matchedPairsCount: document.getElementById('matchedPairsCount'),
  comboIndicator: document.getElementById('comboIndicator'),
  resultModal: document.getElementById('resultModal'),
  finalScore: document.getElementById('finalScore'),
  finalMatched: document.getElementById('finalMatched'),
  finalAccuracy: document.getElementById('finalAccuracy'),
  evaluationText: document.getElementById('evaluationText'),
  modalRestartBtn: document.getElementById('modalRestartBtn')
};

// 简易 Web Audio 声音合成系统
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 点击选择音效
  playSelect() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // 忽略声音异常
    }
  }

  // 成功消除音效
  playMatch() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // 错误抖动音效
  playMismatch() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // 结算胜利音效
  playGameOver() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    } catch (e) {}
  }
}

const sounds = new SoundEffects();

/**
 * 初始化游戏与事件绑定
 */
function init() {
  bindEvents();
  renderInitialPreview();
  updateUI();
}

/**
 * 绑定界面事件
 */
function bindEvents() {
  // 开始/重开按钮
  dom.startBtn.addEventListener('click', toggleGamePlay);
  dom.overlayStartBtn.addEventListener('click', startGame);
  dom.resetBtn.addEventListener('click', resetGame);
  dom.modalRestartBtn.addEventListener('click', () => {
    dom.resultModal.classList.remove('active');
    startGame();
  });

  // 元素范围选择切换
  dom.elementRangeCheckbox.addEventListener('change', (e) => {
    state.isUseTop40 = e.target.checked;
    if (state.isUseTop40) {
      dom.toggleLabel.textContent = '常见化学元素(前40号)';
    } else {
      dom.toggleLabel.textContent = '基础元素(1~20号)';
    }
    // 若当前未在游戏中或刚重置，重新展示发牌预览
    if (!state.isPlaying) {
      renderInitialPreview();
    }
  });
}

/**
 * 切换游戏开始与暂停
 */
function toggleGamePlay() {
  if (!state.isPlaying) {
    startGame();
  } else {
    // 游戏中再次点击为暂停或重新发牌
    resetGame();
  }
}

/**
 * 正式开始游戏并启动计时器
 */
function startGame() {
  sounds.init();
  state.isPlaying = true;
  state.score = 0;
  state.round = 1;
  state.matchedPairsInRound = 0;
  state.totalMatchedPairs = 0;
  state.totalAttempts = 0;
  state.timeLeft = TOTAL_TIME;
  state.selectedBall = null;
  state.isChecking = false;

  // 隐藏未开始遮罩
  dom.startOverlay.classList.add('hidden');
  dom.resultModal.classList.remove('active');

  // 更新按键状态
  dom.startBtnText.textContent = '重新开始';
  dom.startBtnIcon.textContent = '🔄';

  // 开始计时
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(handleTick, 1000);

  // 发放第一轮小球（4行5列共20个球）
  dealNewRound();
  updateUI();
}

/**
 * 每秒计时
 */
function handleTick() {
  state.timeLeft--;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endGame();
  }
  updateUI();
}

/**
 * 结束游戏
 */
function endGame() {
  state.isPlaying = false;
  clearInterval(state.timerInterval);
  sounds.playGameOver();

  // 准备结算数据
  const accuracy = state.totalAttempts > 0
    ? Math.round((state.totalMatchedPairs / state.totalAttempts) * 100)
    : 100;

  dom.finalScore.textContent = state.score;
  dom.finalMatched.textContent = state.totalMatchedPairs;
  dom.finalAccuracy.textContent = `${accuracy}%`;

  // 评价文案
  let evaluation = '继续加油！化学反应正在酝酿中～';
  if (state.score >= 150) {
    evaluation = '🌟 卓越！你是当之无愧的化学大宗师！';
  } else if (state.score >= 100) {
    evaluation = '🎉 太棒了！化学元素周期表已烂熟于心！';
  } else if (state.score >= 50) {
    evaluation = '👍 表现优秀！对常见化学元素掌握很熟练！';
  }
  dom.evaluationText.textContent = evaluation;

  // 弹出结算面板
  dom.resultModal.classList.add('active');

  // 恢复按键文本
  dom.startBtnText.textContent = '开始游戏';
  dom.startBtnIcon.textContent = '▶';
}

/**
 * 重置游戏回到初始未开始状态
 */
function resetGame() {
  state.isPlaying = false;
  clearInterval(state.timerInterval);
  state.timeLeft = TOTAL_TIME;
  state.score = 0;
  state.round = 1;
  state.matchedPairsInRound = 0;
  state.totalMatchedPairs = 0;
  state.totalAttempts = 0;
  state.selectedBall = null;
  state.isChecking = false;

  dom.startOverlay.classList.remove('hidden');
  dom.startBtnText.textContent = '开始游戏';
  dom.startBtnIcon.textContent = '▶';
  dom.comboIndicator.textContent = '准备就绪';

  renderInitialPreview();
  updateUI();
}

/**
 * 抽取并派发新一轮 10 对小球（4x5=20个）
 */
function dealNewRound() {
  state.matchedPairsInRound = 0;
  state.selectedBall = null;
  state.isChecking = false;

  // 依据当前选项确定抽取范围
  // 基础为 1~20 号，开启选项后为前 40 号
  const poolMax = state.isUseTop40 ? 40 : 20;
  const availableElements = ELEMENTS_DATA.slice(0, poolMax);

  // 随机不重复选出 10 个元素
  const shuffledElements = [...availableElements].sort(() => 0.5 - Math.random());
  const selectedElements = shuffledElements.slice(0, PAIRS_PER_ROUND);

  // 分别构造 10 个符号球 和 10 个名称球
  const ballItems = [];
  selectedElements.forEach((elem, index) => {
    // 元素符号球 (浅绿色底)
    ballItems.push({
      uniqueId: `sym_${elem.num}_${Date.now()}_${index}`,
      elementNum: elem.num,
      symbol: elem.symbol,
      name: elem.name,
      pinyin: elem.pinyin,
      type: 'symbol' // 'symbol' | 'name'
    });

    // 元素名称球 (浅蓝色底)
    ballItems.push({
      uniqueId: `name_${elem.num}_${Date.now()}_${index}`,
      elementNum: elem.num,
      symbol: elem.symbol,
      name: elem.name,
      pinyin: elem.pinyin,
      type: 'name'
    });
  });

  // 打乱 20 个球在 4x5 网格中的顺序
  shuffleArray(ballItems);
  state.currentRoundBalls = ballItems;

  renderBoard(ballItems);
}

/**
 * 洗牌算法 (Fisher-Yates Shuffle)
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * 渲染小球到 4x5 网格主板
 */
function renderBoard(ballItems) {
  dom.gameBoard.innerHTML = '';

  ballItems.forEach((item, index) => {
    const cell = document.createElement('div');
    cell.className = 'ball-cell';

    const ball = document.createElement('div');
    ball.className = `ball ${item.type === 'symbol' ? 'type-symbol' : 'type-name'}`;
    ball.dataset.uniqueId = item.uniqueId;
    ball.dataset.elementNum = item.elementNum;
    ball.dataset.type = item.type;

    if (item.type === 'symbol') {
      // 元素符号球：主字为英文符号，带角标原子序号
      ball.innerHTML = `
        <span class="ball-atomic-num">${item.elementNum}</span>
        <span class="ball-symbol-text">${item.symbol}</span>
      `;
    } else {
      // 元素名称球：主字为汉字名称，带拼音注音
      ball.innerHTML = `
        <span class="ball-pinyin-text">${item.pinyin}</span>
        <span class="ball-name-text">${item.name}</span>
      `;
    }

    ball.addEventListener('click', () => handleBallClick(ball, item));
    cell.appendChild(ball);
    dom.gameBoard.appendChild(cell);
  });
}

/**
 * 初始待机预览渲染
 */
function renderInitialPreview() {
  const poolMax = state.isUseTop40 ? 40 : 20;
  const sample = ELEMENTS_DATA.slice(0, poolMax).slice(0, 10);
  const items = [];
  sample.forEach((e) => {
    items.push({ elementNum: e.num, symbol: e.symbol, name: e.name, pinyin: e.pinyin, type: 'symbol' });
    items.push({ elementNum: e.num, symbol: e.symbol, name: e.name, pinyin: e.pinyin, type: 'name' });
  });
  shuffleArray(items);
  renderBoard(items);
}

/**
 * 处理小球点击交互
 */
function handleBallClick(ballEl, item) {
  // 如果游戏未开始，震动或提醒玩家点击开始
  if (!state.isPlaying) {
    dom.startOverlay.classList.remove('hidden');
    return;
  }

  // 如果正在检查匹配中或小球已消除，不可点击
  if (state.isChecking || ballEl.classList.contains('eliminated')) {
    return;
  }

  sounds.playSelect();

  // 1. 如果点击的是当前已选中的球，取消选中
  if (state.selectedBall && state.selectedBall.uniqueId === item.uniqueId) {
    ballEl.classList.remove('selected');
    state.selectedBall = null;
    return;
  }

  // 2. 如果之前还没选中球，选中当前球
  if (!state.selectedBall) {
    ballEl.classList.add('selected');
    state.selectedBall = {
      uniqueId: item.uniqueId,
      elementNum: item.elementNum,
      type: item.type,
      el: ballEl
    };
    return;
  }

  // 3. 如果点击了同类型的球（如两个都是名称，或两个都是符号），直接改选新球
  if (state.selectedBall.type === item.type) {
    state.selectedBall.el.classList.remove('selected');
    ballEl.classList.add('selected');
    state.selectedBall = {
      uniqueId: item.uniqueId,
      elementNum: item.elementNum,
      type: item.type,
      el: ballEl
    };
    return;
  }

  // 4. 一名称一符号，进行配对验证！
  const first = state.selectedBall;
  const second = {
    uniqueId: item.uniqueId,
    elementNum: item.elementNum,
    type: item.type,
    el: ballEl
  };

  ballEl.classList.add('selected');
  state.isChecking = true;
  state.totalAttempts++;

  const isMatched = first.elementNum === second.elementNum;

  if (isMatched) {
    // === 配对成功 ===
    sounds.playMatch();
    state.score += POINTS_PER_PAIR;
    state.matchedPairsInRound++;
    state.totalMatchedPairs++;

    first.el.classList.remove('selected');
    second.el.classList.remove('selected');

    first.el.classList.add('matched-success');
    second.el.classList.add('matched-success');

    dom.comboIndicator.textContent = `消除了「${first.elementNum}号元素」+10分! ✨`;

    setTimeout(() => {
      first.el.classList.add('eliminated');
      second.el.classList.add('eliminated');
      first.el.classList.remove('matched-success');
      second.el.classList.remove('matched-success');

      state.selectedBall = null;
      state.isChecking = false;

      // 判断本轮 10 对是否全部消除完
      if (state.matchedPairsInRound >= PAIRS_PER_ROUND) {
        state.round++;
        dom.comboIndicator.textContent = `🎉 太棒了！完成第 ${state.round - 1} 轮，新元素已就位！`;
        setTimeout(() => {
          dealNewRound();
        }, 400);
      }
      updateUI();
    }, 400);

  } else {
    // === 配对失败 (错了不减分) ===
    sounds.playMismatch();
    first.el.classList.add('mismatch-shake');
    second.el.classList.add('mismatch-shake');

    dom.comboIndicator.textContent = `符号与名称不匹配，再试一次～`;

    setTimeout(() => {
      first.el.classList.remove('mismatch-shake', 'selected');
      second.el.classList.remove('mismatch-shake', 'selected');
      state.selectedBall = null;
      state.isChecking = false;
    }, 450);
  }

  updateUI();
}

/**
 * 更新界面指示与数值显示
 */
function updateUI() {
  // 倒计时
  dom.timerValue.innerHTML = `${state.timeLeft}<span class="card-unit">秒</span>`;
  if (state.timeLeft <= 20 && state.isPlaying) {
    dom.timerCard.classList.add('warning');
  } else {
    dom.timerCard.classList.remove('warning');
  }

  // 得分
  dom.scoreValue.innerHTML = `${state.score}<span class="card-unit">分</span>`;

  // 底部状态
  dom.roundIndex.textContent = state.round;
  dom.matchedPairsCount.textContent = state.matchedPairsInRound;
}

// 页面加载完成后启动
window.addEventListener('DOMContentLoaded', init);
