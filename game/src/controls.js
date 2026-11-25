// Ember Ladle — controls: keyboard and mouse input, kept apart from the rules.
// The game reads this module's `held` and `pressed` state each frame.
(function (global) {
  'use strict';

  var KEYS = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact', Space: 'interact',
    KeyQ: 'trash', KeyR: 'restart', KeyP: 'pause', KeyM: 'mute', Enter: 'start'
  };

  function createControls(canvas) {
    var controls = {
      held: { up: false, down: false, left: false, right: false, interact: false },
      pressed: {},          // one-frame action keys, consumed by the loop
      mouse: { x: 0, y: 0, down: false, clicked: false, clickX: 0, clickY: 0 },
      target: null           // { x, y } the chef walks toward after a click
    };

    function toGame(e) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    global.addEventListener('keydown', function (e) {
      var name = KEYS[e.code];
      if (!name) return;
      if (name === 'interact' && e.code === 'Space') e.preventDefault();
      if (name in controls.held) controls.held[name] = true;
      controls.pressed[name] = true;
    });

    global.addEventListener('keyup', function (e) {
      var name = KEYS[e.code];
      if (name && name in controls.held) controls.held[name] = false;
    });

    canvas.addEventListener('mousemove', function (e) {
      var p = toGame(e);
      controls.mouse.x = p.x;
      controls.mouse.y = p.y;
    });

    canvas.addEventListener('mousedown', function (e) {
      var p = toGame(e);
      controls.mouse.down = true;
      controls.mouse.x = p.x;
      controls.mouse.y = p.y;
      controls.target = { x: p.x, y: p.y };
    });

    global.addEventListener('mouseup', function () {
      controls.mouse.down = false;
    });

    canvas.addEventListener('click', function (e) {
      var p = toGame(e);
      controls.mouse.clicked = true;
      controls.mouse.clickX = p.x;
      controls.mouse.clickY = p.y;
    });

    // A click on a station is also an interact: the chef walks there, then the
    // game acts when the chef arrives (see cook.js).
    controls.consume = function (name) {
      if (controls.pressed[name]) {
        controls.pressed[name] = false;
        return true;
      }
      return false;
    };

    controls.consumeClick = function () {
      if (controls.mouse.clicked) {
        controls.mouse.clicked = false;
        return { x: controls.mouse.clickX, y: controls.mouse.clickY };
      }
      return null;
    };

    return controls;
  }

  global.EmberControls = { create: createControls };
})(typeof window !== 'undefined' ? window : globalThis);
