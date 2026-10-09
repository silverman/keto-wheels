(function () {
  var DATA = [
    { key: "protein", label: "protein", items: ["eggs", "extra-firm tofu", "tempeh", "halloumi", "paneer", "cottage cheese", "seitan", "edamame"] },
    { key: "veg", label: "vegetable", items: ["asparagus", "brussels sprouts", "spinach", "zucchini", "cauliflower", "broccoli", "kale", "green beans", "mushrooms", "bok choy"] },
    { key: "fat", label: "fat", items: ["avocado", "cheddar", "olive oil", "butter", "feta", "walnuts", "coconut cream", "pesto", "almonds", "tahini"] }
  ];
  // reduced-motion users still get a short roll (it is the only cue that a spin happened), just calmer
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canAnimate = typeof Element.prototype.animate === "function";
  var host = document.getElementById("reels");
  var btn = document.getElementById("spin");
  var resultH = document.getElementById("result-h");
  var resultSub = document.getElementById("result-sub");
  var histWrap = document.getElementById("history-wrap");
  var histList = document.getElementById("history");
  var history = [];
  var spinning = false;

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pickNot(items) {
    var avoid = Array.prototype.slice.call(arguments, 1);
    var v, tries = 0;
    do { v = items[rnd(items.length)]; tries++; } while (avoid.indexOf(v) !== -1 && tries < 50);
    return v;
  }
  function cell(text, hit) {
    var d = document.createElement("div");
    d.className = "reel-cell" + (hit ? " hit" : "");
    d.textContent = text;
    return d;
  }

  var reels = DATA.map(function (cat) {
    var el = document.createElement("article");
    el.className = "reel"; el.dataset.cat = cat.key; el.dataset.held = "false";
    el.innerHTML =
      '<div class="reel-head"><h3 class="reel-name">' + cat.label + '</h3>' +
      '<label><input type="checkbox" role="switch" aria-label="hold ' + cat.label + ' wheel"> hold</label></div>' +
      '<div class="reel-window"><span class="tick top" aria-hidden="true"></span><span class="tick bot" aria-hidden="true"></span><div class="reel-track"></div></div>';
    host.appendChild(el);
    var r = {
      cat: cat, el: el,
      win: el.querySelector(".reel-window"),
      track: el.querySelector(".reel-track"),
      hold: el.querySelector("input"),
      current: pickNot(cat.items), anim: null
    };
    r.hold.addEventListener("change", function () { el.dataset.held = r.hold.checked ? "true" : "false"; });
    settle(r);
    return r;
  });

  function settle(r) {
    if (r.anim) { r.anim.cancel(); r.anim = null; }
    r.track.replaceChildren(cell(r.current, true));
  }

  // rolls sideways: the track slides left, one window-width per ingredient
  function spinReel(r, target, duration) {
    var items = r.cat.items, seq = [r.current];
    var n = reduce ? 3 : Math.round(4 + duration * 2);
    for (var i = 0; i < n; i++) seq.push(pickNot(items, seq[seq.length - 1], i === n - 1 ? target : null));
    seq.push(target);
    r.track.replaceChildren.apply(r.track, seq.map(function (t) { return cell(t, false); }));
    r.current = target;
    if (!canAnimate) return Promise.resolve();
    var dist = (seq.length - 1) * r.win.clientWidth;
    r.anim = r.track.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(" + (-dist) + "px)" }],
      { duration: duration * 1000, easing: "cubic-bezier(.25,.6,.3,1)", fill: "forwards" }
    );
    return r.anim.finished.catch(function () {});
  }

  function show(parts) {
    var text = parts[0] + " with " + parts[1] + " and " + parts[2];
    resultH.textContent = text;
    resultH.className = "";
    resultSub.hidden = true;
    history.unshift(text);
    history = history.slice(0, 6);
    var older = history.slice(1);
    histWrap.hidden = older.length === 0;
    histList.replaceChildren.apply(histList, older.map(function (t) { var li = document.createElement("li"); li.textContent = t; return li; }));
  }

  function spin() {
    if (spinning) return;
    var free = reels.filter(function (r) { return !r.hold.checked; });
    if (!free.length) {
      resultH.className = "idle";
      resultH.textContent = "every wheel is held. release one to spin.";
      return;
    }
    spinning = true; btn.disabled = true;
    var jobs = free.map(function (r, i) {
      var dur = reduce ? 0.7 + i * 0.2 : 1.6 + i * 0.5 + Math.random() * 0.3;
      return spinReel(r, pickNot(r.cat.items, r.current), dur);
    });
    Promise.all(jobs).then(function () {
      reels.forEach(settle);
      show(reels.map(function (r) { return r.current; }));
      spinning = false; btn.disabled = false; btn.focus({ preventScroll: true });
    });
  }

  btn.addEventListener("click", spin);
  document.addEventListener("keydown", function (e) {
    if (e.code !== "Space" || e.repeat) return;
    var t = e.target.tagName;
    if (t === "BUTTON" || t === "INPUT" || t === "SELECT" || t === "TEXTAREA") return;
    e.preventDefault(); spin();
  });
})();
