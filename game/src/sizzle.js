// Ember Ladle — sizzle: tiny synthesised kitchen sounds, no audio files.
// Everything is an oscillator blip through one shared AudioContext.
(function (global) {
  'use strict';

  var ctx = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function blip(state, freq, dur, type, vol, slideTo) {
    if (state.muted) return;
    var ac = ensure();
    if (!ac) return;
    try {
      if (ac.state === 'suspended') ac.resume();
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
      gain.gain.setValueAtTime(vol || 0.12, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + dur + 0.02);
    } catch (e) {
      // Sound is garnish; a silent kitchen still serves.
    }
  }

  function pickup(state) { blip(state, 520, 0.08, 'triangle', 0.10, 760); }
  function place(state) { blip(state, 340, 0.07, 'triangle', 0.09, 260); }
  function chop(state) { blip(state, 190, 0.05, 'square', 0.05, 120); }
  function chopped(state) { blip(state, 660, 0.10, 'triangle', 0.11, 880); }
  function sizzleStart(state) { blip(state, 1200, 0.15, 'sawtooth', 0.03, 900); }
  function cooked(state) { blip(state, 740, 0.12, 'sine', 0.12, 990); }
  function serve(state) {
    blip(state, 523, 0.10, 'triangle', 0.12);
    setTimeout(function () { blip(state, 659, 0.10, 'triangle', 0.12); }, 90);
    setTimeout(function () { blip(state, 784, 0.16, 'triangle', 0.13); }, 180);
  }
  function buzz(state) { blip(state, 140, 0.22, 'sawtooth', 0.08, 90); }
  function miss(state) { blip(state, 330, 0.25, 'sine', 0.10, 165); }
  function click(state) { blip(state, 880, 0.05, 'sine', 0.07); }

  global.EmberSizzle = {
    pickup: pickup,
    place: place,
    chop: chop,
    chopped: chopped,
    sizzleStart: sizzleStart,
    cooked: cooked,
    serve: serve,
    buzz: buzz,
    miss: miss,
    click: click
  };
})(typeof window !== 'undefined' ? window : globalThis);
