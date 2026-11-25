// Ember Ladle — menu data: recipes, ingredients, stations and tuning.
// Everything the kitchen serves is defined here; no other file hard-codes a dish.
(function (global) {
  'use strict';

  var CANVAS_W = 1280;
  var CANVAS_H = 800;

  // Ingredient kinds. `prep` is what the ingredient needs before it can be plated.
  var INGREDIENTS = {
    bun:     { label: 'Bun',     prep: 'ready',  base: '#e8b96a', dark: '#b97f35', light: '#f7d794' },
    patty:   { label: 'Patty',   prep: 'grill',  base: '#c97e6d', dark: '#8a4a3c', light: '#e0a192' },
    tomato:  { label: 'Tomato',  prep: 'chop',   base: '#e2492f', dark: '#a92c17', light: '#ff8a70' },
    lettuce: { label: 'Lettuce', prep: 'chop',   base: '#5fae4e', dark: '#357a2a', light: '#9ed68e' },
    cheese:  { label: 'Cheese',  prep: 'ready',  base: '#f6c945', dark: '#c99a1d', light: '#ffe27a' },
    onion:   { label: 'Onion',   prep: 'chop',   base: '#c9a7e8', dark: '#7d5aa8', light: '#e6d4f7' }
  };

  // A dish is a set of finished ingredients. `needs` lists finished ingredient
  // kinds; order on the plate does not matter, counts do.
  var RECIPES = [
    { id: 'classic', name: 'Classic Burger', needs: ['bun', 'patty', 'lettuce'], coins: 22 },
    { id: 'melt',    name: 'Cheese Melt',    needs: ['bun', 'patty', 'cheese'],  coins: 24 },
    { id: 'garden',  name: 'Garden Salad',   needs: ['tomato', 'lettuce', 'onion'], coins: 20 },
    { id: 'sunrise', name: 'Sunrise Burger', needs: ['bun', 'patty', 'tomato', 'cheese'], coins: 30 },
    { id: 'stack',   name: 'Double Stack',   needs: ['bun', 'patty', 'patty', 'cheese'], coins: 34 }
  ];

  function recipeById(id) {
    for (var i = 0; i < RECIPES.length; i++) {
      if (RECIPES[i].id === id) return RECIPES[i];
    }
    return null;
  }

  // Stations the chef can use. x/y/w/h are canvas pixels; `kind` drives logic.
  var STATIONS = [
    { id: 'crate-tomato',  kind: 'crate', item: 'tomato',  x: 40,  y: 236, w: 84, h: 84 },
    { id: 'crate-lettuce', kind: 'crate', item: 'lettuce', x: 132, y: 236, w: 84, h: 84 },
    { id: 'crate-onion',   kind: 'crate', item: 'onion',   x: 224, y: 236, w: 84, h: 84 },
    { id: 'crate-bun',     kind: 'crate', item: 'bun',     x: 316, y: 236, w: 84, h: 84 },
    { id: 'crate-patty',   kind: 'crate', item: 'patty',   x: 408, y: 236, w: 84, h: 84 },
    { id: 'crate-cheese',  kind: 'crate', item: 'cheese',  x: 500, y: 236, w: 84, h: 84 },
    { id: 'board',         kind: 'board',                  x: 620, y: 236, w: 120, h: 84 },
    { id: 'grill',         kind: 'grill',                  x: 776, y: 236, w: 168, h: 84 },
    { id: 'plates',        kind: 'plates',                 x: 980, y: 236, w: 96, h: 84 },
    { id: 'window',        kind: 'window',                 x: 1112, y: 236, w: 128, h: 84 },
    { id: 'plating',       kind: 'plating',                x: 620, y: 660, w: 320, h: 76 },
    { id: 'trash',         kind: 'trash',                  x: 40,  y: 660, w: 96, h: 76 }
  ];

  function stationById(id) {
    for (var i = 0; i < STATIONS.length; i++) {
      if (STATIONS[i].id === id) return STATIONS[i];
    }
    return null;
  }

  function stationCenter(station) {
    return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
  }

  // Tuning knobs for the day.
  var TUNING = {
    dayLength: 180,          // seconds of service
    orderTime: 75,           // seconds a ticket stays up
    firstOrderAt: 2,         // seconds until the first ticket
    spawnStart: 14,          // seconds between tickets at the start
    spawnEnd: 8,             // seconds between tickets at the rush
    maxTickets: 5,           // tickets on the board at once
    chopSeconds: 1.2,        // seconds of chopping
    grillSeconds: 6,         // seconds until a patty is cooked
    grillBurnAt: 12,         // seconds until a patty burns
    chefSpeed: 265,          // pixels per second
    chefRadius: 22,
    comboWindow: 20,         // seconds to keep a combo alive
    serveBonus: 10           // coins for a fast serve, scaled by time left
  };

  global.EmberMenu = {
    CANVAS_W: CANVAS_W,
    CANVAS_H: CANVAS_H,
    INGREDIENTS: INGREDIENTS,
    RECIPES: RECIPES,
    recipeById: recipeById,
    STATIONS: STATIONS,
    stationById: stationById,
    stationCenter: stationCenter,
    TUNING: TUNING
  };
})(typeof window !== 'undefined' ? window : globalThis);
