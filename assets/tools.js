// Sheenshot — ferramentas do site (gerador de fundo, palco limpo, copiar texto).
// Sem dependências. Cada ferramenta monta em um elemento com data-tool="background|stage".
// Nenhuma imagem sai do navegador: tudo é lido e desenhado localmente.
(function () {
  "use strict";

  var LANG = (document.documentElement.lang || "en").toLowerCase().indexOf("pt") === 0 ? "pt" : "en";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var T = {
    pt: {
      drop: "Solte uma imagem aqui",
      dropOr: "ou clique para escolher um arquivo",
      private: "Sua imagem nunca sai do navegador.",
      notImage: "Esse arquivo não é uma imagem. Tente um PNG, JPG ou WebP.",
      readError: "Não deu para ler essa imagem. Tente outra.",
      sample: "Usar o exemplo",
      found: "Cores encontradas",
      mesh: "Mesh",
      linear: "Degradê",
      download: "Baixar PNG",
      neutral: "Este print é quase todo neutro (branco, cinza ou preto). O Sheenshot usaria o seu fundo padrão.",
      usingSample: "Exemplo: uma tela de app inventada, desenhada aqui no navegador.",
      usingFile: function (n) { return "Imagem: " + n; },
      bgFullLink: "Abrir o gerador completo",
      previewAlt: "Seu print sobre o fundo gerado",
      fileMesh: "sheenshot-fundo-mesh.png",
      fileLinear: "sheenshot-fundo-degrade.png",
      // palco
      stageBefore: "Antes",
      stageAfter: "Depois",
      stageRange: "Comparar antes e depois do Palco limpo",
      stageBars: "Esconder também a barra de menus e o Dock",
      menu: ["Finder", "Arquivo", "Editar", "Visualizar", "Ir", "Janela", "Ajuda"],
      clock: "qua. 14:32",
      files: [
        ["shot", "Captura de Tela 2026-09-14 às 10.32.18"], ["pdf", "final_v3.pdf"], ["folder", "nova pasta"],
        ["shot", "Captura de Tela 2026-09-30 às 09.12.44"], ["pdf", "final_v3 (1).pdf"], ["xls", "orçamento 2026.xlsx"],
        ["img", "IMG_4821.HEIC"], ["zip", "export (2).zip"], ["doc", "notas reunião.txt"], ["folder", "design antigo"],
        ["shot", "Captura de Tela 2026-10-01 às 18.03.51"], ["pdf", "contrato_assinado.pdf"], ["img", "Sem título.png"],
        ["folder", "nova pasta 2"], ["doc", "rascunho.docx"], ["shot", "Captura de Tela 2026-08-22 às 16.40.09"],
        ["pdf", "final_v3_AGORA_VAI.pdf"], ["img", "foto perfil.jpg"], ["zip", "Arquivo.zip"]
      ],
      copied: "Copiado",
      copy: "Copiar"
    },
    en: {
      drop: "Drop an image here",
      dropOr: "or click to pick a file",
      private: "Your image never leaves the browser.",
      notImage: "That file is not an image. Try a PNG, JPG or WebP.",
      readError: "Could not read that image. Try another one.",
      sample: "Use the example",
      found: "Colors found",
      mesh: "Mesh",
      linear: "Gradient",
      download: "Download PNG",
      neutral: "This screenshot is almost all neutral (white, grey or black). Sheenshot would use your default background.",
      usingSample: "Example: a made-up app screen, drawn right here in the browser.",
      usingFile: function (n) { return "Image: " + n; },
      bgFullLink: "Open the full generator",
      previewAlt: "Your screenshot on the generated background",
      fileMesh: "sheenshot-background-mesh.png",
      fileLinear: "sheenshot-background-gradient.png",
      stageBefore: "Before",
      stageAfter: "After",
      stageRange: "Compare before and after Clean Stage",
      stageBars: "Also hide the menu bar and the Dock",
      menu: ["Finder", "File", "Edit", "View", "Go", "Window", "Help"],
      clock: "Wed 2:32 PM",
      files: [
        ["shot", "Screenshot 2026-09-14 at 10.32.18"], ["pdf", "final_v3.pdf"], ["folder", "untitled folder"],
        ["shot", "Screenshot 2026-09-30 at 09.12.44"], ["pdf", "final_v3 (1).pdf"], ["xls", "budget 2026.xlsx"],
        ["img", "IMG_4821.HEIC"], ["zip", "export (2).zip"], ["doc", "meeting notes.txt"], ["folder", "old design"],
        ["shot", "Screenshot 2026-10-01 at 18.03.51"], ["pdf", "signed_contract.pdf"], ["img", "Untitled.png"],
        ["folder", "untitled folder 2"], ["doc", "draft.docx"], ["shot", "Screenshot 2026-08-22 at 16.40.09"],
        ["pdf", "final_v3_REALLY.pdf"], ["img", "profile photo.jpg"], ["zip", "Archive.zip"]
      ],
      copied: "Copied",
      copy: "Copy"
    }
  }[LANG];

  // ---------- utilidades ----------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  var uid = 0;
  function nextId(prefix) { uid += 1; return prefix + "-" + uid; }

  function clearFallback(root) {
    root.querySelectorAll(".tool-fallback").forEach(function (n) { n.remove(); });
  }

  // Zona para soltar/escolher imagem. onFile(file) recebe um File de imagem.
  function dropZone(onFile, onError) {
    var id = nextId("file");
    var input = el("input", { type: "file", accept: "image/*", id: id, class: "sr-only" });
    var zone = el("label", { class: "drop", for: id }, [
      el("span", { class: "drop-icon", "aria-hidden": "true", html: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L5 21"/></svg>' }),
      el("span", { class: "drop-text" }, [el("strong", { text: T.drop }), el("span", { text: T.dropOr })])
    ]);
    function take(file) {
      if (!file) return;
      if (!/^image\//.test(file.type)) { onError(T.notImage); return; }
      onFile(file);
    }
    input.addEventListener("change", function () { take(input.files && input.files[0]); input.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("over"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove("over"); });
    });
    zone.addEventListener("drop", function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      take(f);
    });
    return { zone: zone, input: input };
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  // ---------- 1. Gerador de fundo ----------
  var DEFAULT_BG = { mesh: null, linear: "linear-gradient(135deg, #6E5BD8, #C9BEFF)", colors: [[110, 91, 216], [201, 190, 255]] };

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2, h = 0, s = 0, d = max - min;
    if (d > 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    var r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  // Lê as cores vivas da imagem: ignora brancos, cinzas e pretos; agrupa por matiz.
  function extractColors(img) {
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    var scale = Math.min(1, 120 / Math.max(w, h));
    var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
    var c = document.createElement("canvas");
    c.width = cw; c.height = ch;
    var ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, cw, ch);
    var data = ctx.getImageData(0, 0, cw, ch).data;
    var BINS = 12, bins = [], i, total = 0, vivid = 0;
    for (i = 0; i < BINS; i++) bins.push({ n: 0, r: 0, g: 0, b: 0 });
    for (i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      total++;
      var r = data[i], g = data[i + 1], b = data[i + 2];
      var hsl = rgbToHsl(r, g, b);
      if (hsl[1] < 0.2 || hsl[2] < 0.12 || hsl[2] > 0.92) continue;
      vivid++;
      var bin = bins[Math.floor(hsl[0] / (360 / BINS)) % BINS];
      bin.n++; bin.r += r; bin.g += g; bin.b += b;
    }
    var min = Math.max(3, vivid * 0.04);
    var picked = bins.filter(function (x) { return x.n >= min; })
      .sort(function (p, q) { return q.n - p.n; })
      .slice(0, 4)
      .map(function (x) {
        var hsl = rgbToHsl(x.r / x.n, x.g / x.n, x.b / x.n);
        // deixa a cor boa para fundo: nem lavada, nem escura demais
        return hslToRgb(hsl[0], Math.max(0.45, hsl[1]), Math.min(0.68, Math.max(0.42, hsl[2])));
      });
    if (total === 0 || vivid < total * 0.01) picked = [];
    return picked;
  }

  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function hex(c) { return "#" + c.map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join("").toUpperCase(); }

  var CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];

  function meshBase(colors) {
    var hsl = rgbToHsl(colors[0][0], colors[0][1], colors[0][2]);
    return hslToRgb(hsl[0], Math.min(0.6, hsl[1]), Math.max(0.18, hsl[2] * 0.55));
  }

  function meshCss(colors) {
    var layers = CORNERS.map(function (p, i) {
      var c = colors[i % colors.length];
      return "radial-gradient(circle at " + p[0] * 100 + "% " + p[1] * 100 + "%, " + rgba(c, 1) + " 0%, " + rgba(c, 0) + " 70%)";
    });
    return layers.join(", ") + ", " + rgba(meshBase(colors), 1);
  }

  function linearCss(colors) {
    return "linear-gradient(135deg, " + rgba(colors[0], 1) + ", " + rgba(colors[1], 1) + ")";
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Desenha a composição (fundo + print com margem, cantos e sombra) e devolve o canvas.
  function compose(img, colors, kind) {
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var s = Math.min(1, 1600 / Math.max(iw, ih));
    iw = Math.round(iw * s); ih = Math.round(ih * s);
    var W = Math.round(iw / 0.86), pad = Math.round(W * 0.07), H = ih + pad * 2;
    W = iw + pad * 2;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    if (kind === "mesh") {
      ctx.fillStyle = rgba(meshBase(colors), 1);
      ctx.fillRect(0, 0, W, H);
      var R = Math.sqrt(W * W + H * H) * 0.7;
      CORNERS.forEach(function (p, i) {
        var col = colors[i % colors.length];
        var g = ctx.createRadialGradient(p[0] * W, p[1] * H, 0, p[0] * W, p[1] * H, R);
        g.addColorStop(0, rgba(col, 1));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
    } else {
      // 135° em CSS: do canto de cima à esquerda para o de baixo à direita
      var ang = 135 * Math.PI / 180;
      var len = Math.abs(W * Math.sin(ang)) + Math.abs(H * Math.cos(ang));
      var dx = Math.sin(ang) * len / 2, dy = -Math.cos(ang) * len / 2;
      var lg = ctx.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy);
      lg.addColorStop(0, rgba(colors[0], 1));
      lg.addColorStop(1, rgba(colors[1], 1));
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);
    }
    var r = Math.max(8, Math.round(W * 0.012));
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = Math.round(W * 0.03);
    ctx.shadowOffsetY = Math.round(W * 0.012);
    roundRectPath(ctx, pad, pad, iw, ih, r);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRectPath(ctx, pad, pad, iw, ih, r);
    ctx.clip();
    ctx.drawImage(img, pad, pad, iw, ih);
    ctx.restore();
    return c;
  }

  function downloadCanvas(canvas, name) {
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = el("a", { href: url, download: name });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }, "image/png");
  }

  // Desenha uma tela de app colorida e inventada, para o exemplo funcionar sem upload.
  function sampleImage() {
    var c = document.createElement("canvas");
    c.width = 720; c.height = 450;
    var x = c.getContext("2d");
    x.fillStyle = "#FFFFFF"; x.fillRect(0, 0, 720, 450);
    x.fillStyle = "#F2F2F5"; x.fillRect(0, 0, 720, 34);
    [["#FF5F57", 18], ["#FEBC2E", 38], ["#28C840", 58]].forEach(function (d) {
      x.fillStyle = d[0]; x.beginPath(); x.arc(d[1], 17, 6, 0, Math.PI * 2); x.fill();
    });
    // barra lateral
    var sg = x.createLinearGradient(0, 34, 0, 450);
    sg.addColorStop(0, "#7C5CFF"); sg.addColorStop(1, "#5B3FE0");
    x.fillStyle = sg; x.fillRect(0, 34, 170, 416);
    x.fillStyle = "rgba(255,255,255,.9)";
    roundRectPath(x, 20, 56, 90, 12, 6); x.fill();
    x.fillStyle = "rgba(255,255,255,.45)";
    for (var i = 0; i < 6; i++) { roundRectPath(x, 20, 96 + i * 30, 110 - (i % 3) * 18, 10, 5); x.fill(); }
    // cabeçalho
    var hg = x.createLinearGradient(190, 0, 700, 0);
    hg.addColorStop(0, "#FF8A3D"); hg.addColorStop(1, "#FF4F8B");
    x.fillStyle = hg; roundRectPath(x, 190, 54, 510, 110, 14); x.fill();
    x.fillStyle = "rgba(255,255,255,.95)"; roundRectPath(x, 214, 82, 200, 16, 8); x.fill();
    x.fillStyle = "rgba(255,255,255,.7)"; roundRectPath(x, 214, 110, 280, 10, 5); x.fill();
    roundRectPath(x, 214, 128, 220, 10, 5); x.fill();
    // cartões
    var cards = [["#14B8A6", 190], ["#F5B70A", 362], ["#3B82F6", 534]];
    cards.forEach(function (cd) {
      x.fillStyle = "#F6F6F9"; roundRectPath(x, cd[1], 184, 166, 120, 12); x.fill();
      x.fillStyle = cd[0]; roundRectPath(x, cd[1] + 16, 200, 34, 34, 9); x.fill();
      x.fillStyle = "#D9D9E0"; roundRectPath(x, cd[1] + 16, 250, 120, 9, 4); x.fill();
      roundRectPath(x, cd[1] + 16, 268, 86, 9, 4); x.fill();
    });
    // gráfico
    x.fillStyle = "#F6F6F9"; roundRectPath(x, 190, 320, 510, 110, 12); x.fill();
    var bars = [40, 62, 48, 76, 58, 84, 66, 92, 70, 80, 54, 88];
    bars.forEach(function (bh, i) {
      x.fillStyle = i % 2 ? "#7C5CFF" : "#14B8A6";
      roundRectPath(x, 214 + i * 39, 416 - bh, 22, bh, 5); x.fill();
    });
    return c;
  }

  function mountBackground(root) {
    clearFallback(root);
    var full = root.getAttribute("data-variant") === "full";
    var current = { img: null, colors: [] };

    var msg = el("p", { class: "tool-msg", role: "status" });
    var source = el("p", { class: "bg-source" });
    var dz = dropZone(function (file) {
      var url = URL.createObjectURL(file);
      loadImage(url).then(function (img) {
        msg.textContent = "";
        use(img, T.usingFile(file.name));
      }).catch(function () { msg.textContent = T.readError; URL.revokeObjectURL(url); });
    }, function (m) { msg.textContent = m; });

    var sampleBtn = el("button", { type: "button", class: "btn btn-ghost btn-sm", text: T.sample });
    sampleBtn.addEventListener("click", useSample);

    var swatches = el("ul", { class: "bg-swatches", "aria-label": T.found });
    var neutral = el("p", { class: "bg-neutral", role: "status", hidden: true, text: T.neutral });

    var controls = el("div", { class: "bg-controls" }, [
      dz.input, dz.zone,
      el("div", { class: "bg-row" }, [sampleBtn]),
      el("p", { class: "tool-private", text: T.private }),
      msg,
      el("div", { class: "bg-found" }, [el("span", { class: "tool-label", text: T.found }), swatches]),
      neutral,
      source
    ]);

    function preview(kind, label) {
      var img = el("img", { alt: T.previewAlt + " (" + label + ")" });
      var stage = el("div", { class: "bg-stage" }, [img]);
      var btn = el("button", { type: "button", class: "btn btn-ghost btn-sm", text: T.download });
      btn.addEventListener("click", function () {
        if (!current.img) return;
        var colors = current.colors.length >= 2 ? current.colors : DEFAULT_BG.colors;
        downloadCanvas(compose(current.img, colors, kind), kind === "mesh" ? T.fileMesh : T.fileLinear);
      });
      var fig = el("figure", { class: "bg-prev" }, [stage, el("figcaption", {}, [el("span", { text: label }), btn])]);
      return { fig: fig, stage: stage, img: img, btn: btn };
    }
    var pm = preview("mesh", T.mesh);
    var pl = preview("linear", T.linear);
    var previews = el("div", { class: "bg-previews" }, [pm.fig, pl.fig]);

    root.appendChild(el("div", { class: "bg-tool" + (full ? " is-full" : "") }, [controls, previews]));
    var link = root.getAttribute("data-full-href");
    if (link) root.appendChild(el("a", { class: "tool-link", href: link, text: T.bgFullLink + " →" }));

    function use(img, label) {
      current.img = img;
      current.colors = extractColors(img);
      var ok = current.colors.length >= 2;
      var colors = ok ? current.colors : DEFAULT_BG.colors;
      swatches.innerHTML = "";
      current.colors.forEach(function (c) {
        swatches.appendChild(el("li", {}, [el("i", { style: "background:" + hex(c), "aria-hidden": "true" }), el("span", { text: hex(c) })]));
      });
      neutral.hidden = ok;
      pm.stage.style.background = ok ? meshCss(colors) : DEFAULT_BG.linear;
      pl.stage.style.background = ok ? linearCss(colors) : DEFAULT_BG.linear;
      var src = img.src;
      pm.img.src = src; pl.img.src = src;
      source.textContent = label;
    }

    function useSample() {
      var c = sampleImage();
      loadImage(c.toDataURL("image/png")).then(function (img) { use(img, T.usingSample); });
    }
    useSample();
  }

  // ---------- 2. Palco limpo: antes e depois ----------
  var ICON_SPOTS = [
    // [esquerda %, topo %] — espalhados de propósito, como uma mesa de verdade
    [3, 3], [15, 7], [29, 2], [42, 9], [55, 4], [67, 8], [79, 2], [89, 6],
    [7, 27], [21, 31], [35, 25], [61, 29], [75, 26], [88, 30],
    [12, 51], [27, 55], [48, 50], [70, 53], [86, 52]
  ];

  function desktop(withIcons) {
    var bar = el("div", { class: "mac-menubar" }, [
      el("span", { class: "mac-dot", "aria-hidden": "true" }),
      el("span", { class: "mac-menus" }, T.menu.map(function (m, i) { return el("span", { class: i === 0 ? "b" : "", text: m }); })),
      el("span", { class: "mac-clock", text: T.clock })
    ]);
    var dock = el("div", { class: "mac-dock" }, ["#4F8CFF", "#34C759", "#FF9F0A", "#FF375F", "#BF5AF2", "#64D2FF", "#FFD60A", "#8E8E93"].map(function (c) {
      return el("i", { style: "background:" + c });
    }));
    var layer = el("div", { class: "mac-desk" + (withIcons ? " messy" : " clean") }, [bar]);
    if (withIcons) {
      T.files.forEach(function (f, i) {
        var p = ICON_SPOTS[i % ICON_SPOTS.length];
        layer.appendChild(el("div", { class: "ic ic-" + f[0], style: "left:" + p[0] + "%;top:" + p[1] + "%" }, [el("i"), el("span", { text: f[1] })]));
      });
    }
    layer.appendChild(dock);
    return layer;
  }

  function mountStage(root) {
    clearFallback(root);
    var clean = desktop(false);
    var messy = desktop(true);
    var handle = el("div", { class: "stage-handle", "aria-hidden": "true" }, [el("span")]);
    var range = el("input", { type: "range", min: "0", max: "100", step: "1", value: "50", class: "stage-range", "aria-label": T.stageRange });
    var screen = el("div", { class: "stage-screen" }, [
      clean, messy,
      el("span", { class: "stage-tag l", text: T.stageBefore, "aria-hidden": "true" }),
      el("span", { class: "stage-tag r", text: T.stageAfter, "aria-hidden": "true" }),
      handle, range
    ]);
    var check = el("input", { type: "checkbox" });
    var toggle = el("label", { class: "check stage-toggle" }, [check, el("span", {}, [T.stageBars + " ", el("span", { class: "pro", text: "PRO" })])]);
    root.appendChild(screen);
    root.appendChild(toggle);

    function set(v) {
      screen.style.setProperty("--pos", v + "%");
      range.setAttribute("aria-valuetext", T.stageBefore + " " + Math.round(v) + "% · " + T.stageAfter + " " + Math.round(100 - v) + "%");
    }
    range.addEventListener("input", function () { set(+range.value); });
    check.addEventListener("change", function () { clean.classList.toggle("no-bars", check.checked); });
    set(50);

    // Uma dica de movimento, só uma vez e só se a pessoa aceita animações.
    if (!REDUCED && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var t0 = null, dur = 1600;
        function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur);
          if (range.dataset.touched) return;
          var v = 50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k);
          range.value = String(Math.round(v)); set(v);
          if (k < 1) requestAnimationFrame(step); else { range.value = "50"; set(50); }
        }
        requestAnimationFrame(step);
      }, { threshold: 0.6 });
      io.observe(screen);
      ["pointerdown", "keydown", "focus"].forEach(function (ev) {
        range.addEventListener(ev, function () { range.dataset.touched = "1"; });
      });
    }
  }

  // ---------- 3. Botões de copiar texto ----------
  function mountCopy(btn) {
    var target = document.getElementById(btn.getAttribute("data-copy"));
    if (!target) return;
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var text = target.innerText.trim();
      var done = function () {
        btn.textContent = T.copied;
        setTimeout(function () { btn.textContent = T.copy; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(target); });
      } else { selectText(target); }
    });
  }
  function selectText(node) {
    var r = document.createRange(); r.selectNodeContents(node);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  function safe(fn, node) {
    try { fn(node); } catch (e) { if (window.console) console.warn("Sheenshot tool:", e); }
  }

  document.querySelectorAll('[data-tool="background"]').forEach(function (n) { safe(mountBackground, n); });
  document.querySelectorAll('[data-tool="stage"]').forEach(function (n) { safe(mountStage, n); });
  document.querySelectorAll("[data-copy]").forEach(function (n) { safe(mountCopy, n); });
})();
