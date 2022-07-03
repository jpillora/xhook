import type { Page } from "@playwright/test";

export function createWaitting() {
  let $resolve: any = null;
  const waitting = new Promise((resolve, reject) => {
    $resolve = resolve
  })
  return {
    waitting,
    $resolve
  }
}

export function addListenForUrl(page: Page, filterUrl: RegExp, cb: () => void) {
  page.on('response', (req) => {
    const url = req.url()
    if (filterUrl.test(url)) {
      cb()
    }
  })
}
