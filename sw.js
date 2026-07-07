const CACHE_NAME = 'engg-prep-cache-v15';
const APP_SHELL = [
  '/',
  '/index.html',
  '/login.html',
  '/app.js',
  '/questions.js',
  '/advanced_questions.js',
  '/style.css',
  '/firebase-config.js',
  '/js/firebase-sync.js',
  '/js/particles.js',
  '/js/scratchpad.js',
  '/js/global-search.js',
  '/js/onboarding.js',
  '/js/achievements.js',
  '/js/tts.js',
  '/js/weakness-srs.js',
  '/js/daily-quests.js',
  '/manifest.json',
  '/engg_tv_logo.png',
  '/assets/quiz-images/img_10KDnbj2kY_NShxS3Sj2jZBdV7_NsBOwD.jpg',
  '/assets/quiz-images/img_12BJNjdnlCiHBi-5wDKO9RPXtulX-zLUn.jpg',
  '/assets/quiz-images/img_130LZ2EaZ2tRsrdEJRScKEOWhYbNJ081E.jpg',
  '/assets/quiz-images/img_13AXOvx4omasO4KSuTeF3YPuAnyeFtGgK.jpg',
  '/assets/quiz-images/img_13cRmegLLRIpgsFZV4hNZeYVVqqRCX5fo.jpg',
  '/assets/quiz-images/img_13DUNDaLj1fMjN33P8-TXsslFWOZfEnjk.jpg',
  '/assets/quiz-images/img_13LIu2PT5LW6oWVVYhmHE3cp_SwIj8Vsk.jpg',
  '/assets/quiz-images/img_14JemX_J5WVXt5e3japz3NsOIiZKqS-Nk.jpg',
  '/assets/quiz-images/img_14Jv9SiqcwxhFs0i-APhufJPHHe29lgGV.jpg',
  '/assets/quiz-images/img_14wSjVFouf_lt2IpXPv-cB8D2YigTLDmF.jpg',
  '/assets/quiz-images/img_16Svp8e0715mggKWuxP_zETUzr9a2hIFa.jpg',
  '/assets/quiz-images/img_16x4ZwF5YsmKPf_IYlk6JCXhXbEaAI4On.jpg',
  '/assets/quiz-images/img_16ymt0cAGfkE1WFPLjKnBNWXkEowhrtnI.jpg',
  '/assets/quiz-images/img_17AkFxWAdgnEhrElpAK1H-LgUa4CEMw_w.jpg',
  '/assets/quiz-images/img_17cdtATSqye1BOQt-iFn8NECm63dNes5R.jpg',
  '/assets/quiz-images/img_189lCjWRw9V2G4efDTy24Gvk_9leVaFLv.jpg',
  '/assets/quiz-images/img_18Ku-DDQ_iiwcGqSztWQeQRXhwXE8vR-r.jpg',
  '/assets/quiz-images/img_19-wekixZcSS97Vlrm7-4f97apZDscbwK.jpg',
  '/assets/quiz-images/img_19pGDfg36t26XzmNxX2vT-4qFYZRzruas.jpg',
  '/assets/quiz-images/img_19P_cm4x99HIrOfOCfuZo9lGGtLyWIBFf.jpg',
  '/assets/quiz-images/img_19rWf3wq6cWU8ZahbEVA-9VqdDVv4Hn_O.jpg',
  '/assets/quiz-images/img_19sB7QvCf0rVcDTOnNysWWID69ThrXXCJ.jpg',
  '/assets/quiz-images/img_1a4HS8Mba06OXdjVxPJ-FGddn9yR7tbS3.jpg',
  '/assets/quiz-images/img_1aLzXVGaP2cod2ItEqapm51QiSZbmvpGw.jpg',
  '/assets/quiz-images/img_1AMfo3sDC49yWsDS0dJMStZrkU0T9devT.jpg',
  '/assets/quiz-images/img_1AMR3hS64hzTMZNdrTA8QRsA0DogfNt4S.jpg',
  '/assets/quiz-images/img_1AXE-1xiHOm5dHJ21GouXT3kj3a4QsomQ.jpg',
  '/assets/quiz-images/img_1AYopFjwLOuW9LR-jRHMFZCsQtZ89ZgAo.jpg',
  '/assets/quiz-images/img_1a_M1B3TAJsEzZmu8CuDCcrSSx0zeP0EV.jpg',
  '/assets/quiz-images/img_1b1wEx97sdejAQ0cRoqUE9GPZa6RiuvD0.jpg',
  '/assets/quiz-images/img_1BYbBJv1WaxbuzYnN4mmIK_eT9xUDmQB6.jpg',
  '/assets/quiz-images/img_1caCwWqkMSVwjqCC-XU0YCnyh6nNILMSs.jpg',
  '/assets/quiz-images/img_1cpavGIPjyCIysk3vLU4JOUAewn69DRzI.jpg',
  '/assets/quiz-images/img_1CSF-7IFkSXhfzk1vx558Xzpn3wvgTUsQ.jpg',
  '/assets/quiz-images/img_1Cto_yDxkETbmLv7xdSA6ATOU3-V1_6hq.jpg',
  '/assets/quiz-images/img_1CzkOTiTZ4GRP4R-08hkijxriHWa7raNf.jpg',
  '/assets/quiz-images/img_1Db2wnOJ00T5EpRiKUCOMwbzW9OdRNlBU.jpg',
  '/assets/quiz-images/img_1dethLsdEoFoeOH6B1Ng40FRruj8cedvs.jpg',
  '/assets/quiz-images/img_1dPVTtYjNE2KLtUj1QZAP2ZEoQbkE4AIq.jpg',
  '/assets/quiz-images/img_1e5-aLMQx1ZQTByxxUukSVk6prafZQbjD.jpg',
  '/assets/quiz-images/img_1edw6gpnfP3uDr_elZf8qTVoo0jUmXtg0.jpg',
  '/assets/quiz-images/img_1eh26Gn7agcqG0PBy0RglgM-UF_pYjGNd.jpg',
  '/assets/quiz-images/img_1eLxHyK0yGl7llJ9x_DlEyG19yPUukIsQ.jpg',
  '/assets/quiz-images/img_1eWlr558xcagxBqg4qSH0SJvg7t3H3Brq.jpg',
  '/assets/quiz-images/img_1EynYUzchCRrpVji0_8cFb6y-zO9Ew-mo.jpg',
  '/assets/quiz-images/img_1FFyOZY1AOQOu2ngqH6V6stw5zBJg5mng.jpg',
  '/assets/quiz-images/img_1FKNrsXz2CWtC4ZMdKfPT8hwLLgcL6xAk.jpg',
  '/assets/quiz-images/img_1FtRL6ve-T0_5Pg12YlaPa9wkDGYCYsmN.jpg',
  '/assets/quiz-images/img_1FXBFxBBvRtM6y8RdV6S0XnSSTOh4sq7p.jpg',
  '/assets/quiz-images/img_1fzNX1Dss0qREDff5Rl5Ssp2NeS7rQXmh.jpg',
  '/assets/quiz-images/img_1Gfx0id4LDTJVgYJRd2Yrlnu_NoXd1K-e.jpg',
  '/assets/quiz-images/img_1GhFyJObffD0mFcknXYEJo_MXZ0CJ0jdW.jpg',
  '/assets/quiz-images/img_1gwi_2_6IPtsj7e5bkiCKGLgE1URjGVoP.jpg',
  '/assets/quiz-images/img_1gwJvSfjKp5s9zX0Qi5Txk4hwlLlKxmHp.jpg',
  '/assets/quiz-images/img_1H9NcUVrypI5Xj3m0N-w7RxwinNNkZNqM.jpg',
  '/assets/quiz-images/img_1HDASr1MpighFnkY-ukLw4Fnl0q1ENqCT.jpg',
  '/assets/quiz-images/img_1Hhwf1qYvy6kHDLMmpsj2o8Ow8Vz1d8hX.jpg',
  '/assets/quiz-images/img_1HKGKUXX_qNNpTRbHRhhkEbBQBIh9tE5N.jpg',
  '/assets/quiz-images/img_1Ho5zSylBCIkJQMc9G41Xj6JiCqZN4bcZ.jpg',
  '/assets/quiz-images/img_1i3mOT9PRqYkq-I5mnaCZBh1R2f9mZVc_.jpg',
  '/assets/quiz-images/img_1i4rEAN-N33_nX-G68mPVs2xQkV5p8jDi.jpg',
  '/assets/quiz-images/img_1I8QT2TLPGeDCgWNcq4wxcLlIti4BTPf2.jpg',
  '/assets/quiz-images/img_1IdV8PGRsf0opflJOADfqSR4fzmq9l1xH.jpg',
  '/assets/quiz-images/img_1IHaqwnneL4Z8_Q8QxPiEI9hMgQZfV2N-.jpg',
  '/assets/quiz-images/img_1j2kjgvziCr70fIY8ngzwau_fnpM1KWcz.jpg',
  '/assets/quiz-images/img_1j4biInZi1OecPHzbiVtptQwlKAgZFlJT.jpg',
  '/assets/quiz-images/img_1JarXLmk5tfSpx9pZAnSPBrDXrU99K-_v.jpg',
  '/assets/quiz-images/img_1jLT8RTTKIubjh_Y2HcYQQc5AexI3vWjs.jpg',
  '/assets/quiz-images/img_1k85o51cD6BOi0L0EBVmtIPOlix6jzQMQ.jpg',
  '/assets/quiz-images/img_1K9VQQ2LKilYATNcHQI9Ljr3G_j8xi0tU.jpg',
  '/assets/quiz-images/img_1kAofVihQK66htKLodeyDZoAanKIl7ng1.jpg',
  '/assets/quiz-images/img_1KJgqu9p6RZyN2Nm391YI89mhNRaBe94E.jpg',
  '/assets/quiz-images/img_1KspmRFO2F5MXz1-nr4vJAhuDUA6b12qT.jpg',
  '/assets/quiz-images/img_1KwSqVhSna6gOKbaYWfLi_t_9A15BRJC3.jpg',
  '/assets/quiz-images/img_1L4BgeVZSZjhIajb59DpfHoa6fgn0eVib.jpg',
  '/assets/quiz-images/img_1LF1ArYMJUF2_CwI9D6_4FcU-2akBBUHZ.jpg',
  '/assets/quiz-images/img_1lHKWeXEgwuq2K9u1qOUndCZRikF0Q5Si.jpg',
  '/assets/quiz-images/img_1LH_RseAPuoh267xXbbJK3k018zXxPc3s.jpg',
  '/assets/quiz-images/img_1LQ_0P1h4aivR92tDT8MUus8l21_ICs30.jpg',
  '/assets/quiz-images/img_1Ltodhu8I_Zq1m_EyTrx6Av3jjaWyanPU.jpg',
  '/assets/quiz-images/img_1lwypMaHsL1WH9s2mhZRcF32wRa5wP0OF.jpg',
  '/assets/quiz-images/img_1m3tHvArXgjAxq8TulrByJ-OmzYlpWls6.jpg',
  '/assets/quiz-images/img_1M7WUvNiwTFeVKlDH9Hhe6u7FnKTMzZcj.jpg',
  '/assets/quiz-images/img_1M9Lr9lYfzexQYp_MXntiRY5MC4I95M97.jpg',
  '/assets/quiz-images/img_1MApz2z2u3zn8L3iJRpD87Mw5trwlocGV.jpg',
  '/assets/quiz-images/img_1MfnlhjMVyCzm2_J-VvfagA4TBBMNcTW0.jpg',
  '/assets/quiz-images/img_1mH95Hk2k14gn8O9GyRRMtgbxOsYednt4.jpg',
  '/assets/quiz-images/img_1mVoKSQjhFoD0DUFDem_JvYRQekjM0Guy.jpg',
  '/assets/quiz-images/img_1MZ6fy66rLhjOvhLkGWS7dYJSYHMXIhuY.jpg',
  '/assets/quiz-images/img_1NbPVPrCfGLj1aCgbkwT-ipxi64vRvvd8.jpg',
  '/assets/quiz-images/img_1Nu5cyKSZZ2fNDjeA6GcI4bbNzKU04LY3.jpg',
  '/assets/quiz-images/img_1NumEwnWQ5aLnIee_10X-kfQz1cvgFLuy.jpg',
  '/assets/quiz-images/img_1OBmm0vMficdOuf3bxgc2IQJDyQzeYth9.jpg',
  '/assets/quiz-images/img_1OZw69JzlAgn1_7whshvip-ZlniOxrQx-.jpg',
  '/assets/quiz-images/img_1PBDUYD6WMVW3gbl9Te6-zfCbnmAW2cqu.jpg',
  '/assets/quiz-images/img_1pGtXyHXw0gfkxtQ5aML7IFXrnlpykwR-.jpg',
  '/assets/quiz-images/img_1pPccrLeLHpe-w8K5y6_s-wmi6Xv063qX.jpg',
  '/assets/quiz-images/img_1pyOK9k20FoMHtQMm-4ALtewEmv5EOpBp.jpg',
  '/assets/quiz-images/img_1p_lFMQTaU0Hzkw2Wp53hbw1RRfHF09fQ.jpg',
  '/assets/quiz-images/img_1qUXw7JPcMDL3SmnDKxzrTmnndZ2EdACm.jpg',
  '/assets/quiz-images/img_1R4HykwR8DrZzq7bb2plVztUaM3_vdAef.jpg',
  '/assets/quiz-images/img_1R6l6oFN7_vqll4CPweskHe9Az101ICVM.jpg',
  '/assets/quiz-images/img_1RWEQ6IFugw5OIbbecDC00uQF0rZe0mXu.jpg',
  '/assets/quiz-images/img_1S8XrE3cr4zkMM-KTumpSFq3oM-SuPM1P.jpg',
  '/assets/quiz-images/img_1s9d4SeVlwEcxlfy2DZY383dnCfMJ79RS.jpg',
  '/assets/quiz-images/img_1Scf5YDzB-SMkjr8ZP06hv906YrGufOby.jpg',
  '/assets/quiz-images/img_1SEPNKTXLzFMS4fyjplDyLxnhpCq058iF.jpg',
  '/assets/quiz-images/img_1Sk2jiTUcm326qcSQ6vArXmRFyZ_nI_zR.jpg',
  '/assets/quiz-images/img_1SLTK1y0akmAnrRgUr1FNcMqc_yqd3vOE.jpg',
  '/assets/quiz-images/img_1SmHtNjdjoqpZfV-Olmf7q2XyjMBOijD_.jpg',
  '/assets/quiz-images/img_1T9hRMlUZe9VbQpp-OPbT64LN5fBsRz7U.jpg',
  '/assets/quiz-images/img_1Te0Cr78IHsKIt_y9Kl5UmGqZancfEjxB.jpg',
  '/assets/quiz-images/img_1tNHl9is47E1aSTySyf0rUkso7_qhGT1U.jpg',
  '/assets/quiz-images/img_1UeVb7dBEpS4AlQfuMvxGuMQaubPJTshQ.jpg',
  '/assets/quiz-images/img_1uHAmoNcV9k7O1gcEyxatx6rjV-yEa69e.jpg',
  '/assets/quiz-images/img_1UMeVWHNgwz92p7obvDHwftNHmEbyqknz.jpg',
  '/assets/quiz-images/img_1UxTtLlgSwNLBS5P1xYjo3Xh-sDxiZqGt.jpg',
  '/assets/quiz-images/img_1V-smo_bZF3HJUgGfj8fjCLUkEYG7HSZF.jpg',
  '/assets/quiz-images/img_1v1pPYQRVgqndDHwOh2UVosm0H6V4ih40.jpg',
  '/assets/quiz-images/img_1v71Ps4eIKZr-0eRKTAF5BxY3nP0lzhEs.jpg',
  '/assets/quiz-images/img_1vAQZGJPWIZLLgM0ySQdPdZ6eQDIoe3PG.jpg',
  '/assets/quiz-images/img_1vaYYDreeYZ9JNn7B0C8HArLc8t_fMRRL.jpg',
  '/assets/quiz-images/img_1vvpCJk8nwbsoHwuCHXvKPs1nR_9VqDpm.jpg',
  '/assets/quiz-images/img_1w-92MShepnLrmYj5VeUodSPLz8g0Ba3_.jpg',
  '/assets/quiz-images/img_1W5r-IpUiE03drqam9e1afP05oeOrBm-i.jpg',
  '/assets/quiz-images/img_1WHYnub1TbshHuYTgxZxs87pckM_9iMJ8.jpg',
  '/assets/quiz-images/img_1WwtxLPN_UksxIbKEwFI4Uy2637ZfzCxh.jpg',
  '/assets/quiz-images/img_1wyHskdogLj4sc2KKmI14rgS52Z8gl6Tq.jpg',
  '/assets/quiz-images/img_1xAZsSaIwP9_f8Ja03HW2LJ0VD6K8VU1d.jpg',
  '/assets/quiz-images/img_1xWqwngRanUx13DgDRFkr2LVy8PqnWu2Y.jpg',
  '/assets/quiz-images/img_1YlK1YY1obGPk17KjoPqqVvyGqivk2fQ7.jpg',
  '/assets/quiz-images/img_1z3B0-aRZP5QI1MwJ7kI8Ufzy1ByyK7bq.jpg',
  '/assets/quiz-images/img_1zhlK-JDI-CTgJqx3uU2J0oVi1JGtRhyt.jpg',
  '/assets/quiz-images/img_1zo9OIPjadc5le-NqFuLzy4_HXb8PJ4BK.jpg',
  '/assets/quiz-images/img_1zphySDOweGcWBenbjgOgozlB7mYUW1K5.jpg',
  '/assets/quiz-images/img_1_UpTP6IrwCZ14ihSoxAEMpLs2zIE8t49.jpg'
];

// Install Event - Precache App Shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Pre-caching App Shell');
        // Use a simple addAll, gracefully handling failures for specific files if any
        return Promise.allSettled(APP_SHELL.map(url => cache.add(url).catch(err => console.warn(`Failed to cache ${url}`, err))));
      })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Firebase API requests (Firestore handles its own offline persistence)
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('securetoken.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Update the cache with the new response
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
        console.warn('Network fetch failed, falling back to cache if available.', err);
      });

      // Return the cached response immediately, or wait for the network response
      return cachedResponse || fetchPromise;
    })
  );
});

// Message Event - Allow app to trigger manual asset caching
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_ASSETS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return Promise.allSettled(event.data.urls.map(url => cache.add(url)));
      }).then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});
