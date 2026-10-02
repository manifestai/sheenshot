// Sheenshot — comportamento do site
(function () {
  // Cabeçalho com borda ao rolar
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Vídeo: o botão de play começa o vídeo
  document.querySelectorAll(".video-frame").forEach(function (frame) {
    var video = frame.querySelector("video");
    var play = frame.querySelector(".play");
    if (!video || !play) return;
    play.addEventListener("click", function () {
      frame.classList.add("playing");
      video.controls = true;
      video.play();
    });
    video.addEventListener("play", function () { frame.classList.add("playing"); });
  });

  // Links "assistir": rolam até o vídeo e tocam
  document.querySelectorAll("[data-watch]").forEach(function (a) {
    a.addEventListener("click", function () {
      var play = document.querySelector(".video-frame .play");
      if (play) setTimeout(function () { play.click(); }, 450);
    });
  });

  // Troca de idioma: lembra a escolha
  document.querySelectorAll("[data-lang]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("sheenshot-lang", a.getAttribute("data-lang")); } catch (e) {}
    });
  });

  // Download: mostra os passos de instalação
  document.querySelectorAll("[data-download]").forEach(function (a) {
    a.addEventListener("click", function () {
      var steps = document.getElementById("instalar") || document.getElementById("install");
      if (steps) setTimeout(function () { steps.scrollIntoView({ behavior: "smooth" }); }, 600);
    });
  });
})();
