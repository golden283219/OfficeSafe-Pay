module.exports = {
  "packagerConfig": {
    "dir": "./electron/",
    "icon": "./electron/icon",
    "ignore": [
      "^/ui",
      "^/node_modules",
      "^/processor",
      "^/winautomate",
      "^/readme.md",
      "^/yarn*",
      "^/.git*",
      "^/.idea*"
    ]
  },
  "hooks": {
    "readPackageJson": function (forge, packageJson) {
      // remove sensitive info from bundled package.json
      delete packageJson.scripts;
    }
  },
  "makers": [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "name": "osp"
      }
    }
  ]
}
