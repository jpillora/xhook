import { test, expect } from "@playwright/test";

test("loadstart/load/loadend events should contain the same properties as ProgressEvent interface", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:8080/example/common.html");
  const getProperties = async (method: string) => {
    return page.evaluate(async method => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, "example1.txt");
      const log = {};
      ["loadstart", "load", "loadend"].forEach(type => {
        xhr.addEventListener(type, (e: any) => {
          log[type] = {
            lengthComputable: e.lengthComputable,
            loaded: e.loaded,
            total: e.total,
          };
        });
      });
      return await new Promise((resolve, reject) => {
        xhr.addEventListener("loadend", () => resolve(log));
        xhr.addEventListener("error", () => reject(new Error("XHR failed")));
        xhr.send();
      });
    }, method);
  };

  const events: any = await getProperties("GET");
  ["loadstart", "load", "loadend"].forEach(type => {
    expect(events[type]).toMatchObject({
      lengthComputable: expect.any(Boolean),
      loaded: expect.any(Number),
      total: expect.any(Number),
    });
  });
  expect(events.loadstart.loaded).toBe(0);
  expect(events.loadstart.total).toBe(0);
  expect(events.load.loaded).toBe(events.loadend.loaded);
  expect(events.load.total).toBe(events.loadend.total);
  expect(events.loadend.loaded).toBeGreaterThan(0);
  expect(events.loadend.total).toBeGreaterThanOrEqual(0);

  const events2: any = await getProperties("HEAD");
  expect(events2.loadend.loaded).toBe(0);
  expect(events2.loadend.total).toBe(0);
});
