// Ember Ladle — pantry: the whole game state, order deck and scoring.
// Nothing here touches the canvas or the DOM; it only holds numbers and lists.
(function (global) {
  'use strict';

  var Menu = global.EmberMenu;

  // Small deterministic RNG so staged screenshots and replays agree.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickRecipe(rng) {
    return Menu.RECIPES[Math.floor(rng() * Menu.RECIPES.length)];
  }

  function newTicket(rng, id) {
    var recipe = pickRecipe(rng);
    return {
      id: id,
      recipeId: recipe.id,
      name: recipe.name,
      needs: recipe.needs.slice(),
      coins: recipe.coins,
      timeLeft: Menu.TUNING.orderTime,
      total: Menu.TUNING.orderTime,
      born: 0
    };
  }

  function dishMatches(plateItems, recipe) {
    var wanted = {};
    var have = {};
    recipe.needs.forEach(function (k) { wanted[k] = (wanted[k] || 0) + 1; });
    plateItems.forEach(function (k) { have[k] = (have[k] || 0) + 1; });
    var keys = Object.keys(wanted);
    for (var i = 0; i < keys.length; i++) {
      if (have[keys[i]] !== wanted[keys[i]]) return false;
    }
    return Object.keys(have).length === keys.length;
  }

  function ticketForPlate(tickets, plateItems) {
    for (var i = 0; i < tickets.length; i++) {
      var recipe = Menu.recipeById(tickets[i].recipeId);
      if (recipe && dishMatches(plateItems, recipe)) return tickets[i];
    }
    return null;
  }

  function freshState(seed) {
    return {
      seed: seed || 1,
      rng: mulberry32(seed || 1),
      phase: 'title',        // title | playing | over
      time: 0,               // seconds since the day started
      dayLeft: Menu.TUNING.dayLength,
      coins: 0,
      served: 0,
      missed: 0,
      combo: 0,
      bestCombo: 0,
      comboTimer: 0,
      nextTicketIn: Menu.TUNING.firstOrderAt,
      nextTicketId: 1,
      tickets: [],
      chef: { x: 640, y: 520, carrying: null, face: 1 },
      board: null,           // { item, kind, progress } on the chopping board
      grill: [null, null],   // two grill slots: { item, kind, progress }
      plating: [],           // plates waiting on the plating counter: { items: [] }
      flashes: [],           // { text, x, y, life, color } floating feedback
      steam: [],             // { x, y, life } grill steam puffs
      shake: 0,
      paused: false,
      muted: false,
      shot: null,            // staged screenshot name, when set
      message: '',
      messageLife: 0
    };
  }

  function spawnInterval(state) {
    var t = Menu.TUNING;
    var f = Math.min(1, state.time / t.dayLength);
    return t.spawnStart + (t.spawnEnd - t.spawnStart) * f;
  }

  function tickDay(state, dt) {
    if (state.phase !== 'playing' || state.paused) return;
    state.time += dt;
    state.dayLeft = Math.max(0, Menu.TUNING.dayLength - state.time);
    state.nextTicketIn -= dt;
    if (state.nextTicketIn <= 0 && state.tickets.length < Menu.TUNING.maxTickets) {
      state.tickets.push(newTicket(state.rng, state.nextTicketId++));
      state.nextTicketIn = spawnInterval(state);
    }
    for (var i = state.tickets.length - 1; i >= 0; i--) {
      var ticket = state.tickets[i];
      ticket.timeLeft -= dt;
      if (ticket.timeLeft <= 0) {
        state.tickets.splice(i, 1);
        state.missed += 1;
        state.combo = 0;
        state.comboTimer = 0;
        addFlash(state, 'Order missed!', 640, 150, '#e2492f');
      }
    }
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }
    if (state.dayLeft <= 0) {
      state.phase = 'over';
      state.message = '';
    }
    if (state.messageLife > 0) state.messageLife -= dt;
    for (var j = state.flashes.length - 1; j >= 0; j--) {
      state.flashes[j].life -= dt;
      state.flashes[j].y -= 26 * dt;
      if (state.flashes[j].life <= 0) state.flashes.splice(j, 1);
    }
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 3);
  }

  function serveTicket(state, ticket, plateItems) {
    var fast = Math.round(Menu.TUNING.serveBonus * (ticket.timeLeft / ticket.total));
    var earned = ticket.coins + fast + state.combo * 2;
    state.coins += earned;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.comboTimer = Menu.TUNING.comboWindow;
    var idx = state.tickets.indexOf(ticket);
    if (idx >= 0) state.tickets.splice(idx, 1);
    addFlash(state, '+' + earned + ' coins' + (state.combo > 1 ? '  x' + state.combo + ' combo!' : ''), 640, 150, '#2f9e44');
    return earned;
  }

  function addFlash(state, text, x, y, color) {
    state.flashes.push({ text: text, x: x, y: y, life: 1.4, color: color || '#ffffff' });
    if (state.flashes.length > 6) state.flashes.shift();
  }

  function setMessage(state, text, seconds) {
    state.message = text;
    state.messageLife = seconds || 2.2;
  }

  global.EmberPantry = {
    mulberry32: mulberry32,
    freshState: freshState,
    newTicket: newTicket,
    dishMatches: dishMatches,
    ticketForPlate: ticketForPlate,
    tickDay: tickDay,
    serveTicket: serveTicket,
    addFlash: addFlash,
    setMessage: setMessage
  };
})(typeof window !== 'undefined' ? window : globalThis);
