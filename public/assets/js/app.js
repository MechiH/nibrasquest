async function initApp() {
  load();
  await loadPathData();
  G.path = "prophet";
  ensureState();
  initBG();
  drawBG();
  bind();
  refreshText();
  setLang(G.lang);
  document.body.classList.add("loaded");
}
function bind() {
  byId("lang-ar").onclick = () => setLang("ar");
  byId("lang-en").onclick = () => setLang("en");
  byId("start-btn").onclick = startJourney;
  byId("demo-btn").onclick = demoAchievements;
  byId("panel-toggle").onclick = () =>
    byId("quest-panel").classList.toggle("hidden-panel");
  byId("back-btn").onclick = back;
  byId("story-next").onclick = storyNext;
  byId("story-skip").onclick = storySkip;
  byId("next-stage-btn").onclick = nextStage;
  byId("map-btn").onclick = backToMap;
  byId("retry-btn").onclick = retryStage;
  byId("popup").onclick = closePopup;
  byId("sound-toggle").onclick = () => {
    G.sound = !G.sound;
    getAudioCtx(); /* unlock AudioContext on first user gesture */
    updateHUD();
    save();
  };
  addEventListener("resize", () => {
    resizeCanvases();
    initBG();
    if (currentScreen === "map") renderMap();
  });
}
initApp();
