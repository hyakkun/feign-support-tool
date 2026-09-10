export const createPopupWindowController = ({ windowObject, publicUrl }) => {
  let popupWindow = null;

  return {
    open(onReady) {
      popupWindow = windowObject.open(`${publicUrl}/popup.html`, "FeignTool_popupWindow", "width=1000, height=300");
      const waitForReady = () => {
        if (!popupWindow || popupWindow.closed) return;
        if (popupWindow.document.readyState !== "complete") {
          windowObject.setTimeout(waitForReady, 100);
          return;
        }
        onReady();
      };
      windowObject.setTimeout(waitForReady, 100);
    },
    getWindow() {
      return popupWindow;
    },
  };
};
