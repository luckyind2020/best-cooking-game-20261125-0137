// Ember Ladle — stage: deterministic staged states for the screenshots.
// Each shot sets the kitchen up exactly as the bounty asks to see it:
// a kitchen and an order board, ingredients on the counter, one dish
// mid-assembly, a timer and a plate ready to serve. Shot mode freezes the
// simulation so the render is identical every time it is taken.
(function (global) {
  'use strict';

  var Menu = global.EmberMenu;
  var Pantry = global.EmberPantry;

  function plateWith(items) {
    return { kind: 'plate', items: items.slice() };
  }

  function ticket(state, id, recipeId, timeLeft) {
    var recipe = Menu.recipeById(recipeId);
    return {
      id: id,
      recipeId: recipe.id,
      name: recipe.name,
      needs: recipe.needs.slice(),
      coins: recipe.coins,
      timeLeft: timeLeft,
      total: Menu.TUNING.orderTime,
      born: 0
    };
  }

  var SHOTS = {
    cover: function (state) {
      state.phase = 'playing';
      state.time = 62;
      state.dayLeft = 151;
      state.coins = 145;
      state.served = 6;
      state.combo = 3;
      state.comboTimer = 12;
      state.tickets = [
        ticket(state, 7, 'classic', 52),
        ticket(state, 8, 'sunrise', 38),
        ticket(state, 9, 'garden', 61)
      ];
      state.chef.x = 830;
      state.chef.y = 380;
      state.chef.face = 1;
      state.chef.carrying = { kind: 'ingredient', item: 'lettuce', state: 'chopped' };
      state.board = { item: 'tomato', progress: 0.6 };
      state.grill = [{ item: 'patty', progress: 4.2, rung: false }, null];
      state.plating = [plateWith(['bun', 'patty'])];
      state.steam = [{ x: 820, y: 250, life: 0.7 }, { x: 845, y: 240, life: 0.4 }];
    },
    assembly: function (state) {
      state.phase = 'playing';
      state.time = 96;
      state.dayLeft = 117;
      state.coins = 210;
      state.served = 9;
      state.combo = 2;
      state.comboTimer = 9;
      state.tickets = [
        ticket(state, 12, 'melt', 44),
        ticket(state, 13, 'stack', 58)
      ];
      state.chef.x = 700;
      state.chef.y = 600;
      state.chef.face = -1;
      state.chef.carrying = null;
      state.board = { item: 'onion', progress: 1 };
      state.grill = [{ item: 'patty', progress: 7.5, rung: true }, { item: 'patty', progress: 2.0, rung: false }];
      state.plating = [plateWith(['bun', 'patty', 'cheese'])];
      state.steam = [{ x: 820, y: 250, life: 0.8 }];
    },
    rush: function (state) {
      state.phase = 'playing';
      state.time = 148;
      state.dayLeft = 32;
      state.coins = 296;
      state.served = 13;
      state.combo = 4;
      state.comboTimer = 16;
      state.tickets = [
        ticket(state, 18, 'classic', 18),
        ticket(state, 19, 'garden', 26),
        ticket(state, 20, 'sunrise', 41),
        ticket(state, 21, 'melt', 55),
        ticket(state, 22, 'stack', 66)
      ];
      state.chef.x = 1080;
      state.chef.y = 380;
      state.chef.face = 1;
      state.chef.carrying = plateWith(['bun', 'patty', 'cheese']);
      state.board = null;
      state.grill = [{ item: 'patty', progress: 13.5, rung: true }, { item: 'patty', progress: 5.1, rung: false }];
      state.plating = [plateWith(['tomato', 'lettuce'])];
      state.steam = [{ x: 820, y: 250, life: 0.6 }, { x: 895, y: 245, life: 0.8 }];
      state.message = 'Rush hour!';
      state.messageLife = 99;
    },
    serve: function (state) {
      state.phase = 'playing';
      state.time = 121;
      state.dayLeft = 65;
      state.coins = 248;
      state.served = 11;
      state.combo = 5;
      state.comboTimer = 18;
      state.tickets = [
        ticket(state, 15, 'melt', 47),
        ticket(state, 16, 'classic', 30)
      ];
      state.chef.x = 1150;
      state.chef.y = 380;
      state.chef.face = 1;
      state.chef.carrying = plateWith(['bun', 'patty', 'cheese']);
      state.board = null;
      state.grill = [null, null];
      state.plating = [];
      state.steam = [];
      state.flashes = [{ text: '+36 coins  x5 combo!', x: 640, y: 150, life: 1.2, color: '#2f9e44' }];
    }
  };

  function stageShot(state, name) {
    var fn = SHOTS[name];
    if (!fn) return false;
    var keepSeed = state.seed;
    var fresh = Pantry.freshState(keepSeed);
    Object.keys(fresh).forEach(function (k) { state[k] = fresh[k]; });
    state.shot = name;
    fn(state);
    return true;
  }

  function shotNames() {
    return Object.keys(SHOTS);
  }

  global.EmberStage = {
    stageShot: stageShot,
    shotNames: shotNames
  };
})(typeof window !== 'undefined' ? window : globalThis);
