src/
├── app/
│ ├── router/
│ │ └── index.tsx
│ ├── providers/
│ │ └── index.tsx
│ └── store/
│ └── index.ts
│
├── config/
│ ├── env.ts
│ └── routes.ts
│
├── services/
│ ├── http.ts
│ └── interceptors.ts
│
├── pages/
│ ├── HomePage/
│ │ └── index.tsx
│ ├── LoginPage/
│ │ └── index.tsx
│ └── DashboardPage/
│ └── index.tsx
│
├── features/
│ ├── auth/
│ │ ├── api/
│ │ │ └── authApi.ts
│ │ ├── components/
│ │ │ └── LoginForm.tsx
│ │ ├── hooks/
│ │ │ └── useAuth.ts
│ │ ├── store/
│ │ │ └── authSlice.ts
│ │ ├── types/
│ │ │ └── auth.types.ts
│ │ └── utils/
│ │ └── authHelpers.ts
│ │
│ ├── users/
│ │ ├── api/
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── store/
│ │ └── types/
│ │
│ └── products/
│ ├── api/
│ ├── components/
│ ├── hooks/
│ ├── store/
│ └── types/
│
├── shared/
│ ├── components/
│ │ ├── Button/
│ │ │ └── index.tsx
│ │ ├── Input/
│ │ │ └── index.tsx
│ │ └── Modal/
│ │ └── index.tsx
│ │
│ ├── hooks/
│ │ ├── useDebounce.ts
│ │ └── useLocalStorage.ts
│ │
│ ├── utils/
│ │ ├── formatDate.ts
│ │ └── formatCurrency.ts
│ │
│ ├── constants/
│ │ └── index.ts
│ │
│ └── types/
│ └── common.ts
│
├── assets/
│ ├── images/
│ ├── icons/
│ └── styles/
│ ├── global.css
│ └── variables.css
│
├── layouts/
│ ├── MainLayout.tsx
│ └── AuthLayout.tsx
│
├── main.tsx
└── vite-env.d.ts
