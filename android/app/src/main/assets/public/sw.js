/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "index.html",
    "revision": "e32f6317dfb731795344c9cec6b6c0ee"
  }, {
    "url": "assets/purify.es-BZxk_wWO.js",
    "revision": null
  }, {
    "url": "assets/index.es-BuoRoiH_.js",
    "revision": null
  }, {
    "url": "assets/index-l6IbEQDc.css",
    "revision": null
  }, {
    "url": "assets/index-WJQ4t8FA.js",
    "revision": null
  }, {
    "url": "assets/html2canvas-C-y_eFbY.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8f558188e0e2e501e5937e7925fdeb4a"
  }, {
    "url": "favicon.ico",
    "revision": "f22b2373f887f9dc29eb03565edd8e39"
  }, {
    "url": "pwa-192x192.png",
    "revision": "7a2c701bbde1a961532990dcee5b7cee"
  }, {
    "url": "pwa-512x512.png",
    "revision": "81f15abafdad92680d5dbc137ca2f904"
  }, {
    "url": "pwa-maskable-192x192.png",
    "revision": "07f59b6ffea727975615b0ab37b39092"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "63e7ade9c0c30854f603cc60c3f28f05"
  }, {
    "url": "sounds/xp_click.wav",
    "revision": "bba450c6a1fd25ab7d7adc53da7c6e4b"
  }, {
    "url": "sounds/xp_logoff.wav",
    "revision": "fbeabe31f84d519240731737db2e6d39"
  }, {
    "url": "sounds/xp_logon.wav",
    "revision": "c5192c27fafa4d42e9e6781a0e905022"
  }, {
    "url": "manifest.webmanifest",
    "revision": "334d64a4a076c59991ee645e81dc4fef"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
