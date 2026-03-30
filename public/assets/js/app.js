async function initApp() {
  load();
  await loadPathData();
  if (!PATHS[G.path]) G.path = "prophet";
  ensureState();
  await bootstrapCloudState();
  primeAudioOnGesture();
  initBG();
  drawBG();
  bind();
  refreshText();
  setLang(G.lang);
  updateInitiativePanel();
  renderLeaderboard();
  setInterval(() => {
    if (!G.boost?.isActive) return;
    if (Number(G.boost.activeUntil || 0) <= Date.now()) {
      G.boost.isActive = false;
      G.boost.activeMultiplier = 1;
      G.boost.activeUntil = 0;
    }
    updateInitiativePanel();
    updateHUD();
  }, 1000);
  document.body.classList.add("loaded");
}
function bind() {
  byId("lang-ar").onclick = () => setLang("ar");
  byId("lang-en").onclick = () => setLang("en");
  byId("start-btn").onclick = startJourney;
  byId("invite-copy-btn").onclick = copyInviteLink;
  byId("share-fb-btn").onclick = () => shareInvite("facebook");
  byId("share-x-btn").onclick = () => shareInvite("x");
  byId("share-li-btn").onclick = () => shareInvite("linkedin");
  byId("activate-potion-btn").onclick = activateBoostPotion;
  byId("panel-toggle").onclick = () =>
    byId("quest-panel").classList.toggle("hidden-panel");
  byId("back-btn").onclick = back;
  byId("story-next").onclick = storyNext;
  byId("next-stage-btn").onclick = nextStage;
  byId("map-btn").onclick = backToMap;
  byId("retry-btn").onclick = retryStage;
  byId("popup").onclick = closePopup;
  addEventListener("resize", () => {
    resizeCanvases();
    initBG();
    if (currentScreen === "map") renderMap();
  });
}
initApp();
