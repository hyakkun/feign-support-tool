import { createPopupWindowController } from "./popupWindowController";

test("sends a ready callback after the popup finishes loading", () => {
  const popup = { closed: false, document: { readyState: "complete" } };
  const windowObject = { open: vi.fn(() => popup), setTimeout: (callback) => callback() };
  const controller = createPopupWindowController({ windowObject, publicUrl: "/tool" });
  const onReady = vi.fn();
  controller.open(onReady);
  expect(windowObject.open).toHaveBeenCalledWith("/tool/popup.html", "FeignTool_popupWindow", "width=320, height=280");
  expect(onReady).toHaveBeenCalledTimes(1);
  expect(controller.getWindow()).toBe(popup);
});
