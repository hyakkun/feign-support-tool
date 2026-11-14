export const createPopupWindowController = ({ windowObject, publicUrl }) => {
  let popupWindow = null;
  let removeReadyListener = () => {};

  return {
    open(onReady) {
      removeReadyListener();

      const handleReadyMessage = (event) => {
        if (!popupWindow || popupWindow.closed) return;
        if (event.source !== popupWindow) return;
        if (event.origin !== windowObject.location.origin) return;
        if (event.data?.type !== "feign-popup-ready") return;

        removeReadyListener();
        onReady();
      };
      windowObject.addEventListener("message", handleReadyMessage);
      removeReadyListener = () => windowObject.removeEventListener("message", handleReadyMessage);

      popupWindow = windowObject.open(`${publicUrl}/popup.html`, "FeignTool_popupWindow", "width=320, height=280");
      if (!popupWindow) removeReadyListener();
    },
    getWindow() {
      return popupWindow;
    },
  };
};
