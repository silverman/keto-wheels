(function () {
  var DATA = [
    { key: "protein", label: "protein", items: ["eggs", "extra-firm tofu", "tempeh", "halloumi", "paneer", "cottage cheese", "seitan", "edamame"] },
    { key: "veg", label: "vegetable", items: ["asparagus", "brussels sprouts", "spinach", "zucchini", "cauliflower", "broccoli", "kale", "green beans", "mushrooms", "bok choy"] },
    { key: "fat", label: "fat", items: ["avocado", "cheddar", "olive oil", "butter", "feta", "walnuts", "coconut cream", "pesto", "almonds", "tahini"] }
  ];
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var host = document.getElementById("reels");
  var btn = document.getElementById("spin");
  var resultH = document.getElementById("result-h");
  var resultSub = document.getElementById("result-sub");
  var histWrap = document.getElementById("history-wrap");
  var histList = document.getElementById("history");
  var history = [];
  var spinning = false;

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pickOther(items, not) {
    var v; do { v = items[rnd(items.length)]; } while (v === not && items.length > 1); return v;
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
      '<div class="reel-window"><div class="reel-track"></div></div>';
    host.appendChild(el);
    var r = {
      cat: cat, el: el,
      track: el.querySelector(".reel-track"),
      hold: el.querySelector("input"),
      above: pickOther(cat.items), current: pickOther(cat.items), below: pickOther(cat.items)
    };
    r.hold.addEventListener("change", function () { el.dataset.held = r.hold.checked ? "true" : "false"; });
    settle(r);
    return r;
  });

  function settle(r) {
    r.track.style.transition = "none";
    r.track.style.transform = "translateY(0)";
    r.track.replaceChildren(cell(r.above), cell(r.current, true), cell(r.below));
  }

  function spinReel(r, target, duration) {
    var items = r.cat.items, seq = [r.above, r.current, r.below], n = 14 + Math.round(duration * 6), prev = r.below;
    for (var i = 0; i < n; i++) { prev = pickOther(items, prev); seq.push(prev); }
    var a = pickOther(items, seq[seq.length - 1]);
    var b = pickOther(items, target);
    seq.push(a, target, b);
    var hitIdx = seq.length - 2;
    r.track.replaceChildren.apply(r.track, seq.map(function (t, i) { return cell(t, false); }));
    r.track.style.transition = "none";
    r.track.style.transform = "translateY(0)";
    void r.track.offsetHeight;
    var h = r.track.firstChild.offsetHeight;
    r.track.style.transition = "transform " + duration + "s cubic-bezier(.12,.7,.18,1)";
    r.track.style.transform = "translateY(" + (-(hitIdx - 1) * h) + "px)";
    r.above = a; r.current = target; r.below = b;
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
    var maxDur = 0;
    free.forEach(function (r, i) {
      var dur = reduce ? 0.01 : 1.5 + i * 0.5 + Math.random() * 0.3;
      maxDur = Math.max(maxDur, dur);
      spinReel(r, pickOther(r.cat.items, r.current), dur);
    });
    setTimeout(function () {
      reels.forEach(settle);
      show(reels.map(function (r) { return r.current; }));
      spinning = false; btn.disabled = false; btn.focus({ preventScroll: true });
    }, maxDur * 1000 + 80);
  }

  btn.addEventListener("click", spin);
  document.addEventListener("keydown", function (e) {
    if (e.code !== "Space" || e.repeat) return;
    var t = e.target.tagName;
    if (t === "BUTTON" || t === "INPUT" || t === "SELECT" || t === "TEXTAREA") return;
    e.preventDefault(); spin();
  });
})();
