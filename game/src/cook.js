// Ember Ladle — cook: movement and every station interaction.
// The chef carries one thing: an ingredient or a plate. Plates are filled on
// the plating counter, dishes are served at the window.
(function (global) {
  'use strict';

  var Menu = global.EmberMenu;
  var Pantry = global.EmberPantry;
  var Sizzle = global.EmberSizzle;

  var WALK = { x0: 30, y0: 335, x1: 1250, y1: 645 };
  var REACH = 115;

  function dist(ax, ay, bx, by) {
    var dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function nearestStation(state) {
    var best = null, bestD = REACH;
    Menu.STATIONS.forEach(function (st) {
      var c = Menu.stationCenter(st);
      var d = dist(state.chef.x, state.chef.y, c.x, c.y);
      if (d < bestD) { bestD = d; best = st; }
    });
    return best;
  }

  function stationAtPoint(x, y) {
    for (var i = 0; i < Menu.STATIONS.length; i++) {
      var st = Menu.STATIONS[i];
      if (x >= st.x - 12 && x <= st.x + st.w + 12 && y >= st.y - 12 && y <= st.y + st.h + 12) return st;
    }
    return null;
  }

  function approachPoint(st) {
    var c = Menu.stationCenter(st);
    var y = c.y < 400 ? WALK.y0 + 8 : WALK.y1 - 8;
    return { x: Math.max(WALK.x0, Math.min(WALK.x1, c.x)), y: y };
  }

  function finishedKind(carried) {
    // A carried ingredient is only plate-ready once prepped.
    if (carried.kind !== 'ingredient') return null;
    var prep = Menu.INGREDIENTS[carried.item].prep;
    if (prep === 'ready') return carried.item;
    if (prep === 'chop' && carried.state === 'chopped') return carried.item;
    if (prep === 'grill' && carried.state === 'cooked') return carried.item;
    return null;
  }

  function interact(state, station) {
    var chef = state.chef;
    if (!station) return;
    var kind = station.kind;

    if (kind === 'crate') {
      if (chef.carrying) { Pantry.setMessage(state, 'Hands full!'); Sizzle.buzz(state); return; }
      chef.carrying = { kind: 'ingredient', item: station.item, state: 'raw' };
      Sizzle.pickup(state);
      return;
    }

    if (kind === 'board') {
      if (!state.board) {
        if (chef.carrying && chef.carrying.kind === 'ingredient' &&
            Menu.INGREDIENTS[chef.carrying.item].prep === 'chop' && chef.carrying.state === 'raw') {
          state.board = { item: chef.carrying.item, progress: 0 };
          chef.carrying = null;
          Sizzle.place(state);
        } else if (chef.carrying) {
          Pantry.setMessage(state, 'That does not need chopping');
          Sizzle.buzz(state);
        }
        return;
      }
      if (state.board.progress >= 1) {
        if (chef.carrying) { Pantry.setMessage(state, 'Hands full!'); Sizzle.buzz(state); return; }
        chef.carrying = { kind: 'ingredient', item: state.board.item, state: 'chopped' };
        state.board = null;
        Sizzle.pickup(state);
      }
      return;
    }

    if (kind === 'grill') {
      var slot = null, slotIdx = -1;
      for (var i = 0; i < state.grill.length; i++) {
        if (state.grill[i]) { slot = state.grill[i]; slotIdx = i; }
      }
      var freeIdx = state.grill[0] ? (state.grill[1] ? -1 : 1) : 0;
      if (chef.carrying && chef.carrying.kind === 'ingredient' &&
          chef.carrying.item === 'patty' && chef.carrying.state === 'raw' && freeIdx >= 0) {
        state.grill[freeIdx] = { item: 'patty', progress: 0, rung: false };
        chef.carrying = null;
        Sizzle.sizzleStart(state);
        return;
      }
      if (slot && !chef.carrying) {
        if (slot.progress >= Menu.TUNING.grillSeconds) {
          var cooked = slot.progress < Menu.TUNING.grillBurnAt;
          chef.carrying = { kind: 'ingredient', item: 'patty', state: cooked ? 'cooked' : 'burnt' };
          state.grill[slotIdx] = null;
          Sizzle.pickup(state);
          if (!cooked) Pantry.setMessage(state, 'Burnt! Bin it.');
        } else {
          Pantry.setMessage(state, 'Still sizzling...');
          Sizzle.buzz(state);
        }
        return;
      }
      if (chef.carrying) { Pantry.setMessage(state, 'The grill is busy'); Sizzle.buzz(state); }
      return;
    }

    if (kind === 'plates') {
      if (chef.carrying) { Pantry.setMessage(state, 'Hands full!'); Sizzle.buzz(state); return; }
      chef.carrying = { kind: 'plate', items: [] };
      Sizzle.pickup(state);
      return;
    }

    if (kind === 'plating') {
      if (chef.carrying && chef.carrying.kind === 'plate') {
        if (state.plating.length >= 2) { Pantry.setMessage(state, 'Counter is full'); Sizzle.buzz(state); return; }
        state.plating.push(chef.carrying);
        chef.carrying = null;
        Sizzle.place(state);
        return;
      }
      if (chef.carrying && chef.carrying.kind === 'ingredient') {
        var ready = finishedKind(chef.carrying);
        var plate = state.plating[state.plating.length - 1];
        if (!plate) { Pantry.setMessage(state, 'Put a plate down first'); Sizzle.buzz(state); return; }
        if (!ready) { Pantry.setMessage(state, 'Prep it first: chop it or grill it'); Sizzle.buzz(state); return; }
        plate.items.push(ready);
        chef.carrying = null;
        Sizzle.place(state);
        return;
      }
      if (!chef.carrying && state.plating.length > 0) {
        chef.carrying = state.plating.pop();
        Sizzle.pickup(state);
      }
      return;
    }

    if (kind === 'window') {
      if (!chef.carrying || chef.carrying.kind !== 'plate') {
        Pantry.setMessage(state, 'Bring a finished plate to serve');
        Sizzle.buzz(state);
        return;
      }
      var ticket = Pantry.ticketForPlate(state.tickets, chef.carrying.items);
      if (!ticket) {
        Pantry.setMessage(state, 'No order wants this dish');
        Sizzle.buzz(state);
        state.shake = 0.35;
        return;
      }
      Pantry.serveTicket(state, ticket, chef.carrying.items);
      chef.carrying = null;
      Sizzle.serve(state);
      return;
    }

    if (kind === 'trash') {
      if (chef.carrying) {
        chef.carrying = null;
        Sizzle.place(state);
        Pantry.setMessage(state, 'Binned.');
      }
      return;
    }
  }

  function tickCooking(state, controls, dt) {
    // Chopping: hold interact near the board.
    if (state.board && state.board.progress < 1) {
      var board = Menu.stationById('board');
      var c = Menu.stationCenter(board);
      var near = dist(state.chef.x, state.chef.y, c.x, c.y) < REACH;
      var holding = controls.held.interact || controls.mouse.down;
      if (near && holding) {
        state.board.progress += dt / Menu.TUNING.chopSeconds;
        if (Math.random() < dt * 8) Sizzle.chop(state);
        if (state.board.progress >= 1) {
          state.board.progress = 1;
          Sizzle.chopped(state);
          Pantry.addFlash(state, 'Chopped!', c.x, c.y - 56, '#5fae4e');
        }
      }
    }
    // Grill: patties cook, then burn.
    for (var i = 0; i < state.grill.length; i++) {
      var slot = state.grill[i];
      if (!slot) continue;
      slot.progress += dt;
      if (!slot.rung && slot.progress >= Menu.TUNING.grillSeconds) {
        slot.rung = true;
        Sizzle.cooked(state);
      }
      if (Math.random() < dt * 2) {
        var grill = Menu.stationById('grill');
        state.steam.push({
          x: grill.x + 30 + i * 70 + Math.random() * 20,
          y: grill.y + 10,
          life: 0.9
        });
      }
    }
    for (var j = state.steam.length - 1; j >= 0; j--) {
      state.steam[j].life -= dt;
      state.steam[j].y -= 30 * dt;
      if (state.steam[j].life <= 0) state.steam.splice(j, 1);
    }
  }

  function moveChef(state, controls, dt) {
    var chef = state.chef;
    var vx = 0, vy = 0;
    if (controls.held.left) vx -= 1;
    if (controls.held.right) vx += 1;
    if (controls.held.up) vy -= 1;
    if (controls.held.down) vy += 1;
    if (vx !== 0 || vy !== 0) {
      controls.target = null;
      controls.pendingStation = null;
    } else if (controls.target) {
      var dx = controls.target.x - chef.x;
      var dy = controls.target.y - chef.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 12) {
        controls.target = null;
        if (controls.pendingStation) {
          var st = controls.pendingStation;
          controls.pendingStation = null;
          interact(state, st);
        }
      } else {
        vx = dx / d;
        vy = dy / d;
      }
    }
    if (vx !== 0 || vy !== 0) {
      var len = Math.sqrt(vx * vx + vy * vy);
      var speed = Menu.TUNING.chefSpeed;
      chef.x = Math.max(WALK.x0, Math.min(WALK.x1, chef.x + (vx / len) * speed * dt));
      chef.y = Math.max(WALK.y0, Math.min(WALK.y1, chef.y + (vy / len) * speed * dt));
      if (vx !== 0) chef.face = vx > 0 ? 1 : -1;
    }
  }

  function tick(state, controls, dt) {
    if (state.phase !== 'playing' || state.paused) return;
    moveChef(state, controls, dt);
    tickCooking(state, controls, dt);

    var click = controls.consumeClick();
    if (click) {
      var st = stationAtPoint(click.x, click.y);
      if (st) {
        var c = Menu.stationCenter(st);
        if (dist(state.chef.x, state.chef.y, c.x, c.y) < REACH) {
          interact(state, st);
        } else {
          controls.target = approachPoint(st);
          controls.pendingStation = st;
        }
      } else {
        controls.target = {
          x: Math.max(WALK.x0, Math.min(WALK.x1, click.x)),
          y: Math.max(WALK.y0, Math.min(WALK.y1, click.y))
        };
        controls.pendingStation = null;
      }
    }
    if (controls.consume('interact')) {
      interact(state, nearestStation(state));
    }
    if (controls.consume('trash') && state.chef.carrying) {
      state.chef.carrying = null;
      Sizzle.place(state);
      Pantry.setMessage(state, 'Binned.');
    }
  }

  global.EmberCook = {
    tick: tick,
    interact: interact,
    nearestStation: nearestStation,
    stationAtPoint: stationAtPoint,
    WALK: WALK
  };
})(typeof window !== 'undefined' ? window : globalThis);
