# Atrium Monorepo

A modern monorepo that contains the complete Atrium platform.

## Project Structure

```
Atrium-Monorepo
│
├── frontend-angular/     # Angular Rider Dashboard
├── frontend-react/       # React Customer Application
├── backend/              # NestJS REST API
│
├── package.json
├── package-lock.json
└── README.md
```

---

## Applications

### frontend-angular

- Angular 20
- Standalone Components
- TypeScript
- RxJS

### frontend-react

- React 19
- Vite
- React Router

### backend

- NestJS 11
- MongoDB
- Mongoose
- REST API

---

## Technologies

- Angular
- React
- NestJS
- TypeScript
- Node.js
- npm Workspaces

---

## Installation

```bash
npm install --workspaces
```

---

## Run Applications

### Angular

```bash
npm run start:angular
```

### React

```bash
npm run start:react
```

### Backend

```bash
npm run start:backend
```

---

## Build

```bash
npm run build:angular
npm run build:react
npm run build:backend
```

---

## Monorepo

This repository uses npm Workspaces to manage multiple applications from a single repository.

---

## CI/CD

CI/CD workflows will automatically:

- Install dependencies
- Build applications
- Run tests
- Validate code quality

---

## Future Improvements

- Docker support
- GitHub Actions
- Deployment pipelines
- Shared packages