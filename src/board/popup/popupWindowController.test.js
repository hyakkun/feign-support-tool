import { createPopupWindowController } from "./popupWindowController";

test("opens the popup at the configured URL", () => {
  const popup = { closed: false, document: { readyState: "complete" } };
  const windowObject = {
    location: { origin: "https://tool.example" },
    open: vi.fn(() => popup),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  const controller = createPopupWindowController({ windowObject, publicUrl: "/tool" });

  controller.open(vi.fn());

  expect(windowObject.open).toHaveBeenCalledWith("/tool/popup.html", "FeignTool_popupWindow", "width=320, height=280");
  expect(controller.getWindow()).toBe(popup);
});

test("waits for a ready message from the popup instead of relying on document readiness", () => {
  const popup = { closed: false, document: { readyState: "complete" } };
  let messageListener;
  const windowObject = {
    location: { origin: "https://tool.example" },
    open: vi.fn(() => popup),
    addEventListener: vi.fn((type, listener) => {
      if (type === "message") messageListener = listener;
    }),
    removeEventListener: vi.fn(),
    setTimeout: (callback) => callback(),
  };
  const controller = createPopupWindowController({ windowObject, publicUrl: "/tool" });
  const onReady = vi.fn();

  controller.open(onReady);

  expect(onReady).not.toHaveBeenCalled();
  expect(messageListener).toEqual(expect.any(Function));

  messageListener({
    source: {},
    origin: "https://tool.example",
    data: { type: "feign-popup-ready" },
  });
  messageListener({
    source: popup,
    origin: "https://untrusted.example",
    data: { type: "feign-popup-ready" },
  });
  expect(onReady).not.toHaveBeenCalled();

  messageListener({
    source: popup,
    origin: "https://tool.example",
    data: { type: "feign-popup-ready" },
  });
  expect(onReady).toHaveBeenCalledTimes(1);
  expect(windowObject.removeEventListener).toHaveBeenCalledWith("message", messageListener);
});
