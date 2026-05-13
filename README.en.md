

# Scm.Vue

Frontend for Scm.Net project, an enterprise-level backend management system built with Vue 3 + Vite + Element Plus.

## Tech Stack

| Technology | Version | Description |
| --- | --- | --- |
| [Vue](https://vuejs.org/) | ^3.5.32 | Progressive JavaScript Framework |
| [Vite](https://vitejs.dev/) | ^8.0.3 | Next Generation Frontend Build Tool |
| [Vue Router](https://router.vuejs.org/) | ^5.0.4 | Official Router for Vue.js |
| [Pinia](https://pinia.vuejs.org/) | ^3.0.0 | Vue.js State Management |
| [Element Plus](https://element-plus.org/) | ^2.13.6 | Vue 3 Component Library |
| [Axios](https://axios-http.com/) | ^1.7.0 | HTTP Client |
| [ECharts](https://echarts.apache.org/) | ^6.0.0 | Data Visualization Library |
| [Sass](https://sass-lang.com/) | ^1.99.0 | CSS Preprocessor |

## Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm >= 8.0.0

## Installation

```bash
# Clone the repository
git clone https://gitee.com/openscm/scm.net.git

# Enter frontend directory
cd Scm.Vue

# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm run dev

# Or
npm run serve
```

Visit http://localhost:2800 to view the project.

## Build

```bash
# Build for production
npm run build

# Preview build result
npm run preview
```

## Directory Structure

```
Scm.Vue/
├── public/                 # Static assets
│   ├── images/               # Images
│   ├── lib/               # Third-party libraries
│   └── index.html         # HTML template
├── src/
│   ├── api/               # API interfaces
│   │   └── model/         # API modules
│   ├── assets/            # Asset files
│   │   ├── mp3/           # Audio files
│   │   └── sass/          # Style files
│   ├── components/        # Common components
│   ├── config/            # Configuration files
│   ├── directives/        # Custom directives
│   ├── layout/            # Layout components
│   ├── locales/           # Internationalization
│   ├── router/            # Router configuration
│   ├── stores/            # State management
│   ├── style/             # Global styles
│   ├── utils/             # Utility functions
│   ├── views/             # Page views
│   ├── App.vue            # Root component
│   └── main.js            # Entry file
├── .env                   # Environment variables
├── .env.development       # Development variables
├── .env.production        # Production variables
├── vite.config.js         # Vite configuration
└── package.json           # Project configuration
```

## Features

- **Authentication** - Multiple login methods (account, phone, email, OAuth, etc.)
- **Permission Management** - Multi-level access control (company, department, position, group, user, role)
- **Internationalization** - Multi-language support
- **Theme Customization** - Light/Dark theme support
- **Rich Components** - 40+ custom business components
- **Code Generation** - Automatic code generation support
- **Workflow** - Custom approval workflow
- **Messaging** - Real-time push notifications and chat
- **Data Visualization** - ECharts integration
- **File Management** - File upload, import and export

## Browser Support

| ![Chrome](https://img.shields.io/badge/Chrome->=80-success?logo=google-chrome) | ![Firefox](https://img.shields.io/badge/Firefox->=75-success?logo=firefox) | ![Safari](https://img.shields.io/badge/Safari->=13-success?logo=safari) | ![Edge](https://img.shields.io/badge/Edge->=80-success?logo=microsoft-edge) |
| --- | --- | --- | --- |
| Chrome >= 80 | Firefox >= 75 | Safari >= 13 | Edge >= 80 |

## Links

- [Backend Project](https://gitee.com/openscm/scm.net)
- [Documentation](https://gitee.com/openscm/scm.net/wikis/%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D)
- [Live Demo](http://www.c-scm.net)

## Demo Accounts

| Role | Account | Password |
| --- | --- | --- |
| Administrator | admin@demo | 123456 |
| User | user@demo | 123456 |

## License

[MIT License](LICENSE)

**QQ Group**

[![QQ Group](https://img.shields.io/badge/QQ%20Group-415872667-12B7F5.svg?logo=tencentqq)](https://qm.qq.com)

<img src="qqq.jpg" width="200"/>
