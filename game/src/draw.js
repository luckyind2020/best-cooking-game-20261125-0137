// Ember Ladle — draw: every pixel of the kitchen, drawn with canvas shapes.
// No images are loaded; all food, counters and the chef are vector art.
(function (global) {
  'use strict';

  var Menu = global.EmberMenu;
  var Pantry = global.EmberPantry;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }

  function text(ctx, s, x, y, size, color, align, weight) {
    ctx.fillStyle = color || '#2b1a0e';
    ctx.font = (weight || 'bold') + ' ' + size + 'px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // One ingredient, drawn at (x, y) with radius r. `prep` is raw/chopped/cooked/burnt.
  function drawIngredient(ctx, kind, x, y, r, prep) {
    var ing = Menu.INGREDIENTS[kind];
    if (!ing) return;
    if (kind === 'patty') {
      var col = prep === 'cooked' ? '#7a4a28' : prep === 'burnt' ? '#241a12' : '#c97e6d';
      var hi = prep === 'cooked' ? '#9a6238' : prep === 'burnt' ? '#3a2a1c' : '#e0a192';
      ctx.fillStyle = col;
      rr(ctx, x - r, y - r * 0.55, r * 2, r * 1.1, r * 0.5);
      ctx.fill();
      ctx.fillStyle = hi;
      for (var i = -1; i <= 1; i++) {
        circle(ctx, x + i * r * 0.55, y - r * 0.15, r * 0.14);
        ctx.fill();
      }
      if (prep === 'burnt') {
        ctx.strokeStyle = 'rgba(255,120,60,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - r * 0.5, y - r * 0.4);
        ctx.lineTo(x - r * 0.2, y);
        ctx.lineTo(x + r * 0.1, y - r * 0.35);
        ctx.stroke();
      }
      return;
    }
    if (kind === 'bun') {
      ctx.fillStyle = ing.base;
      ctx.beginPath();
      ctx.arc(x, y + r * 0.25, r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.fillRect(x - r, y + r * 0.2, r * 2, r * 0.28);
      ctx.fillStyle = '#fff3c4';
      [[-0.45, -0.35], [0, -0.55], [0.45, -0.3], [-0.15, -0.15], [0.3, -0.1]].forEach(function (p) {
        circle(ctx, x + p[0] * r, y + p[1] * r, r * 0.09);
        ctx.fill();
      });
      return;
    }
    if (kind === 'cheese') {
      ctx.fillStyle = ing.base;
      ctx.beginPath();
      ctx.moveTo(x - r, y + r * 0.6);
      ctx.lineTo(x + r, y + r * 0.6);
      ctx.lineTo(x, y - r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = ing.dark;
      circle(ctx, x - r * 0.3, y + r * 0.15, r * 0.12);
      ctx.fill();
      circle(ctx, x + r * 0.3, y + r * 0.3, r * 0.1);
      ctx.fill();
      return;
    }
    if (prep === 'chopped') {
      if (kind === 'tomato') {
        for (var k = -1; k <= 1; k++) {
          ctx.fillStyle = k === 0 ? ing.base : ing.light;
          circle(ctx, x + k * r * 0.55, y + (k % 2) * r * 0.2, r * 0.5);
          ctx.fill();
          ctx.fillStyle = '#ffd9d0';
          circle(ctx, x + k * r * 0.55, y + (k % 2) * r * 0.2, r * 0.26);
          ctx.fill();
        }
        return;
      }
      if (kind === 'lettuce') {
        ctx.fillStyle = ing.light;
        for (var s = 0; s < 5; s++) {
          var a = (s / 5) * Math.PI * 2;
          circle(ctx, x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.4, r * 0.34);
          ctx.fill();
        }
        ctx.fillStyle = ing.dark;
        circle(ctx, x, y, r * 0.3);
        ctx.fill();
        return;
      }
      ctx.strokeStyle = ing.base;
      ctx.lineWidth = r * 0.22;
      for (var q = 0; q < 3; q++) {
        circle(ctx, x, y, r * (0.85 - q * 0.26));
        ctx.stroke();
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = r * 0.08;
      for (var w = 0; w < 3; w++) {
        circle(ctx, x, y, r * (0.85 - w * 0.26));
        ctx.stroke();
      }
      return;
    }
    // Whole (raw) round ingredients.
    ctx.fillStyle = ing.base;
    circle(ctx, x, y, r);
    ctx.fill();
    ctx.fillStyle = ing.light;
    circle(ctx, x - r * 0.3, y - r * 0.35, r * 0.35);
    ctx.fill();
    if (kind === 'tomato') {
      ctx.fillStyle = '#3f8f3a';
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x - r * 0.3, y - r * 1.25);
      ctx.lineTo(x + r * 0.3, y - r * 1.2);
      ctx.closePath();
      ctx.fill();
    }
    if (kind === 'onion') {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      circle(ctx, x, y, r * 0.55);
      ctx.stroke();
    }
    if (kind === 'lettuce') {
      ctx.strokeStyle = ing.dark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.6, 0.3, Math.PI - 0.3);
      ctx.stroke();
    }
  }

  function drawPlate(ctx, x, y, items, r) {
    ctx.fillStyle = '#f4f1ea';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9c2b2';
    ctx.lineWidth = 2;
    ctx.stroke();
    var n = items.length;
    for (var i = 0; i < n; i++) {
      drawIngredient(ctx, items[i], x, y - 8 - i * 9, r * 0.52, 'chopped');
    }
  }

  function drawTicket(ctx, ticket, x, y, w, h, highlight) {
    var frac = Math.max(0, ticket.timeLeft / ticket.total);
    ctx.fillStyle = highlight ? '#fff6d8' : '#fffdf4';
    rr(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.lineWidth = highlight ? 4 : 2;
    ctx.strokeStyle = highlight ? '#2f9e44' : (frac < 0.3 ? '#e2492f' : '#d8c49a');
    ctx.stroke();
    text(ctx, '#' + ticket.id + '  ' + ticket.name, x + w / 2, y + 22, 15, '#2b1a0e', 'center', 'bold');
    var n = ticket.needs.length;
    var startX = x + w / 2 - (n - 1) * 26;
    for (var i = 0; i < n; i++) {
      drawIngredient(ctx, ticket.needs[i], startX + i * 52, y + 58, 17, 'chopped');
    }
    ctx.fillStyle = '#e9dfc8';
    rr(ctx, x + 14, y + h - 26, w - 28, 12, 6);
    ctx.fill();
    ctx.fillStyle = frac < 0.3 ? '#e2492f' : '#e8a13a';
    rr(ctx, x + 14, y + h - 26, (w - 28) * frac, 12, 6);
    ctx.fill();
    text(ctx, fmtTime(ticket.timeLeft), x + w - 34, y + h - 19, 12, '#5a3a1a', 'center', 'bold');
    text(ctx, ticket.coins + 'c', x + 30, y + h - 19, 13, '#8a6d1f', 'center', 'bold');
  }

  function drawStation(ctx, state, st) {
    var c = Menu.stationCenter(st);
    ctx.fillStyle = '#8a5a33';
    rr(ctx, st.x, st.y, st.w, st.h, 10);
    ctx.fill();
    ctx.fillStyle = '#a9744a';
    rr(ctx, st.x + 4, st.y + 4, st.w - 8, st.h - 8, 8);
    ctx.fill();

    if (st.kind === 'crate') {
      ctx.fillStyle = '#6e4525';
      rr(ctx, st.x + 8, st.y + 8, st.w - 16, st.h - 16, 6);
      ctx.fill();
      drawIngredient(ctx, st.item, c.x, c.y - 6, 24, 'raw');
      text(ctx, Menu.INGREDIENTS[st.item].label, c.x, st.y + st.h - 12, 12, '#ffe9c4');
      return;
    }
    if (st.kind === 'board') {
      ctx.fillStyle = '#e8d3a8';
      rr(ctx, st.x + 10, st.y + 10, st.w - 20, st.h - 20, 6);
      ctx.fill();
      if (state.board) {
        drawIngredient(ctx, state.board.item, c.x, c.y - 4, 22, state.board.progress >= 1 ? 'chopped' : 'raw');
        if (state.board.progress < 1) {
          ctx.fillStyle = '#d8c49a';
          rr(ctx, c.x - 40, c.y + 28, 80, 8, 4);
          ctx.fill();
          ctx.fillStyle = '#5fae4e';
          rr(ctx, c.x - 40, c.y + 28, 80 * state.board.progress, 8, 4);
          ctx.fill();
        }
      } else {
        text(ctx, 'CHOP', c.x, c.y, 15, '#8a6d3b');
      }
      return;
    }
    if (st.kind === 'grill') {
      ctx.fillStyle = '#3a3a3a';
      rr(ctx, st.x + 8, st.y + 8, st.w - 16, st.h - 16, 6);
      ctx.fill();
      ctx.strokeStyle = '#777';
      ctx.lineWidth = 2;
      for (var g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(st.x + 14, st.y + 20 + g * 16);
        ctx.lineTo(st.x + st.w - 14, st.y + 20 + g * 16);
        ctx.stroke();
      }
      for (var s = 0; s < state.grill.length; s++) {
        var slot = state.grill[s];
        if (!slot) continue;
        var sx = st.x + 46 + s * 76;
        var sy = c.y - 10;
        var prep = slot.progress >= Menu.TUNING.grillBurnAt ? 'burnt'
          : slot.progress >= Menu.TUNING.grillSeconds ? 'cooked' : 'raw';
        drawIngredient(ctx, 'patty', sx, sy, 24, prep);
        var frac = Math.min(1, slot.progress / Menu.TUNING.grillBurnAt);
        ctx.fillStyle = '#222';
        rr(ctx, sx - 26, sy + 22, 52, 6, 3);
        ctx.fill();
        ctx.fillStyle = prep === 'burnt' ? '#e2492f' : prep === 'cooked' ? '#2f9e44' : '#e8a13a';
        rr(ctx, sx - 26, sy + 22, 52 * frac, 6, 3);
        ctx.fill();
      }
      text(ctx, 'GRILL', c.x, st.y + st.h - 12, 12, '#ffb37a');
      return;
    }
    if (st.kind === 'plates') {
      for (var p = 0; p < 3; p++) {
        ctx.fillStyle = p === 2 ? '#f4f1ea' : '#dcd6c6';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y + 14 - p * 7, 30, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      text(ctx, 'PLATES', c.x, st.y + st.h - 12, 12, '#ffe9c4');
      return;
    }
    if (st.kind === 'window') {
      ctx.fillStyle = '#ffe9a8';
      rr(ctx, st.x + 8, st.y + 8, st.w - 16, st.h - 34, 6);
      ctx.fill();
      ctx.fillStyle = '#e2492f';
      ctx.beginPath();
      ctx.arc(c.x, c.y - 12, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(c.x - 7, c.y - 14, 14, 4);
      text(ctx, 'SERVE', c.x, st.y + st.h - 12, 12, '#ffe9c4');
      return;
    }
    if (st.kind === 'plating') {
      ctx.fillStyle = '#d8c49a';
      rr(ctx, st.x + 6, st.y + 6, st.w - 12, st.h - 12, 8);
      ctx.fill();
      for (var q = 0; q < state.plating.length; q++) {
        drawPlate(ctx, st.x + 60 + q * 130, c.y + 6, state.plating[q].items, 34);
      }
      if (state.plating.length === 0) text(ctx, 'PLATE HERE', c.x, c.y, 14, '#8a6d3b');
      return;
    }
    if (st.kind === 'trash') {
      ctx.fillStyle = '#4a4a4a';
      rr(ctx, st.x + 12, st.y + 8, st.w - 24, st.h - 26, 6);
      ctx.fill();
      ctx.fillStyle = '#666';
      rr(ctx, st.x + 8, st.y + 4, st.w - 16, 10, 4);
      ctx.fill();
      text(ctx, 'BIN', c.x, st.y + st.h - 12, 12, '#cccccc');
    }
  }

  function drawChef(ctx, state) {
    var chef = state.chef;
    var bob = state.phase === 'playing' ? Math.sin(state.time * 6) * 1.5 : 0;
    ctx.save();
    ctx.translate(chef.x, chef.y + bob);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body / apron
    ctx.fillStyle = '#f4f1ea';
    circle(ctx, 0, 0, 22);
    ctx.fill();
    ctx.fillStyle = '#3f7fd1';
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.quadraticCurveTo(0, 26, 14, 4);
    ctx.lineTo(10, 18);
    ctx.lineTo(-10, 18);
    ctx.closePath();
    ctx.fill();
    // Face
    ctx.fillStyle = '#f2c89b';
    circle(ctx, chef.face * 6, -4, 9);
    ctx.fill();
    ctx.fillStyle = '#2b1a0e';
    circle(ctx, chef.face * 9, -6, 1.8);
    ctx.fill();
    // Toque
    ctx.fillStyle = '#ffffff';
    circle(ctx, -8, -20, 9);
    ctx.fill();
    circle(ctx, 0, -24, 10);
    ctx.fill();
    circle(ctx, 8, -20, 9);
    ctx.fill();
    ctx.fillRect(-13, -22, 26, 8);
    // Carried item above the head
    if (chef.carrying) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      circle(ctx, 0, -44, 17);
      ctx.fill();
      if (chef.carrying.kind === 'plate') {
        drawPlate(ctx, 0, -44, chef.carrying.items, 15);
      } else {
        drawIngredient(ctx, chef.carrying.item, 0, -44, 12, chef.carrying.state);
      }
    }
    ctx.restore();
  }

  function drawHud(ctx, state) {
    ctx.fillStyle = '#3a2415';
    ctx.fillRect(0, 0, Menu.CANVAS_W, 56);
    ctx.fillStyle = '#e8a13a';
    ctx.fillRect(0, 56, Menu.CANVAS_W, 4);
    text(ctx, 'EMBER LADLE', 90, 30, 22, '#ffd98a', 'center', 'bold');
    text(ctx, 'Sizzle & Serve', 218, 32, 13, '#c9a06a', 'left', 'bold');
    var dayFrac = state.dayLeft / Menu.TUNING.dayLength;
    text(ctx, 'DAY  ' + fmtTime(state.dayLeft), 640, 22, 20, '#ffffff');
    ctx.fillStyle = '#5a3a1a';
    rr(ctx, 520, 40, 240, 8, 4);
    ctx.fill();
    ctx.fillStyle = dayFrac < 0.25 ? '#e2492f' : '#e8a13a';
    rr(ctx, 520, 40, 240 * dayFrac, 8, 4);
    ctx.fill();
    text(ctx, state.coins + ' coins', 1150, 30, 20, '#ffd94d', 'right', 'bold');
    if (state.combo > 1) {
      text(ctx, 'COMBO x' + state.combo, 1000, 30, 16, '#ff9d5c', 'right', 'bold');
    }
  }

  function drawBoard(ctx, state) {
    ctx.fillStyle = '#6e4525';
    rr(ctx, 8, 64, Menu.CANVAS_W - 16, 132, 12);
    ctx.fill();
    var match = null;
    if (state.chef.carrying && state.chef.carrying.kind === 'plate') {
      match = Pantry.ticketForPlate(state.tickets, state.chef.carrying.items);
    }
    for (var i = 0; i < state.tickets.length; i++) {
      drawTicket(ctx, state.tickets[i], 24 + i * 228, 70, 216, 118, match === state.tickets[i]);
    }
    if (state.tickets.length === 0) {
      text(ctx, 'No orders yet — the lunch rush is coming...', 640, 132, 16, '#e8cfa8', 'center', 'bold');
    }
  }

  function drawFloor(ctx) {
    ctx.fillStyle = '#c98f5f';
    ctx.fillRect(0, 204, Menu.CANVAS_W, 24);
    ctx.fillStyle = '#a9744a';
    for (var x = 0; x < Menu.CANVAS_W; x += 64) {
      ctx.fillRect(x, 204, 2, 24);
    }
    for (var y = 228; y < Menu.CANVAS_H; y += 64) {
      for (var xx = 0; xx < Menu.CANVAS_W; xx += 64) {
        var odd = ((xx / 64) + (y / 64)) % 2 === 0;
        ctx.fillStyle = odd ? '#e8cfa8' : '#dfc193';
        ctx.fillRect(xx, y, 64, 64);
      }
    }
  }

  function drawOverlay(ctx, state) {
    if (state.phase === 'title') {
      ctx.fillStyle = 'rgba(36,26,18,0.82)';
      ctx.fillRect(0, 0, Menu.CANVAS_W, Menu.CANVAS_H);
      text(ctx, 'EMBER LADLE', 640, 250, 64, '#ffd98a', 'center', 'bold');
      text(ctx, 'Sizzle & Serve', 640, 305, 28, '#ffffff', 'center', 'bold');
      text(ctx, 'Take orders, chop, grill, plate and serve before the tickets run out.', 640, 360, 19, '#e8cfa8');
      text(ctx, 'WASD / arrows to move  •  E or click to use a station  •  hold E at the board to chop', 640, 400, 17, '#e8cfa8');
      text(ctx, 'Grill patties golden — burnt ones go in the bin. Serve the right dish to the right ticket.', 640, 428, 17, '#e8cfa8');
      text(ctx, 'CLICK OR PRESS ENTER TO START THE DAY', 640, 500, 22, '#ffd94d', 'center', 'bold');
      return;
    }
    if (state.phase === 'over') {
      ctx.fillStyle = 'rgba(36,26,18,0.85)';
      ctx.fillRect(0, 0, Menu.CANVAS_W, Menu.CANVAS_H);
      text(ctx, 'SERVICE OVER', 640, 280, 52, '#ffd98a', 'center', 'bold');
      text(ctx, state.coins + ' coins earned', 640, 350, 28, '#ffffff');
      text(ctx, 'Dishes served: ' + state.served + '    Missed: ' + state.missed + '    Best combo: x' + state.bestCombo, 640, 400, 20, '#e8cfa8');
      var verdict = state.coins >= 300 ? 'Head chef material. The lunch crowd loves you.'
        : state.coins >= 180 ? 'A solid service — the grill stayed hot.'
        : 'The kitchen survived. Tomorrow, faster hands.';
      text(ctx, verdict, 640, 440, 18, '#ffd94d');
      text(ctx, 'PRESS R TO COOK AGAIN', 640, 510, 22, '#ffffff', 'center', 'bold');
    }
  }

  function drawScene(ctx, state) {
    ctx.save();
    if (state.shake > 0) {
      ctx.translate((Math.random() - 0.5) * state.shake * 22, (Math.random() - 0.5) * state.shake * 22);
    }
    ctx.fillStyle = '#f6e3c2';
    ctx.fillRect(-20, -20, Menu.CANVAS_W + 40, Menu.CANVAS_H + 40);
    drawFloor(ctx);
    drawBoard(ctx, state);
    Menu.STATIONS.forEach(function (st) { drawStation(ctx, state, st); });
    // Grill steam
    state.steam.forEach(function (puff) {
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, puff.life * 0.7) + ')';
      circle(ctx, puff.x, puff.y, 8 + (1 - puff.life) * 10);
      ctx.fill();
    });
    drawChef(ctx, state);
    drawHud(ctx, state);
    // Floating feedback
    state.flashes.forEach(function (f) {
      ctx.globalAlpha = Math.min(1, f.life);
      text(ctx, f.text, f.x, f.y, 22, f.color, 'center', 'bold');
      ctx.globalAlpha = 1;
    });
    if (state.message && state.messageLife > 0) {
      ctx.fillStyle = 'rgba(43,26,14,0.85)';
      rr(ctx, 440, 216, 400, 34, 17);
      ctx.fill();
      text(ctx, state.message, 640, 234, 16, '#ffe9c4');
    }
    if (state.paused && state.phase === 'playing') {
      ctx.fillStyle = 'rgba(36,26,18,0.6)';
      ctx.fillRect(0, 0, Menu.CANVAS_W, Menu.CANVAS_H);
      text(ctx, 'PAUSED — press P to keep cooking', 640, 400, 26, '#ffffff', 'center', 'bold');
    }
    drawOverlay(ctx, state);
    ctx.restore();
  }

  global.EmberDraw = {
    drawScene: drawScene,
    drawIngredient: drawIngredient,
    drawPlate: drawPlate,
    fmtTime: fmtTime
  };
})(typeof window !== 'undefined' ? window : globalThis);
