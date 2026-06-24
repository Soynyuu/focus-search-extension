const DEFAULT_ENABLED = true;

const getEnabled = async () => {
  const result = await chrome.storage.local.get({ enabled: DEFAULT_ENABLED });
  return result.enabled !== false;
};

const updateAction = async () => {
  const enabled = await getEnabled();

  await chrome.action.setTitle({
    title: enabled ? "Focus Search: On" : "Focus Search: Off"
  });

  await chrome.action.setBadgeText({
    text: enabled ? "ON" : "OFF"
  });

  await chrome.action.setBadgeBackgroundColor({
    color: enabled ? "#065fd4" : "#606060"
  });
};

chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get("enabled");

  if (typeof result.enabled !== "boolean") {
    await chrome.storage.local.set({ enabled: DEFAULT_ENABLED });
  }

  await updateAction();
});

chrome.runtime.onStartup.addListener(updateAction);

chrome.action.onClicked.addListener(async () => {
  const enabled = await getEnabled();
  await chrome.storage.local.set({ enabled: !enabled });
  await updateAction();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.enabled) {
    updateAction();
  }
});
