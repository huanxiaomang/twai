import type { Feed, FeedResponse, FeedAIResponse, Tweets } from '../src/types';
import { logger } from './logger';

const list1 = [
    {
        "tw_id": "7e8066317608fbb0d458f0bb72a7a29b",
        "url": "https://x.com/boshen_c/status/2001878127228891251",
        "title": "香草泥",
        "content": "In the l",
        "originText": "In the latest version of Oxfmt (better prettier replacement):\n\n• oxfmt --migrate prettier\n• oxfmit --init\n• oxfmt --stdin-filepath for pipe usage\n• Node.js API\n• Sort package.json fields by default\n• Respect root .editorconfig\n\nGive it a try:\n\n• https://t.co/O68UNpWalD",
        "date_published": "2025-12-19T04:51:00.000Z",
        "authors": [
            {
                "name": "@boshen_c"
            }
        ],
        "media": [],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "783008ee55035e9082c23beb081a5e23",
        "url": "https://x.com/voidzerodev/status/2001683010446299613",
        "title": "香草泥",
        "content": "Want to append or prepend content to your files? Then you can use `postBanner` and `postFooter` in @rolldown_rs now!\n\nThe difference to `banner` and `footer`: The content will be added AFTER minification, making sure that comments are not removed\n\nTry it in our REPL… pic.twitter.com/qRjoClkaBz— VoidZero (@voidzerodev) December 18, 2025\n",
        "originText": "Want to append or prepend content to your files? Then you can use `postBanner` and `postFooter` in @rolldown_rs now!\n\nThe difference to `banner` and `footer`: The content will be added AFTER minification...",
        "date_published": "2025-12-18T15:56:00.000Z",
        "authors": [
            {
                "name": "@voidzerodev"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/media/G8doFvLWUAA9P9t.jpg?name=small&format=webp",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "212a789daef1c79404fa4e1a7951c334",
        "url": "https://x.com/threepointone/status/2001671800053469478",
        "title": "香草泥",
        "content": "@jaredpalmer as part of saving github, could you also save npm? :) please and thank you from the internet.— sunil pai (@threepointone) December 18, 2025\n",
        "originText": "@jaredpalmer as part of saving github, could you also save npm? :) please and thank you from the internet.",
        "date_published": "2025-12-18T15:12:00.000Z",
        "authors": [
            {
                "name": "@threepointone"
            }
        ],
        "media": [],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "ef90c42594eb507d735671ed90f7bb46",
        "url": "https://x.com/boshen_c/status/2001670828996669760",
        "title": "香草泥",
        "content": "Do I know anyone who uses the angular CLI with NG_BUILD_OPTIMIZE_CHUNKS? It was previously using Rollup and now Rolldown.— Boshen (@boshen_c) December 18, 2025\n",
        "originText": "Do I know anyone who uses the angular CLI with NG_BUILD_OPTIMIZE_CHUNKS? It was previously using Rollup and now Rolldown.",
        "date_published": "2025-12-18T15:08:00.000Z",
        "authors": [
            {
                "name": "@boshen_c"
            }
        ],
        "media": [],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "87dd186cb5594dda46b75a70c08e434a",
        "url": "https://x.com/voidzerodev/status/2001342848898068784",
        "title": "香草泥",
        "content": "Want to understand why some of your @vitest_dev tests are slower than expected? Then you can use the built-in experimental @OpenTelemetry support to figure out what makes tests slow and how much time is spent on each part of it. 📈 \n\nWhen enabled, Vitest will generate traces… pic.twitter.com/Jyz5if6Mjf— VoidZero (@voidzerodev) December 17, 2025\n",
        "originText": "Want to understand why some of your @vitest_dev tests are slower than expected? Then you can use the built-in experimental @OpenTelemetry support...",
        "date_published": "2025-12-17T17:24:00.000Z",
        "authors": [
            {
                "name": "@voidzerodev"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/media/G8Yyts4XIAAylGf.jpg?name=small&format=webp",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "fdb60dfd9d294105ae5dc6c76366571e",
        "url": "https://x.com/Atinux/status/2001337705050058822",
        "title": "香草泥",
        "content": "Did we mention that you can also use it on a Vite + Vue project? https://t.co/kZf4Cbvew2— Sébastien Chopin (@Atinux) December 17, 2025\n",
        "originText": "Did we mention that you can also use it on a Vite + Vue project? https://t.co/kZf4Cbvew2",
        "date_published": "2025-12-17T17:04:00.000Z",
        "authors": [
            {
                "name": "@Atinux"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/amplify_video_thumb/2001320239263268864/img/4oNlfCTBDbSW0HJp.jpg",
                "type": "video"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "285aa74d9f96802c4abec6d1d52185bf",
        "url": "https://x.com/youyuxi/status/2001265098984476808",
        "title": "香草泥",
        "content": "Had to answer this multiple times already, but yes this is how it was picked :)— Evan You (@youyuxi) Dec 17, 2025",
        "originText": "Had to answer this multiple times already, but yes this is how it was picked :)",
        "date_published": "2025-12-17T12:15:00.000Z",
        "authors": [
            {
                "name": "@youyuxi"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/amplify_video_thumb/2000957603199774721/img/97r6NOggzXvzCWYh.jpg",
                "type": "video"
            }
        ],
        "is_rt": false,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "7003025698dabedec3138d5b62c52918",
        "url": "https://x.com/boshen_c/status/2001221950216266185",
        "title": "香草泥",
        "content": "Tailwind CSS is coming early in oxfmt! 🎅\n\nThe POC it based on was me telling Claude to work on two codebases simultaneously - oxc and prettier-plugin-tailwindcss.https://t.co/Om9Em2JSgX— Boshen (@boshen_c) December 17, 2025\n",
        "originText": "Tailwind CSS is coming early in oxfmt! 🎅\n\nThe POC it based on was me telling Claude to work on two codebases simultaneously...",
        "date_published": "2025-12-17T09:24:00.000Z",
        "authors": [
            {
                "name": "@boshen_c"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/card_img/2001221954209304576/NM6Lt4s0?format=jpg&name=800x419",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "a08baeb3270cebd7bc3d614aecb63557",
        "url": "https://x.com/cityjsconf/status/2001133594815648205",
        "title": "香草泥",
        "content": "CityJS Conference is back in #Singapore! Join 20 speakers including @youyuxi, @coderkungfu free workshops, free meetups, and a full day exploring the latest trends in JavaScript and AI. Learn, connect, and level up your skills. \n\nGet your tickets now!https://t.co/faaVtt4rtS pic.twitter.com/xllxuLUDoN— CityJS Conferences (@cityjsconf) December 17, 2025\n",
        "originText": "CityJS Conference is back in #Singapore! Join 20 speakers including @youyuxi, @coderkungfu free workshops...",
        "date_published": "2025-12-17T03:33:00.000Z",
        "authors": [
            {
                "name": "@cityjsconf"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/ext_tw_video_thumb/2001133559327682560/pu/img/ofXHZ07ZUBHRoIO0.jpg",
                "type": "video"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "6a4b449867495e531f6d51b4b8b827c8",
        "url": "https://x.com/serkodev/status/2000974800085508112",
        "title": "香草泥",
        "content": "In the next update of @vuejs language tools, we're shipping a brand-new Rich Hover Message feature ✨\nHover any Vue component to see beautifully formatted Props & Slots, all auto-generated.\nBuilt to bring your DX to the next level 🚀 More details coming soon, stay tuned! 👀 pic.twitter.com/JnbmfhLr51— SerKo (@serkodev) December 16, 2025\n",
        "originText": "In the next update of @vuejs language tools, we're shipping a brand-new Rich Hover Message feature ✨\nHover any Vue component...",
        "date_published": "2025-12-16T17:02:00.000Z",
        "authors": [
            {
                "name": "@serkodev"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/amplify_video_thumb/2000974502415753219/img/1n1NbNuOgqLw5SVj.jpg",
                "type": "video"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "db8869f635624b70f822301f12883cec",
        "url": "https://x.com/voidzerodev/status/2000959462538912162",
        "title": "香草泥",
        "content": "Yes, @rolldown_rs is supporting Rollup's plugin API which is also the base of @vite_js plugins. But did you know that Rolldown also aligns with certain features from esbuild natively?\n\nIn turn, you can use `define` and `inject` without any extra plugins. Just define them via your…— VoidZero (@voidzerodev) December 16, 2025\n",
        "originText": "Yes, @rolldown_rs is supporting Rollup's plugin API which is also the base of @vite_js plugins. But did you know that Rolldown also aligns...",
        "date_published": "2025-12-16T16:01:00.000Z",
        "authors": [
            {
                "name": "@voidzerodev"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/card_img/1999110434100559872/QM1n4mXs?format=png&name=800x419",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "bd538e246896dcf45ea368bf798b1785",
        "url": "https://x.com/Cameron_C2/status/2000540121586647082",
        "title": "香草泥",
        "content": "Oxlint v1.33.0 & oxfmt v0.18.0 are out! 🚀\n\n→ 14 new rules!\n→ RuleTester enhancements for custom plugins\n→ lots of formatter CLI!\n→ package.json sorting\n→ `quoteProps` support\n→ 11 perf improvements!\n→ 10 formatter & 16 linter fixes!\n→ more doc improvements!— Cam (@Cameron_C2) December 15, 2025\n",
        "originText": "Oxlint v1.33.0 & oxfmt v0.18.0 are out! 🚀\n\n→ 14 new rules!\n→ RuleTester enhancements for custom plugins\n→ lots of formatter CLI!...",
        "date_published": "2025-12-15T12:15:00.000Z",
        "authors": [
            {
                "name": "@Cameron_C2"
            }
        ],
        "media": [],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "c45b52001ec2faf4365b8fa29da57be5",
        "url": "https://x.com/youyuxi/status/2000369778113024046",
        "title": "香草泥",
        "content": "This is cool:\n\nrolldphobia.ssssota.dev/\n\nBundlephopia but powered by Rolldown and esm.sh and runs entirely in your browser!\n\nby @ssssotaro— Evan You (@youyuxi) Dec 15, 2025",
        "originText": "This is cool:\n\nrolldphobia.ssssota.dev/\n\nBundlephopia but powered by Rolldown and esm.sh and runs entirely in your browser!\n\nby @ssssotaro",
        "date_published": "2025-12-15T00:58:00.000Z",
        "authors": [
            {
                "name": "@youyuxi"
            }
        ],
        "media": [],
        "is_rt": false,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "6ffbfa0b1ce6879a225b45486ad0024e",
        "url": "https://x.com/Cameron_C2/status/1999829905635201112",
        "title": "香草泥",
        "content": "Want to write your own JS plugin for oxlint? Here's how! 🚀 pic.twitter.com/6O484VTfCG— Cam (@Cameron_C2) December 13, 2025\n",
        "originText": "Want to write your own JS plugin for oxlint? Here's how! 🚀 pic.twitter.com/6O484VTfCG",
        "date_published": "2025-12-13T13:12:00.000Z",
        "authors": [
            {
                "name": "@Cameron_C2"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/media/G8DR1BcW0AQIQ3i.jpg?name=small&format=webp",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "409b9369a172cfb9c620554cd2e532f3",
        "url": "https://x.com/TheAlexLichter/status/1999590719623741714",
        "title": "香草泥",
        "content": "I had to show that feature in action and tell something about Hook Filters. The best is that it works framework-agnostic and gives great indicators without being a profiling pro.\n\nIt already helped improving perf in @nuxt_js. More to come.\n\nVideo up now on my YouTube channel 👀 https://t.co/3ELWQA5kow pic.twitter.com/yg6uOmttZp— Alexander Lichter (@TheAlexLichter) December 12, 2025\n",
        "originText": "I had to show that feature in action and tell something about Hook Filters. The best is that it works framework-agnostic...",
        "date_published": "2025-12-12T21:22:00.000Z",
        "authors": [
            {
                "name": "@TheAlexLichter"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/media/G7_48bcXAAQk0PD.jpg?name=small&format=webp",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "22e41693efef9344278265beccbfd3ef",
        "url": "https://x.com/youyuxi/status/1999324546160296269",
        "title": "香草泥",
        "content": "So many fine details improvements in Vue language-tools happening - @serkodev and @johnsoncodehk are doing a fantastic job!— Evan You (@youyuxi) Dec 12, 2025",
        "originText": "So many fine details improvements in Vue language-tools happening - @serkodev and @johnsoncodehk are doing a fantastic job!",
        "date_published": "2025-12-12T03:44:00.000Z",
        "authors": [
            {
                "name": "@youyuxi"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/media/G75Zuq4bsAE77pz.jpg?name=small&format=webp",
                "type": "image"
            }
        ],
        "is_rt": false,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "0d01cc91ebe89345feb2f3489e8c3e05",
        "url": "https://x.com/reactjs/status/1999217365628903739",
        "title": "香草泥",
        "content": "Researchers have found two new vulnerabilities in React Server Components while attempting to exploit the patches last week.\n\nThese are new issues, separate from the critical CVE last week. The patch for React2Shell remains effective for the Remote Code Execution exploit.— React (@reactjs) December 11, 2025\n",
        "originText": "Researchers have found two new vulnerabilities in React Server Components while attempting to exploit the patches last week.\n\nThese are new issues...",
        "date_published": "2025-12-11T20:38:00.000Z",
        "authors": [
            {
                "name": "@reactjs"
            }
        ],
        "media": [],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "a06715d7853c15bb688c061e2d84907d",
        "url": "https://x.com/voidzerodev/status/1999207444296171982",
        "title": "香草泥",
        "content": "✨ Hot from the release press: When using @rolldown_rs and experiencing a slow build, you now see which plugins slow your build down!\n\nNote that the reported time is an indication and includes overhead such as Rust-side processing, async scheduling, NAPI data conversion, and… pic.twitter.com/unJvXUaVkj— VoidZero (@voidzerodev) December 11, 2025\n",
        "originText": "✨ Hot from the release press: When using @rolldown_rs and experiencing a slow build, you now see which plugins slow your build down!...",
        "date_published": "2025-12-11T19:59:00.000Z",
        "authors": [
            {
                "name": "@voidzerodev"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/media/G76ck2lX0AA7jAF.jpg?name=small&format=webp",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "8af88579505ef75893b8b5a0bd084dcd",
        "url": "https://x.com/voidzerodev/status/1998846844537901499",
        "title": "香草泥",
        "content": "You can now break down import and transform times in @vitest_dev! This works in the Vitest UI, the terminal and also via the VS Code extension.\n\nTime to find out why tests are taking longer than expected! 👀\n\nMore in the docshttps://t.co/YH7nNb1cLx pic.twitter.com/ZeJa3e2N8t— VoidZero (@voidzerodev) December 10, 2025\n",
        "originText": "You can now break down import and transform times in @vitest_dev! This works in the Vitest UI, the terminal...",
        "date_published": "2025-12-10T20:06:00.000Z",
        "authors": [
            {
                "name": "@voidzerodev"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/media/G71UnK1WwAAVp9x.jpg?name=small&format=webp",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "c986187e3ec51d00429a5917a25aa136",
        "url": "https://x.com/vueconfus/status/1998802423234609446",
        "title": "香草泥",
        "content": "Early bird tickets for VueConf US end December 14! ✨\n\nLearn straight from @youyuxi and core @vuejs team, discover new Vue features, join advanced workshops, and connect with devs building the future of the ecosystem. \n\nGrab your discounted ticket now!\n🎟️ https://t.co/g1GIE1wHnw pic.twitter.com/cm0GCgmeu8— Vueconf.US (@vueconfus) December 10, 2025\n",
        "originText": "Early bird tickets for VueConf US end December 14! ✨\n\nLearn straight from @youyuxi and core @vuejs team...",
        "date_published": "2025-12-10T17:10:00.000Z",
        "authors": [
            {
                "name": "@vueconfus"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/ext_tw_video_thumb/1998801193745760256/pu/img/WmxLl1HKgxVm1WgK.jpg",
                "type": "video"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "755dec9f92769f4314a8edb2453c3e28",
        "url": "https://x.com/boshen_c/status/1998745639891644918",
        "title": "香草泥",
        "content": "oxlint --type-check -> sanityhttps://t.co/Hp2hAcdBXh— Boshen (@boshen_c) December 10, 2025\n",
        "originText": "oxlint --type-check -> sanityhttps://t.co/Hp2hAcdBXh",
        "date_published": "2025-12-10T13:24:00.000Z",
        "authors": [
            {
                "name": "@boshen_c"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/card_img/2001286319570382848/yQiUNh3M?format=jpg&name=800x419",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "00e98d5afc44a26f3f86335fb9b62414",
        "url": "https://x.com/CFchangelog/status/1998701931087425947",
        "title": "香草泥",
        "content": "Deploy static sites with Cloudflare Workers & Vite just got easier! 🎉 No more mandatory Wrangler config needed – the Vite plugin now generates defaults. Streamline your workflow! 🚀 SPAs still need that `assets.not_found_handling` setting. 😉https://t.co/ZSgIuvmNjW— Cloudflare Changelog (@CFchangelog) December 10, 2025\n",
        "originText": "Deploy static sites with Cloudflare Workers & Vite just got easier! 🎉 No more mandatory Wrangler config needed...",
        "date_published": "2025-12-10T10:30:00.000Z",
        "authors": [
            {
                "name": "@CFchangelog"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/card_img/2001238794507575297/21bSuISV?format=jpg&name=800x419",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "ca073f2580af5bf29749e9ad7c067885",
        "url": "https://x.com/serkodev/status/1998342118364828159",
        "title": "香草泥",
        "content": "the latest @vuejs language tools now support \"Format Selection\" in VS Code ✨ you can format only the parts of your code you want! pic.twitter.com/dp3f14Z1bn— SerKo (@serkodev) December 9, 2025\n",
        "originText": "the latest @vuejs language tools now support \"Format Selection\" in VS Code ✨ you can format only the parts of your code you want!",
        "date_published": "2025-12-09T10:41:00.000Z",
        "authors": [
            {
                "name": "@serkodev"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/amplify_video_thumb/1998340029723332608/img/5_hs-okc_4moXa87.jpg",
                "type": "video"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "a71a0d1a4614f5abf595acdd7f054ab8",
        "url": "https://x.com/voidzerodev/status/1998089757318865092",
        "title": "香草泥",
        "content": "Announcing Oxlint Type-Aware Linting Alpha 🎁\n\nJust a few months after our technical preview, type-aware linting reaches the alpha milestone!\n\n✨ Type-aware rules can now be configured\n🙈 Inline comments to disable rules work for type-aware rules too\n✔ Auto fixes for type-aware…— VoidZero (@voidzerodev) December 8, 2025\n",
        "originText": "Announcing Oxlint Type-Aware Linting Alpha 🎁\n\nJust a few months after our technical preview, type-aware linting reaches the alpha milestone!...",
        "date_published": "2025-12-08T17:58:00.000Z",
        "authors": [
            {
                "name": "@voidzerodev"
            }
        ],
        "media": [
            {
                "url": "https://pbs.twimg.com/card_img/2000626557249896448/vMahB6mu?format=jpg&name=800x419",
                "type": "image"
            }
        ],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    },
    {
        "tw_id": "8c8b4201e1c2ee88062d2e84001210d7",
        "url": "https://x.com/Cameron_C2/status/1998043127802953814",
        "title": "香草泥",
        "content": "Oxlint v1.32.0 & oxfmt v1.17.0 are out! 🚀\n\n→ new rule: eslint/no-useless-return\n→ globals support for custom plugins\n→ fix support for type aware rules\n→ 7x formatter bug fixes\n→ 30+ linter bug fixes— Cam (@Cameron_C2) December 8, 2025\n",
        "originText": "Oxlint v1.32.0 & oxfmt v1.17.0 are out! 🚀\n\n→ new rule: eslint/no-useless-return\n→ globals support for custom plugins...",
        "date_published": "2025-12-08T14:52:00.000Z",
        "authors": [
            {
                "name": "@Cameron_C2"
            }
        ],
        "media": [],
        "is_rt": true,
        "is_translated": false,
        "tags": [
            "tech"
        ]
    }
];



const list = [
    {
        author: {
            author_id: "@youyuxi",
            author_name: "youyuxi",
            author_favicon: "https://pbs.twimg.com/profile_images/1856284397072478208/hSEXLkPN_400x400.jpg"
        },
        tweets: list1.map((item) => ({
            ...item,
            author: {
                author_id: "@youyuxi",
                author_name: "youyuxi",
                author_favicon: "https://pbs.twimg.com/profile_images/1856284397072478208/hSEXLkPN_400x400.jpg"
            }
        }))
    }
] as Tweets[];

/**
 * Fetch feed with caching logic
 */
export const fetchFeedItem = async (feedUrl: string): Promise<FeedResponse> => {
    // await delay(800);
    const cacheKey = `feed_${feedUrl}`;

    // const cachedData = storage.get<FeedResponse>(cacheKey);
    // if (cachedData) {
    //     logger.info(`Cache hit for ${cacheKey}`);
    //     return cachedData;
    // }

    logger.info(`Cache miss for ${cacheKey}, fetching...`);
    try {

        const data: FeedResponse = {
            feed: {
                name: "前端圈",
                feed_id: "web",
                feed_url: "github.com",
                avatar: "https://vuejs.org/images/logo.png",
                version: "1.0",
                ai_bots: [
                    {
                        bot_id: "faker",
                        name: "AI讲师",
                        avatar: "https://vuejs.org/images/logo.png",
                        description: "AI Bot 1 description",
                        prompt: "AI Bot 1 prompt"
                    },
                    {
                        bot_id: "fucker",
                        name: "网络喷子",
                        avatar: "https://vuejs.org/images/logo.png",
                        description: "AI Bot 1 description",
                        prompt: "AI Bot 1 prompt"
                    }
                ]
            },
            list,
            tags_info: [
                { tag_id: 'tech', tag_name: '技术', tag_count: 5 },
                { tag_id: 'leisure', tag_name: '休闲', tag_count: 200 },
                { tag_id: 'food', tag_name: '美食', tag_count: 0 },
                { tag_id: 'adult', tag_name: '成人', tag_count: 100 },
            ],
            feed_ai_analysis: {}
        }
        // storage.set(cacheKey, data);

        return data;
    } catch (error) {
        logger.error('Fetch error:', error);
        throw error;
    }
};

export const fetchFeedsAIItem = async (feedUrl: string): Promise<FeedAIResponse> => {
    // await delay(800);
    const cacheKey = `feed_${feedUrl}_ai`;

    // const cachedData = storage.get<FeedAIResponse>(cacheKey);
    // if (cachedData) {
    //     logger.info(`Cache hit for ${cacheKey}`);
    //     return cachedData;
    // }

    logger.info(`Cache miss for ${cacheKey}, fetching...`);
    try {
        const data: FeedAIResponse = {
            feed_ai_analysis: {
                'overview': `
## 🛠️ 前端技术圈最新动态（tech）

近期前端工具链迭代非常活跃，主要集中在 Oxc 项目（Oxlint / oxfmt）、Rolldown、Vitest 与 Vue 生态：

- **Oxlint 与 oxfmt 持续高速迭代**：新增 14 条 lint 规则、package.json 自动排序、quoteProps 支持、Tailwind CSS 插件即将上线、类型感知 linting 正式进入 Alpha 阶段（支持规则配置、内联禁用注释、自动修复），同时发布多个版本带来大量 bug 修复与性能优化。<tweet-link tw-id="fdb60dfd9d294105ae5dc6c76366571e">Oxlint v1.33</tweet-link><tweet-link tw-id="7003025698dabedec3138d5b62c52918">Tailwind 支持</tweet-link><tweet-link tw-id="a71a0d1a4614f5abf595acdd7f054ab8">类型感知 Alpha</tweet-link><tweet-link tw-id="8c8b4201e1c2ee88062d2e84001210d7">Oxlint v1.32</tweet-link>

- **Rolldown 功能大幅增强**：新增 postBanner/postFooter（minify 后安全添加内容）、原生支持 esbuild 的 define/inject 无需插件、构建慢时自动显示各插件耗时、Angular CLI 的 NG_BUILD_OPTIMIZE_CHUNKS 已切换至 Rolldown 取代 Rollup，此外还出现了完全浏览器内运行的 Rolldown 驱动 bundle 大小分析工具 rolldphobia。<tweet-link tw-id="783008ee55035e9082c23beb081a5e23">postBanner</tweet-link><tweet-link tw-id="db8869f635624b70f822301f12883cec">define/inject</tweet-link><tweet-link tw-id="a06715d7853c15bb688c061e2d84907d">插件耗时</tweet-link><tweet-link tw-id="ef90c42594eb507d735671ed90f7bb46">Angular 切换</tweet-link><tweet-link tw-id="c45b52001ec2faf4365b8fa29da57be5">rolldphobia</tweet-link>

- **Vitest 诊断能力提升**：新增实验性 OpenTelemetry 支持追踪测试慢点、UI/终端/VSCode 扩展支持细分 import 与 transform 时间，帮助开发者快速定位性能瓶颈。<tweet-link tw-id="87dd186cb5594dda46b75a70c08e434a">OpenTelemetry</tweet-link><tweet-link tw-id="8af88579505ef75893b8b5a0bd084dcd">时间细分</tweet-link>

- **Vue 生态工具持续精进**：Vue Language Tools 新增 Rich Hover（组件 props/slots 美化悬停显示）、支持 VSCode “仅格式化选区”、大量细节优化；此外还有 Vite + Vue 项目相关演示、VueConf US 早鸟票提醒等。<tweet-link tw-id="6a4b449867495e5314f6d51b4b8b827c8">Rich Hover</tweet-link><tweet-link tw-id="ca073f2580af5bf29749e9ad7c067885">格式化选区</tweet-link><tweet-link tw-id="22e41693efef9344278265beccbfd3ef">细节优化</tweet-link>

更多内容持续更新中～
`,
                'summary': 'summary',
            },
            feed_item_ai_bots_content: (() => {
                const res = {};
                [...list1, ...list2].forEach((item) => {
                    const res1 = {}
                    res1[item.tw_id] = {
                        'faker': `![npm](https://img.shields.io/npm/v/vue-use-active-scroll?color=46c119) ![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/smastrom/vue-use-active-scroll/tests.yml?branch=main&label=tests)
![dependency-count](https://img.shields.io/badge/dependency%20count-0-success)

# Vue Use Active Scroll

[Live Demo](https://vue-use-active-scroll.netlify.app/) — Examples: [With Template Refs](https://stackblitz.com/edit/vitejs-vite-sywzg8?file=src%252Fpages%252FIndex.vue) - [Nuxt Content Nested TOC](https://stackblitz.com/edit/github-oh85gq?file=components%2FSidebar.vue)

<br />

## Why?

The [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a great API.
But it may not be the one-size-fits-all solution to highlight TOC/sidebar links as it makes hard if not impossible to:

- Highlight any clicked link even if it will never intersect
- Always highlight first/last link once reached the top/bottom of the page
- Get consistent results regardless of scroll speed
- Immediately highlight links on click/hash navigation if smooth scrolling is enabled
- Avoid unnatural highlighting with custom easings or smooth scrolling

**Vue Use Active Scroll** implements a custom scroll observer which automatically adapts to any type of scroll behavior and trigger and always returns the "correct" active target.

### Do you really need it?

If you and your users don't care about the above gotchas, then no, please **don't use this package** because it adds a couple of unnecessary KBs to your bundle.
You can achieve an acceptable result with the Intersection Observer API as well. Alternatively, you can build an accurate scroll observer that acts similar to this package by looking at the [SvelteKit Website's TOC](https://github.com/sveltejs/site-kit/blob/master/packages/site-kit/src/lib/docs/DocsOnThisPage.svelte) source code in 100-150 lines of code.

<br />

## Features

- Precise and stable at any speed
- CSS scroll-behavior or JS scroll agnostic
- Adaptive behavior on mount, hash and prev/next navigation, scroll, click, cancel.
- Customizable offsets for each scroll direction
- Customizable offsets for first and last target
- Customizable behavior on top/bottom reached
- Supports custom scrolling containers
- Supports both plain ids and template refs

### What it doesn't do?

- **Scroll to targets**
- Mutate the DOM and inject styles
- Require specific scroll behavior
- Require or configure hash navigation

<br />

## Getting Started

### Installation

\`\`\`bash
pnpm add vue-use-active-scroll
# yarn add vue-use-active-scroll
# npm i vue-use-active-scroll
# bun add vue-use-active-scroll
\`\`\`

> [!WARNING]
> If you plan to use this package with scroll to anchors (e.g. docs TOC) and you're not using Nuxt, Vue Router is required and \`scrollBehavior\` must be configured in the router instance by following the next section.

### Configure \`scrollBehavior\`

> [!NOTE]
> If using **Nuxt**, you can skip to the [next section](#set-css-scroll-behavior) as it's already taken care for you by the framework.

As explained in the above warning, Vue Router needs to be configured in order to scroll to anchors.

\`\`\`js
const router = createRouter({
   // Add this method 👇
   scrollBehavior(to) {
      if (to.hash) {
         return {
            el: to.hash,
         }
      }
   },
})
\`\`\`

The above is the bare minimum required to get started and it will make sure that when clicking on a \`RouterLink\` that has an anchor in its \`href\` the window will scroll to that element.

> Later on, see the [Vue Router Section](#vue-router---additional-configurations) for additional configurations (container scroll, fixed header offsets, etc.).

### Set CSS \`scroll-behavior\`

Somewhere in your global CSS, add the following rule to enable smooth scrolling:

\`\`\`css
html {
   scroll-behavior: smooth; /* or 'auto' if you prefer instant scrolling */
}
\`\`\`

> Later on, see the [Scroll Behavior Section](#scroll-behavior-and-types) for additional scroll configurations or on how to use JS-based scrolling.

<br />

## Usage

This package exports a single composable named \`useActiveScroll\` which accepts an array of targets to observe with the following signature:

\`\`\`ts
type Targets = Ref<HTMLElement[]> | Ref<string[]>
\`\`\`

You can provide targets using template refs, HTML elements or DOM IDs.

The composable returns an object with properties to react to the active link and a **method to include in your click handler**: it doesn't scroll to targets and it's required if scroll is also originated by clicks.

\`\`\`ts
const { setActive, activeId, activeIndex /*, ... */ } = useActiveScroll(targets)
\`\`\`

---

### Scenario 1 - Template refs (preferred)

If you are in charge of rendering the content nodes (e.g. using \`v-for\`), simply pass the template refs to \`useActiveScroll\`:

\`\`\`vue
<script setup>
import { ref, reactive, computed } from 'vue'
import { useActiveScroll } from 'vue-use-active-scroll'
// This may come from a CMS, markdown file, etc.
const content = reactive([
   { id: 'introduction', title: 'Introduction', content: '...' },
   { id: 'quick-start', title: 'Quick Start', content: '...' }, // ...
])
const links = computed(() =>
   content.map(({ id, title }) => ({ href: id, label: title }))
)
const targets = ref([])
const { setActive, activeId } = useActiveScroll(targets)
</script>
<template>
   <!-- Content -->
   <section v-for="section in content">
      <h2 :id="section.id" ref="targets">{{ section.title }}</h2>
      <p>{{ section.content }}</p>
   </section>
   <!-- Sidebar -->
   <nav>
      <RouterLink
         v-for="link in links"
         @click="setActive(link.href)"
         :key="link.href"
         :to="{ hash: \`#\${link.href}\` }"
         :ariaCurrentValue="link.href === activeId"
         :class="{ 'sidebar-link--active': link.href === activeId }"
      >
         {{ link.label }}
      </RouterLink>
   </nav>
</template>
\`\`\`

### Scenario 2 - Nuxt Content \`<ContentDoc />\`

Nuxt Content is great because not only automatically applies IDs to your headings, but also provides a \`useContent\` composable to query a reactive TOC in any component.

Since the object is reactive and kept in sync with the content, you can directly pass the IDs to \`useActiveScroll\`:

\`\`\`vue
<script setup lang="ts">
import { useActiveScroll } from 'vue-use-active-scroll'
const { toc } = useContent()
// ['introduction', 'introduction-sub-1', 'quick-start']
const ids = computed(() =>
   toc.value.links.flatMap(({ id, children = [] }) => [
      id,
      ...children.map(({ id }) => id), // Flatten any nested link
   ])
)
const { setActive, activeId } = useActiveScroll(ids)
</script>
<template>
   <ContentDoc />
   <nav>
      <NuxtLink
         v-for="link in toc.links"
         @click="setActive(link.id)"
         :key="link.id"
         :to="\`#\${link.id}\`"
         :ariaCurrentValue="link.href === activeId"
         :class="{ 'sidebar-link--active': activeId === link.id }"
      >
         {{ link.text }}
      </NuxtLink>
   </nav>
</template>
\`\`\`

<details>
   <summary>
      <h3>Scenario 3 - Incoming HTML</h3>
   </summary>

In this case, you must query the DOM in an \`onMounted\` hook or a watcher in order to get the targets.

Many CMSs already append IDs to markup headings. In case yours doesn't, you can add them manually.

The below example also shows how to compute the sidebar links in case you are not able to retrieve them in advance in order to cover the worst case scenario.

\`\`\`vue
<script setup>
import { ref, watch } from 'vue'
import { useActiveScroll } from 'vue-use-active-scroll'
const container = ref(null)
const targets = ref([])
const links = ref([])
function resetTargets() {
   targets.value = []
   links.value = []
}
function setTargets(container) {
   const _targets = []
   const _links = []
   container.querySelectorAll('h2').forEach((h2) => {
      /**
       * Add IDs to headings if your CMS doesn't
       */
      h2.id = h2.textContent.toLowerCase().replace(/\\s+/g, '-')
      _targets.push(h2)
      _links.push({ href: h2.id, label: h2.textContent })
   })
   links.value = _links
   targets.value = _targets
}
watch(container, (c) => (c ? setTargets(c) : resetTargets()), {
   immediate: true,
   flush: 'post',
})
const { setActive, activeId } = useActiveScroll(targets)
</script>
<template>
   <!-- Content -->
   <article v-html="data.html" ref="container" />
   <!-- Sidebar -->
   <nav>
      <RouterLink
         v-for="link in links"
         @click="setActive(link.href)"
         :key="link.href"
         :to="{ hash: \`#\${link.href}\` }"
         :ariaCurrentValue="link.href === activeId"
         :class="{ 'sidebar-link--active': link.href === activeId }"
      >
         {{ link.label }}
      </RouterLink>
   </nav>
</template>
\`\`\`
</details>

<br />

## Customization

### \`useActiveScroll\` options

\`useActiveScroll\` accepts an optional configuration object as last argument:

\`\`\`js
const { activeId, setActive } = useActiveScroll(targets, {
   // ...
})
\`\`\`

| Property       | Type                                                | Default                    | Description                                                                                                                                                                                                 |
|----------------|-----------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| jumpToFirst    | \`boolean\`                                         | true                       | Whether to set the first target on mount as active even if not (yet) intersecting.                                                                                                                          |
| jumpToLast     | \`boolean\`                                         | true                       | Whether to set the last target as active once reached the bottom even if previous targets are entirely visible.                                                                                             |
| boundaryOffset | \`BoundaryOffset\`                                  | { toTop: 0, toBottom: 0 }  | Boundary offset in px for each scroll direction. Tweak them to "anticipate" or "delay" target detection.                                                                                                   |
| edgeOffset     | \`EdgeOffset\`                                      | { first: 100, last: -100 } | Offset in px for fist and last target. \`first\` has no effect if \`jumpToFirst\` is true. Same for \`last\` if \`jumpToLast\` is true.                                                                     |
| root           | \`HTMLElement \\| null\` \\| \`Ref<HTMLElement \\| null>\` | null                       | Scrolling element. Set it only if your content **is not scrolled** by the window. If _null_, defaults to _document.documentElement_.                                                                        |
| replaceHash    | \`boolean\`                                         | false                      | Whether to replace URL hash on scroll. First target is ignored if \`jumpToFirst\` is true.                                                                                                                |
| overlayHeight  | \`number\`                                          | 0                          | Height in pixels of any **CSS fixed** content that overlaps the top of your scrolling area (e.g. fixed header). Must be paired with a CSS [scroll-margin-top](#setting-scroll-margin-top-for-fixed-headers) rule. |
| minWidth       | \`number\`                                          | 0                          | Whether to toggle listeners and functionalities within a specific width. Useful if hiding the sidebar using \`display: none\`.                                                                             |

#### Return object

| Name        | Type                                         | Description                                                                                  |
|-------------|----------------------------------------------|----------------------------------------------------------------------------------------------|
| setActive   | \`(id: string \\| el: HTMLElement) => void\` | :firecracker: Function to include in your click handler to ensure adaptive behavior.         |
| isActive    | \`(id: string \\| el: HTMLElement) => boolean\` | Whether the given ID or element is active or not                                                     |
| activeEl    | \`Ref<HTMLElement \\| null>\`                | Active target element                                                                        |
| activeId    | \`Ref<string>\`                              | Active target ID                                                                             |
| activeIndex | \`Ref<number>\`                              | Index of the active target in offset order, \`0\` for the first target and so on.            |

### Scroll behavior and types

You're free to choose between CSS _scroll-behavior_ (smooth or auto), [scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) or even a JS library like [animated-scroll-to](https://github.com/Stanko/animated-scroll-to).

#### CSS (recommended)

- Content scrolled by the window:

\`\`\`css
html {
   scroll-behavior: smooth; /* or 'auto' */
}
\`\`\`

- Content scrolled by a container:

\`\`\`css
.scrolling-container {
   scroll-behavior: smooth;
}
\`\`\`

<details><summary><h4>JS-based scroll</h4></summary>

\`\`\`vue
<script setup>
import { useActiveScroll } from 'vue-use-active-scroll'
import animateScrollTo from 'animated-scroll-to'
// ...
const { setActive, activeId } = useActiveScroll(targets)
function scrollTo(event, id) {
   // ...
   setActive(id) // 👈🏻 Include setActive
   animateScrollTo(document.getElementById(id), {
      easing: easeOutBack,
      minDuration: 300,
      maxDuration: 600,
   })
}
</script>
<template>
   <button
      v-for="link in links"
      @click="scrollTo($event, link.href)"
      :class="{ 'sidebar-btn--active': link.href === activeId }"
   >
      {{ link.label }}
   </button>
</template>
\`\`\`
</details>

### Vue Router - Additional Configurations

#### Scrolling to anchors inside a container

To scroll to a target inside of a container, use _scrollIntoView_ method and pass the target's ID.

\`\`\`js
const router = createRouter({
   // ...
   scrollBehavior(to) {
      if (to.hash) {
         // Content scrolled by a container
         if (to.name === 'PageNameUsingContainer') {
            return document.querySelector(to.hash).scrollIntoView()
         }
         // Content scrolled by the window
         return {
            el: to.hash,
            // top: 100 // Eventual fixed header (overlayHeight)
         }
      }
   },
})
\`\`\`

> :bulb: There's no need to define _smooth_ or _auto_ here. Adding the [CSS rule](#2-define-scroll-behavior) is enough.
> :bulb: There's no need need to set overlayHeight if using \`scrollIntoView\` as the method is aware of target's \`scroll-margin-top\` property.

#### Scrolling from anchors back to the page root

To navigate back to the top of the same page (e.g. clicking on browser's back button from hash to the page root), use the _scroll_ method for containers and return _top_ for content scrolled by the window.

\`\`\`js
const router = createRouter({
   // ...
   scrollBehavior(to, from) {
      if (from.hash && !to.hash) {
         // Content scrolled by a container
         if (
            to.name === 'PageNameUsingContainer' &&
            from.name === 'PageNameUsingContainer'
         ) {
            return document.getElementById('scrolling_container').scroll(0, 0)
         }
         // Content scrolled by the window
         return { top: 0 }
      }
   },
})
\`\`\`

#### Preventing the hash from being pushed

You may noticed that when clicking on a link, a new entry is added to the history. When navigating back, the page will scroll to the previous target and so on.

To disable this, choose to replace instead of pushing the hash:

\`\`\`vue
<template>
   <!-- ... -->
   <RouterLink
      @click="setActive(link.href)"
      :to="{ hash: \`#\${item.href}\`, replace: true /* 👈🏻 */ }"
      :class="{
         active: link.href === activeId,
      }"
   />
   <!-- ... -->
</template>
\`\`\`

### Setting scroll-margin-top for fixed headers

You might noticed that if you have a fixed header and defined an \`overlayHeight\`, once clicked to scroll, the target may be underneath the header. In this case, add \`scroll-margin-top\` to your targets:

\`\`\`js
useActiveScroll(targets, { overlayHeight: 100 })
\`\`\`

\`\`\`css
.target {
   scroll-margin-top: 100px;
}
\`\`\`

### Server-side rendering

Since \`useActiveScroll\` won't kick in until the page is hydrated, you probably want to render the first link as active on the server.

\`\`\`vue
<script setup>
const isSSR = ref(true)
onMounted(() => (isSSR.value = false))
</script>
<template>
   <nav>
      <RouterLink
         v-for="(link, idx) in links"
         :class="{
            'sidebar-link--active':
               (isSSR && idx === 0) || link.href === activeId,
         }"
      >
         {{ link.label }}
      </RouterLink>
   </nav>
</template>
\`\`\`

<br />

## License

MIT`,
                        'fucker': 'content1',
                    }
                })
                return res
            })()

        }
        // storage.set(cacheKey, data);

        return data;
    } catch (error) {
        logger.error('Fetch error:', error);
        throw error;
    }
};


export const fetchFeedInfo = async (feedUrl: string): Promise<Feed> => {
    // await delay(800);

    const data: Feed = {
        name: "前端圈",
        feed_id: "web",
        feed_url: feedUrl,
        avatar: "https://vuejs.org/images/logo.png",
        version: "1.0",
        favicon_map: {
            '@Lostwind10': 'https://pbs.twimg.com/profile_images/1167753198150406144/C4vNS69H_400x400.jpg',
            '@youyuxi': 'https://pbs.twimg.com/profile_images/1856284397072478208/hSEXLkPN_400x400.jpg',
            '@boshen_c': 'https://pbs.twimg.com/profile_images/1703063445514944512/mI6X6X_X_400x400.jpg',
            '@voidzerodev': 'https://pbs.twimg.com/profile_images/1814234567890123456/v0id_400x400.jpg',
            '@threepointone': 'https://pbs.twimg.com/profile_images/1512345678901234567/3p1_400x400.jpg'
        },
        ai_bots: [
            {
                bot_id: "faker",
                name: "AI讲师",
                avatar: "https://vuejs.org/images/logo.png",
                description: "AI Bot 1 description",
                prompt: "AI Bot 1 prompt"
            },
            {
                bot_id: "fucker",
                name: "网络喷子",
                avatar: "https://vuejs.org/images/logo.png",
                description: "AI Bot 1 description",
                prompt: "AI Bot 1 prompt"
            }
        ]
    }

    return Promise.resolve(data);
};
