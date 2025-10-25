# AnalyticsBot Directory Structure

> **Generated:** October 25, 2025
> **Repository:** AnalyticsBot
> **Purpose:** Analytics framework for tracking and managing fundraising campaign metrics

---

## 📊 Overview

AnalyticsBot is a comprehensive analytics framework designed for non-profit fundraising campaigns. It provides integration with multiple analytics platforms including Google Analytics, Google Tag Manager, and Mixpanel, with specialized support for conversion tracking and campaign performance monitoring.

**Statistics:**
- 📁 **123 directories**
- 📄 **231 files**
- 🐍 **Python-based** (Python 3.13)

---

## 🗂️ Directory Tree

```
AnalyticsBot
├── __pycache__
│   ├── indeed_mcp_server.cpython-313.pyc
│   └── wix_integration.cpython-313.pyc
├── .claude
│   └── settings.local.json
├── .env
├── .git
│   ├── COMMIT_EDITMSG
│   ├── config
│   ├── description
│   ├── FETCH_HEAD
│   ├── HEAD
│   ├── hooks
│   │   ├── applypatch-msg.sample
│   │   ├── commit-msg.sample
│   │   ├── fsmonitor-watchman.sample
│   │   ├── post-update.sample
│   │   ├── pre-applypatch.sample
│   │   ├── pre-commit.sample
│   │   ├── pre-merge-commit.sample
│   │   ├── pre-push.sample
│   │   ├── pre-rebase.sample
│   │   ├── pre-receive.sample
│   │   ├── prepare-commit-msg.sample
│   │   ├── push-to-checkout.sample
│   │   ├── sendemail-validate.sample
│   │   └── update.sample
│   ├── index
│   ├── info
│   │   └── exclude
│   ├── logs
│   │   ├── HEAD
│   │   └── refs
│   │       ├── heads
│   │       │   └── main
│   │       └── remotes
│   │           └── origin
│   │               ├── HEAD
│   │               └── main
│   ├── objects
│   │   ├── 00
│   │   │   ├── 724fad5dc709907291b6bea9ec60fd4fabeccb
│   │   │   └── d5093592383875623aa817af187d3ea762c96f
│   │   ├── 01
│   │   │   └── 289c0c3af955e9f958fa89e2e25cd9fdc5acca
│   │   ├── 02
│   │   │   └── ac55e42c488da905f6da0aeaa73920ad9a96f4
│   │   ├── 03
│   │   │   └── e241c9e7e5bdff44a4a018c071d78abe16ce05
│   │   ├── 04
│   │   │   └── 98dce5d697ce3812200303f19056220b36f46c
│   │   ├── 0e
│   │   │   └── e80541590a0acdc2b9048fdda0b84ab97409b7
│   │   ├── 0f
│   │   │   └── 0230575ed269413e1a8de53e6c873ae101cee6
│   │   ├── 11
│   │   │   └── 9a51e777810c733a8b16f50b371eca9e6ba4c1
│   │   ├── 13
│   │   │   └── 7aad9e7c1e0565a3786abcfd249bf57eb5275b
│   │   ├── 15
│   │   │   └── c6df1adcaa013e43765a019c1994bc4c75732f
│   │   ├── 17
│   │   │   └── dac5d0bfd56695fb9e21d6e701eab32e7341f2
│   │   ├── 18
│   │   │   ├── 0f76d61729e6034208e703c6e49a7c3fac2896
│   │   │   ├── 32b7e79e2475f1a449769f13ddc7762e3d9106
│   │   │   └── f36de0f1d6a85db18380585b9ae29162051d23
│   │   ├── 1a
│   │   │   └── 74318a0a249b69535bd11bfe68e4f490ada408
│   │   ├── 21
│   │   │   └── 3f01af8147d6e34f65cc49ac4ccd49cee62d7f
│   │   ├── 22
│   │   │   ├── 534701b9ef709bd66c40da49ea8a65f2688493
│   │   │   └── f5986a1d610a694a0a9491bca3a08f9855e673
│   │   ├── 24
│   │   │   ├── 76d819c963f77fb84f800b655c2e81d465d6c2
│   │   │   └── f32b78a21fa441ef78a386e92509e8c6b3fb3b
│   │   ├── 27
│   │   │   └── 03f24aa98fe99d20c96ab916851f6154ea85c8
│   │   ├── 28
│   │   │   └── f236f3f1dfd1e1cc3c7ce2abbfc642886ca767
│   │   ├── 29
│   │   │   └── 54ee9d3440e3a181bf54b018e80b1bb3c9fd43
│   │   ├── 2c
│   │   │   └── 8c0485e01151064800937bb7e35a0f98384074
│   │   ├── 30
│   │   │   ├── 3616a7a63e12d2711780848e82cc257c91b044
│   │   │   └── 72b669b0a8844603e85291ae21c19c844c9ada
│   │   ├── 31
│   │   │   └── b0754008968c2d80c17c94cb0a2d573ada1863
│   │   ├── 33
│   │   │   └── 7893e30c3cc41091575a3320242d141e812275
│   │   ├── 34
│   │   │   └── 33301b3abf2378ad100ff4cfc282c7a22041c8
│   │   ├── 3b
│   │   │   └── 01ab24baf253d3bcc2a18adb44ced649cd5ca3
│   │   ├── 3c
│   │   │   └── e4714f67821b8923c93f0d5087f98e02b27ee1
│   │   ├── 3f
│   │   │   └── e58567da00eef85682bfd333cf19161e690525
│   │   ├── 42
│   │   │   └── 08daf9e1978a236642c5c0821cc438f7d03179
│   │   ├── 45
│   │   │   └── 8a5ae2d87dc86a3f1bf8d78bed8a0b077fac52
│   │   ├── 47
│   │   │   └── 11c0c2496b537aa6a13685071c7e225ce295b6
│   │   ├── 49
│   │   │   └── 4f3cc81a58b0991f24d00cfb1915547dcaf881
│   │   ├── 4c
│   │   │   └── 5da5ddc91fc2fd2d6bc9e3818e2dd0a15bc89e
│   │   ├── 4f
│   │   │   ├── 47d57ca0d18c7f5817fa067ef2e869558ad6ad
│   │   │   └── c746b3af8775a43ea7d7ca059d608ef541982b
│   │   ├── 50
│   │   │   └── 519389d877c79fe4f6e597b94a3bbd3ea87478
│   │   ├── 53
│   │   │   └── a4f6687fb5eff21e72beea986420a3f43d7709
│   │   ├── 56
│   │   │   └── d1907fcca927a50f1158fe15da15809b534b22
│   │   ├── 5a
│   │   │   └── 76acf27392973c10c45ccebff055e96f4a40a7
│   │   ├── 61
│   │   │   └── 41dfa72edc1eb8abb1846a08de980f2d73195c
│   │   ├── 63
│   │   │   └── cfdcdd24a4060949df2b9a19f01a144fbfd0fd
│   │   ├── 66
│   │   │   └── 7a3a745d9e80116872480795805a662d2eb0fc
│   │   ├── 67
│   │   │   └── a5e662b295f498f2cd823fb6e8e56b294eef24
│   │   ├── 68
│   │   │   └── b8550a148235988334e703d2d2ecb491b7328a
│   │   ├── 6c
│   │   │   └── 31c0386bdd99e483ead371a422e8a2d7e1016f
│   │   ├── 6d
│   │   │   ├── 8f1cc35c4d399e46df540e40e2da00a790a1d5
│   │   │   └── d93427c575c43caa021015b973c6f95e58261c
│   │   ├── 6e
│   │   │   └── 064a5daa761733a5fe9b7a2aa12120d4043add
│   │   ├── 6f
│   │   │   └── 11d7adaa439a616eb62c1372d99c1b7b639b42
│   │   ├── 73
│   │   │   ├── 46ed1d5dd1bd02df231d21ddf082293d882bd4
│   │   │   └── ac07eb51e9f94bd7793c025618c037ff4df5dd
│   │   ├── 78
│   │   │   └── 5cf91a9a024e2d05a0d8cf10b6724e6c51eb2c
│   │   ├── 79
│   │   │   └── 30507b3fd41bc91500fa515072411830054a44
│   │   ├── 7b
│   │   │   └── b11de4b5b9564d586cd28a11b2d2523756f5b6
│   │   ├── 7c
│   │   │   └── 472bd3d3bd26e5e37481e9b76e12f65b1717b1
│   │   ├── 7d
│   │   │   └── 7109b3bddd1dfb3401879b5e88b2d79e4b2db4
│   │   ├── 7f
│   │   │   └── 543b9d2cc203a02f9f09f4d48c3fcecb711c9b
│   │   ├── 81
│   │   │   └── 319ceec8583a0754cf49bf953d9315a75b2666
│   │   ├── 82
│   │   │   └── 3576896459c813651f246f8c3866cc902f9c75
│   │   ├── 83
│   │   │   └── ca9784d122a3a550fb4b52f77af7e7354d472b
│   │   ├── 87
│   │   │   └── c164a00c7e85f0021f35050317c4113b05b66b
│   │   ├── 8a
│   │   │   └── 7ddcee84def8d2450b8c772e05e67e350f062b
│   │   ├── 8c
│   │   │   ├── 2adfa361ac7bdaf08ab7b57da00d9bc336edc6
│   │   │   └── c07e06b2ef10e5b93da3313899ce97de537081
│   │   ├── 8e
│   │   │   ├── b210c36ad5d5fc3ead13709dfdbdacb3aa1a0b
│   │   │   ├── c9368eceb77011deaf37bab745b8bc35522df6
│   │   │   ├── dcce47e7bc8a20ce0fbeaecc2985a4a312449f
│   │   │   └── e1c9773752616dc3ffb0a696c345133883a814
│   │   ├── 93
│   │   │   └── 17d63b48dedc78795b1ea0eb95af05d70da703
│   │   ├── 94
│   │   │   └── e46b05294ab363776cfbb0a450e3de8c3d84c3
│   │   ├── 96
│   │   │   └── de1aa0bf151ad48e8301824654b4f40d8cb3bc
│   │   ├── 98
│   │   │   └── d1f96b45d15bf4ff4685a14d14657d4b73dea9
│   │   ├── 9c
│   │   │   └── d67e408e5ce31c2d0153a3ef07439ee072e046
│   │   ├── 9d
│   │   │   └── 59b273334c929f5f5addc6a8ec94889030c4f9
│   │   ├── 9f
│   │   │   └── ae78215d8900fd44ba847dfbb3743da82861c2
│   │   ├── a2
│   │   │   └── 7ae335af6f821376767d021012d65dc3425b4d
│   │   ├── a4
│   │   │   └── a83ced1ceace77106e4df0f09af3a4b0dc93b8
│   │   ├── a5
│   │   │   └── f1998468649bdfd429372cc111142170fe43dc
│   │   ├── a9
│   │   │   └── 99357fe97f6f670af4677ddeac9f6629ab8471
│   │   ├── af
│   │   │   └── e38dca26e33a9bce829c64c8ba6d3bc27560a2
│   │   ├── b1
│   │   │   └── af687e1fe467d8b4f58246ece2ec1dec1450ab
│   │   ├── b3
│   │   │   ├── 4a15e50734c0972bf20d18240afbc8532cf79b
│   │   │   └── fb7db83ac701d32046a4a9fdbcba1d6992d7a9
│   │   ├── b4
│   │   │   └── a0aa61ab83643e517606d186d65a478fa0ff9a
│   │   ├── b7
│   │   │   └── c33c66412022db88fba09343110881ada836fb
│   │   ├── b8
│   │   │   ├── 576fcb3676f8c839e2f9098f1241dd9657f493
│   │   │   ├── 933359bc53d618039cad1df0998ac9f1671763
│   │   │   └── d34130919cc3924e96a9636c2a0a57ab838bd3
│   │   ├── b9
│   │   │   └── 5144385b8cd42a89b9bbfa06152c86f31891dc
│   │   ├── ba
│   │   │   └── 3dc79bca44cc3470f4a4ab44b61cb3b965350f
│   │   ├── bb
│   │   │   └── 1cee9f6dbb973d248a020c789ea1786b8f7ece
│   │   ├── bf
│   │   │   └── a6d07686a52eeef2bb2ab31a5f5aefd48f10fe
│   │   ├── c0
│   │   │   └── b9c094bd7a4205bbf8cba3bc526e3c6a662b06
│   │   ├── c1
│   │   │   ├── 6220a1a0a4fb4797d6d75f8d9599336664305d
│   │   │   └── ea30a4c7791d2fef354665d246514693924f46
│   │   ├── c2
│   │   │   └── 4ac6d83b2ae0dd96da1e3e4f7815d051270bec
│   │   ├── c4
│   │   │   ├── a910e9574906fe197362c0a7eacd3e5e785c9d
│   │   │   └── b6210d0ac62c8fafe1a9aaff6f28f47f3ba394
│   │   ├── c5
│   │   │   ├── 4ae8eea70d3cd310376c385bd5185b64ca9190
│   │   │   ├── 58f4aa224682180e2e5b97c8a59ef5f7533785
│   │   │   └── 68c38f5a4ec51d6a6180539670e41f00acc9f7
│   │   ├── d1
│   │   │   └── 55a3dad5c6391362ccb70b1625aba7870f43e4
│   │   ├── d3
│   │   │   └── cfb2342f23376d7b86145ed214dd8a5f056df1
│   │   ├── d6
│   │   │   └── 6366f0b49b1d4b0e41bafd3ff5dfbb427b4954
│   │   ├── df
│   │   │   ├── 12629a7046b25713bf2a3dba6891d4eace371d
│   │   │   └── b69339ea46baebcb864953edf9e87175fffea1
│   │   ├── e0
│   │   │   ├── 6611bcc9068919a2d381f00c99c8a33278d9ab
│   │   │   └── a497b1ee8de3ac2977d77634c94d9af4c8f298
│   │   ├── e2
│   │   │   └── 38541562d0be8e6088fa9ccd35672109e0bb1f
│   │   ├── e5
│   │   │   ├── 6a6da9c29fb44a2fa009d9bc46f69b389b3535
│   │   │   ├── b59feebdfa115292d40540c71cf3cb68fc0692
│   │   │   └── ce9d7e9fd8dbad177dad188484758552cec529
│   │   ├── e6
│   │   │   ├── 0d5796b9f62613e1428bbea9cd4f52afeaf439
│   │   │   ├── 7dfbf3268a08d71f6e74402bd30c89616df310
│   │   │   └── e67d637790dc3709f44c1f0b6c7c0be143d66f
│   │   ├── ec
│   │   │   └── b0f5fe5de25b3d5b12831f69f633d318f415c8
│   │   ├── f1
│   │   │   └── 94a6fc178b91e3241b3b63f8afc942f92a10ae
│   │   ├── f4
│   │   │   ├── 2534d7eb734854102f94176ff531b2ba72e067
│   │   │   └── 8d37e318947631ccd405354aa0b75971ee41d4
│   │   ├── info
│   │   └── pack
│   │       ├── pack-48d0d110115230a226dd2692bc9e0d50854d3fa3.idx
│   │       ├── pack-48d0d110115230a226dd2692bc9e0d50854d3fa3.pack
│   │       └── pack-48d0d110115230a226dd2692bc9e0d50854d3fa3.rev
│   ├── packed-refs
│   └── refs
│       ├── heads
│       │   └── main
│       ├── remotes
│       │   └── origin
│       │       ├── HEAD
│       │       └── main
│       └── tags
├── .gitignore
├── .mcp.json
├── analytics
│   ├── __init__.py
│   ├── __pycache__
│   │   ├── __init__.cpython-313.pyc
│   │   ├── config.cpython-313.pyc
│   │   ├── conversion_tracker.cpython-313.pyc
│   │   ├── core.cpython-313.pyc
│   │   ├── dashboard.cpython-313.pyc
│   │   ├── data_layer_manager.cpython-313.pyc
│   │   ├── events.cpython-313.pyc
│   │   ├── gtm_debugger.cpython-313.pyc
│   │   └── performance.cpython-313.pyc
│   ├── config.py
│   ├── conversion_tracker.py
│   ├── core.py
│   ├── dashboard.py
│   ├── data_layer_manager.py
│   ├── events.py
│   ├── gtm_debugger.py
│   ├── performance.py
│   ├── providers
│   │   ├── __init__.py
│   │   ├── __pycache__
│   │   │   ├── __init__.cpython-313.pyc
│   │   │   ├── base.cpython-313.pyc
│   │   │   ├── console.cpython-313.pyc
│   │   │   ├── google_analytics.cpython-313.pyc
│   │   │   ├── google_tag_manager.cpython-313.pyc
│   │   │   ├── google_tags.cpython-313.pyc
│   │   │   └── mixpanel.cpython-313.pyc
│   │   ├── base.py
│   │   ├── console.py
│   │   ├── google_analytics.py
│   │   ├── google_tag_manager.py
│   │   ├── google_tags.py
│   │   └── mixpanel.py
│   └── storage
│       ├── __init__.py
│       ├── __pycache__
│       │   ├── __init__.cpython-313.pyc
│       │   ├── base.cpython-313.pyc
│       │   ├── memory.cpython-313.pyc
│       │   └── sqlite.cpython-313.pyc
│       ├── base.py
│       ├── memory.py
│       └── sqlite.py
├── analytics_config.json
├── analytics_user_config.yml
├── analytics.db
├── chat.py
├── configure_analytics.py
├── examples
│   ├── basic_usage.py
│   ├── chatbot_integration.py
│   ├── google_tags_example.py
│   ├── gtm_integration_example.py
│   ├── gtm_testing_example.py
│   └── mcp_usage_examples.md
├── GTM_INTEGRATION_GUIDE.md
├── integrity_config.yml
├── LICENSE
├── load_wix_env.sh
├── MCP_INTEGRATION.md
├── mcp_server_http.py
├── mcp_server.py
├── META_SETUP_GUIDE.md
├── QUICK_START_MCP.md
├── README.md
├── requirements.txt
├── SETUP.md
├── start_indeed_mcp.sh
├── start_mcp_server.sh
├── test_mcp_integration.py
├── WIX_INTEGRATION_STATUS.md
├── wix_integration.py
└── WIX_SETUP_GUIDE.md
```

---

## 🔑 Key Components

### 📦 Core Analytics Package (`analytics/`)

The main analytics framework with modular architecture:

| Module | Description |
|--------|-------------|
| `core.py` | Core analytics engine and event tracking |
| `config.py` | Configuration management |
| `events.py` | Event definition and handling |
| `dashboard.py` | Analytics dashboard interface |
| `conversion_tracker.py` | Conversion tracking and attribution |
| `data_layer_manager.py` | Data layer management for GTM |
| `gtm_debugger.py` | Google Tag Manager debugging tools |
| `performance.py` | Performance monitoring and optimization |

### 🔌 Analytics Providers (`analytics/providers/`)

Integration modules for multiple analytics platforms:

- **`google_analytics.py`** - Google Analytics integration
- **`google_tag_manager.py`** - Google Tag Manager integration
- **`google_tags.py`** - Google Tags (gtag.js) integration
- **`mixpanel.py`** - Mixpanel analytics integration
- **`console.py`** - Console-based debugging provider
- **`base.py`** - Base provider interface

### 💾 Storage Backends (`analytics/storage/`)

Flexible storage options for analytics data:

- **`sqlite.py`** - SQLite database storage
- **`memory.py`** - In-memory storage for testing
- **`base.py`** - Base storage interface

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `GTM_INTEGRATION_GUIDE.md` | Google Tag Manager setup guide |
| `MCP_INTEGRATION.md` | Model Context Protocol integration |
| `META_SETUP_GUIDE.md` | Meta/Facebook Pixel setup |
| `QUICK_START_MCP.md` | Quick start for MCP users |
| `SETUP.md` | General setup instructions |
| `WIX_INTEGRATION_STATUS.md` | Wix integration status |
| `WIX_SETUP_GUIDE.md` | Wix platform integration guide |

---

## 💡 Examples (`examples/`)

Sample implementations demonstrating various use cases:

- **`basic_usage.py`** - Basic analytics tracking
- **`chatbot_integration.py`** - Chatbot integration example
- **`google_tags_example.py`** - Google Tags implementation
- **`gtm_integration_example.py`** - GTM integration demo
- **`gtm_testing_example.py`** - GTM testing workflows
- **`mcp_usage_examples.md`** - MCP usage patterns

---

## ⚙️ Configuration Files

| File | Description |
|------|-------------|
| `.mcp.json` | MCP server configuration |
| `analytics_config.json` | Analytics platform configuration |
| `analytics_user_config.yml` | User-specific settings |
| `integrity_config.yml` | Data integrity rules |
| `.env` | Environment variables (secrets) |

---

## 🚀 Server Scripts

### MCP Servers
- **`mcp_server.py`** - Main MCP server (stdio)
- **`mcp_server_http.py`** - HTTP-based MCP server

### Startup Scripts
- **`start_mcp_server.sh`** - Launch MCP server
- **`start_indeed_mcp.sh`** - Launch Indeed integration server

### Integration Scripts
- **`wix_integration.py`** - Wix platform integration
- **`load_wix_env.sh`** - Load Wix environment variables

---

## 🧪 Testing & Utilities

- **`test_mcp_integration.py`** - MCP integration tests
- **`chat.py`** - Interactive analytics chat interface
- **`configure_analytics.py`** - Configuration wizard

---

## 💽 Data

- **`analytics.db`** - SQLite database for analytics data

---

## 🏗️ Architecture Highlights

### Modular Design
- **Provider Pattern**: Pluggable analytics providers
- **Storage Abstraction**: Multiple storage backends
- **Event-Driven**: Event-based tracking system

### Platform Integrations
- ✅ Google Analytics
- ✅ Google Tag Manager
- ✅ Google Tags (gtag.js)
- ✅ Mixpanel
- ✅ Wix Platform
- ✅ Indeed Job Listings

### MCP (Model Context Protocol) Support
Enables AI assistants to interact with analytics data through:
- Real-time event tracking
- Conversion monitoring
- Campaign performance analysis
- Data integrity validation

---

## 📈 Use Cases

1. **Non-Profit Fundraising Campaigns**
   - Donation tracking
   - Campaign attribution
   - Donor behavior analysis

2. **E-Commerce Analytics**
   - Conversion tracking
   - Funnel optimization
   - Revenue attribution

3. **Content Marketing**
   - Engagement metrics
   - User journey analysis
   - A/B testing

4. **Job Recruitment**
   - Application tracking
   - Source attribution
   - Candidate funnel analysis

---

## 🛠️ Technology Stack

- **Language**: Python 3.13
- **Storage**: SQLite
- **APIs**: Google Analytics, GTM, Mixpanel
- **Protocols**: MCP (Model Context Protocol)
- **Platforms**: Wix, Indeed

---

*This document was auto-generated from the AnalyticsBot codebase structure.*
