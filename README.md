# speed.skk.moe

https://speed.skk.moe

## Running locally

Test targets are read from `SPEEDTEST_TARGETS` at build time. Copy `.env.example` to `.env` and fill in the endpoints, or set the variable in your build environment.

**Development**

```bash
pnpm install
pnpm dev
```

**Production**

`/_sukka/api/geo` API endpoint is not included in the source code repo and you must serve it separately.

```bash
pnpm install
pnpm build
```

You will find the static files in the `out/` directory, which you can serve with any static hosting service.

## License

[Apache License 2.0](LICENSE)

----

**speed.skk.moe** © [Sukka](https://github.com/SukkaW), Released under the [Apache License 2.0](LICENSE) License.
Authored and maintained by Sukka with help from contributors ([list](https://github.com/SukkaW/speed.skk.moe/graphs/contributors)).

> [Personal Website](https://skk.moe) · [Blog](https://blog.skk.moe) · GitHub [@SukkaW](https://github.com/SukkaW) · Telegram Channel [@SukkaChannel](https://t.me/SukkaChannel) · Mastodon [@sukka@acg.mn](https://acg.mn/@sukka) · Twitter [@isukkaw](https://twitter.com/isukkaw) · BlueSky [@skk.moe](https://bsky.app/profile/skk.moe)

<p align="center">
  <a href="https://github.com/sponsors/SukkaW/">
    <img src="https://sponsor.cdn.skk.moe/sponsors.svg"/>
  </a>
</p>
