// View
const View = (() => {
  const dom = {
    board: "#board",
    score: "#score",
    timer: "#timer",
    startBtn: "#start-btn",
  };

  function renderBoard() {
    const board = document.querySelector(dom.board);
    board.innerHTML = Array(12)
      .fill(0)
      .map((_, i) => `<div class="hole" data-id="${i}"></div>`)
      .join("");
  }

  function showMole(id) {
    const hole = document.querySelector(`.hole[data-id="${id}"]`);
    if (hole && !hole.querySelector("img")) {
      hole.innerHTML = `<img src="mole.jpeg"/>`;
    }
  }

  function hideMole(id) {
    const hole = document.querySelector(`.hole[data-id="${id}"]`);
    if (hole) hole.innerHTML = "";
  }

  function updateScore(s) {
    document.querySelector(dom.score).textContent = s;
  }

  function updateTimer(t) {
    document.querySelector(dom.timer).textContent = t;
  }

  return { dom, renderBoard, showMole, hideMole, updateScore, updateTimer };
})();

// Model
const Model = (() => {
  class Game {
    constructor() {
      this.score = 0;
      this.time = 30;
      this.active = false;

      this.board = Array.from({ length: 12 }, (_, id) => ({
        id,
        hasMole: false,
      }));
      this.timerId = null;
      this.spawnId = null;
    }

    start() {
      this.reset();
      this.active = true;
      this.timerId = setInterval(() => this.tick(), 1000);
      this.spawnId = setInterval(() => this.spawn(), 1000);
    }

    reset() {
      this.score = 0;
      this.time = 30;
      this.active = false;
      clearInterval(this.timerId);
      clearInterval(this.spawnId);

      this.board.forEach((slot) => {
        slot.hasMole = false;
        View.hideMole(slot.id);
      });

      View.updateScore(0);
      View.updateTimer(30);
    }

    tick() {
      this.time--;
      View.updateTimer(this.time);
      if (this.time <= 0) this.end();
    }

    spawn() {
      if (!this.active) return;

      const occupied = this.board.filter((b) => b.hasMole).length;
      const emptySlots = this.board.filter((b) => !b.hasMole);

      if (occupied < 3 && emptySlots.length > 0) {
        const randomSlot =
          emptySlots[Math.floor(Math.random() * emptySlots.length)];
        randomSlot.hasMole = true;
        View.showMole(randomSlot.id);
      }
    }

    whack(id) {
      if (!this.active) return;

      const slot = this.board[id];
      if (slot.hasMole) {
        this.score++;
        View.updateScore(this.score);
        slot.hasMole = false;
        View.hideMole(id);
      }
    }

    end() {
      this.active = false;
      clearInterval(this.timerId);
      clearInterval(this.spawnId);
      alert("Time is Over !");
    }
  }

  return { Game };
})();

// Controller
const Controller = ((V, M) => {
  const game = new M.Game();

  function init() {
    V.renderBoard();

    document
      .querySelector(V.dom.startBtn)
      .addEventListener("click", () => game.start());

    document.querySelector(V.dom.board).addEventListener("click", (e) => {
      const hole = e.target.closest(".hole");
      if (!hole || !game.active) return;
      const id = +hole.dataset.id;
      game.whack(id);
    });
  }

  return { init };
})(View, Model);

Controller.init();
