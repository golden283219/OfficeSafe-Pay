# OfficeSafe Pay NMI

Client cross-platform application with 
 [NMI](https://secure.networkmerchants.com/gw/merchants/resources/integration/integration_portal.php#integration_overview) APIs integration.

# Modules

## app: Electron

Electron application with bindings between React UI and C# Processor.

## ui: User interface on React

React application with bindings.

# winautomate: C# CLI tool, Dentrix automation

.NET app for [Dentrix Ledger](https://www.dentrix.com/articles/show/4895) 
 UI automation via .NET's [UIAutomation](https://docs.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-overview). 
 Handles patient search & payment fill.
 Compiling on macOS. Does not run on macOS due lack to UIAutomation support in mono.

# Build instructions

Run commands from repo root dir.
 On macOS install `mono` before binaries compilation.

Init modules: 
```yarn```

Build UI: 
```yarn run make-ui```

Build C# binaries:
```yarn run make-binaries```

Start app:
```yarn run start```

To show devTools and console logs set debug flag `OSP_ALLOW_DEBUG` at `electron/main.js`.

Create distribution package:
```yarn run make-win```
