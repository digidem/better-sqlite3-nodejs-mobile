# better-sqlite3-nodejs-mobile

[NodeJS Mobile](https://github.com/nodejs-mobile/nodejs-mobile) prebuilds for
[`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)

## Runtime and supported versions

Prebuilds are built against the
[digidem/nodejs-mobile](https://github.com/digidem/nodejs-mobile) v24 line — the
exact release is set by `NODE_VERSION` in
[`prebuilds.yml`](.github/workflows/prebuilds.yml) and passed to the build as
`-D NAPI_NODE_VERSION`.

That limits this repository to `better-sqlite3` 13 and later, which is an N-API
addon: one binary per target serves every runtime, so release assets are named
`better-sqlite3-<version>-<target>` with no Node ABI in the name. Version 12 and
earlier are raw V8 addons and need nodejs-mobile v18 (N-API 9). Their prebuilds
stay available in this repository's existing releases (11.10.0, 12.9.0,
12.10.0), and the last revision that could build them is tagged
[`legacy-nodejs-mobile-v18`](https://github.com/digidem/better-sqlite3-nodejs-mobile/tree/legacy-nodejs-mobile-v18).

See [BENCHMARKS-node24.md](BENCHMARKS-node24.md) for how the two runtimes and
the two better-sqlite3 lines compare.

## Working locally

### Requirements

- Node 20+ (CI uses version 20)
- Android NDK (CI uses version 27.2.12479018)
  - (optional) exported `ANDROID_NDK_HOME` environment variable

### General steps

Should be clear enough to follow the
[reusable workflow steps](https://github.com/digidem/nodejs-mobile-bare-prebuilds/blob/v3/.github/workflows/prebuild.yml)
but in summary:

1. Download the npm tarball package and unzip e.g.
   ```
   npm pack better-sqlite3@13 | xargs tar -zxvf
   ```
2. Navigate to unzipped directory:
   ```
   cd package
   ```
3. Install dependencies:
   ```
   npm install --ignore-scripts
   ```
4. Install cmake build tools:
   ```
   npm install -D --ignore-scripts cmake-bare cmake-fetch
   ```
5. Install
   [patched `cmake-napi`](https://github.com/digidem/cmake-napi-nodejs-mobile):
   ```
   npm install -D --ignore-scripts cmake-napi@github:digidem/cmake-napi-nodejs-mobile
   ```
6. Copy `CMakeLists.txt` from this repository to the `package` directory:
   ```
   cp ../CMakeLists.txt ./
   ```
7. Install [bare-make](https://github.com/holepunchto/bare-make) globally:
   ```
   npm install -g bare-make@latest
   ```
8. Generate, build and install, selecting the nodejs-mobile runtime to link
   against (use the same value as `NODE_VERSION` in `prebuilds.yml`; iOS builds
   also need `-D APPLE_CLANG=ON`):
   ```
   bare-make generate --platform android --arch arm64 -D NAPI_NODE_VERSION=24.19.0-0
   bare-make build
   bare-make install
   ```

## Creating a release

1. Navigate to the
   [Generate Prebuilds workflow](https://github.com/digidem/better-sqlite3-nodejs-mobile/actions/workflows/prebuilds.yml)
2. Manually dispatch the worflow with the version you want to build, ensuring
   that "Publish Release" is checked.

## Contributing

We welcome contributions to this repository. If you have an idea for a new
feature or have found a bug, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for more details.
