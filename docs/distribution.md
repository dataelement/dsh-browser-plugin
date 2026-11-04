# Prebuilt distribution (0.4.3)

Date: 2026-11-03.

The reported `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED` occurs before plugin activation: installing the repository asks pnpm to prepare its development source, including prepack. Source repositories deliberately do not track generated lib output.

Distribute the result of `npm pack`, not a source Git URL. The archive includes lib/index.cjs, lib/client.js, the bundle manifest and bundled dependency licenses. No runtime dependencies or install/prepare lifecycle scripts are required. Keep the existing Profile build policy.

Regression: tests/archive-install.test.mjs serves the real packed archive over HTTP and installs it with pnpm 11.7.0, strictDepBuilds=true, an empty allowBuilds map and automatic peers disabled. It imports the installed backend, checks the registered client and proves the empty build policy stays unchanged. The full local plugin suite passed 83/83 tests without skips. The existing packed-distribution test also opens real Chrome from an extracted archive.

A tag-driven macOS release workflow runs build, all plugin tests and npm pack before publishing the .tgz asset. A private GitHub asset requires authenticated download: use the local .tgz path in DSH instead of an unauthenticated private release URL.

This change does not modify the user's Profile, build approvals, or host compatibility seam. Installation into the live user's Desktop is not inferred from isolated pnpm and package tests.
