// Ember Ladle — boot: wiring, the game loop and the screenshot hook.
// Opens on a title screen; ?shot=<name> stages one frozen kitchen frame.
(function (global) {
  'use strict';

  var Menu = global.EmberMenu;
  var Pantry = global.EmberPantry;
  var Cook = global.EmberCook;
  var Draw = global.EmberDraw;
  var Sizzle = global.EmberSizzle;
  var Stage = global.EmberStage;

  function params() {
    var out = {};
    var q = global.location ? global.location.search.slice(1) : '';
    q.split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }

  function boot() {
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    var controls = global.EmberControls.create(canvas);
    var state = Pantry.freshState(1);
    var query = params();

    if (query.shot) {
      Stage.stageShot(state, query.shot);
    }

    function startDay() {
      if (state.phase !== 'title') return;
      state.phase = 'playing';
      Sizzle.click(state);
    }

    function restartDay() {
      var seed = state.seed + 1;
      var shot = state.shot;
      state = Pantry.freshState(seed);
      if (shot) Stage.stageShot(state, shot);
      else state.phase = 'title';
    }

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (controls.consume('start')) startDay();
      if (state.phase === 'title' && controls.mouse.clicked) {
        controls.mouse.clicked = false;
        startDay();
      }
      if (controls.consume('restart') && state.phase === 'over') restartDay();
      if (controls.consume('pause') && state.phase === 'playing') {
        state.paused = !state.paused;
        Sizzle.click(state);
      }
      if (controls.consume('mute')) {
        state.muted = !state.muted;
      }

      if (!state.shot) {
        Cook.tick(state, controls, dt);
        Pantry.tickDay(state, dt);
      }
      Draw.drawScene(ctx, state);
      requestAnimationFrame(frame);
    }

    Draw.drawScene(ctx, state);
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
