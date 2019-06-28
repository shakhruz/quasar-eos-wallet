
const routes = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      // { path: '/todo', component: () => import('pages/PageTodo.vue') },
      // { path: '/settings', component: () => import('pages/PageSettings.vue') },
      // { path: '/TokenAdmin', component: () => import('pages/PageTokenAdmin.vue') },
      // { path: '/TokenSale', component: () => import('pages/PageTokenSale.vue') },
      // { path: '/TokenContract', component: () => import('pages/PageTokenContract.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
